<?php
/**
 * Description of ValorisierungLib
 *
 * @author bambi
 */
class ValorisierungLib
{
    protected $ci;

    public function __construct()
    {
		$this->ci =& get_instance();

		$this->ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanz_model');
		$this->ci->load->model('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisierungInstanzMethod_model');
		$this->ci->load->library('vertragsbestandteil/VertragsbestandteilLib', null, 'VertragsbestandteilLib');
		$this->ci->load->library('vertragsbestandteil/GehaltsbestandteilLib', null, 'GehaltsbestandteilLib');
		$this->ci->load->library('extensions/FHC-Core-Personalverwaltung/valorisierung/ValorisationFactory', null, 'ValorisationFactory');
    }

    public function findValorisierungInstanz($valorisierungInstanzKurzbz)
    {
		$valinstanz = $this->ci->ValorisierungInstanz_model->loadValorisierungInstanzByKurzbz($valorisierungInstanzKurzbz);
		if( $valinstanz === null )
		{
			throw new Exception('Valorisierungsinstanz ' . $valorisierungInstanzKurzbz . ' nicht gefunden');
		}
		return $valinstanz;
    }

    public function doValorisation($valorisierung_instanz, &$dvdata)
    {
		$dienstverhaeltnis = $this->ci->VertragsbestandteilLib->fetchDienstverhaeltnis($dvdata->dienstverhaeltnis_id);
		$vertragsbestandteile = $this->ci->VertragsbestandteilLib->fetchVertragsbestandteile(
			$dvdata->dienstverhaeltnis_id,
			$valorisierung_instanz->valorisierungsdatum,
			false
		);
		$gehaltsbestandteile = $this->ci->GehaltsbestandteilLib->fetchGehaltsbestandteile(
			$dvdata->dienstverhaeltnis_id,
			$valorisierung_instanz->valorisierungsdatum,
			false
		);

		$valinstanzmethoden = $this->ci->ValorisierungInstanzMethod_model->loadValorisierungInstanzByKurzbz($valorisierung_instanz->valorisierung_instanz_id);

		$usedvalinstances = array();
		foreach ($valinstanzmethoden as $valinstanzmethod)
		{
			$valmethod = $this->ci->ValorisationFactory->getValorisationMethod($valinstanzmethod->valorisierung_methode_kurzbz);
			$params = json_decode($valinstanzmethod->valorisierung_methode_parameter);
			$valmethod->initialize($dienstverhaeltnis, $vertragsbestandteile, $gehaltsbestandteile, $params);
			$valmethod->checkParams();

			if($valmethod->checkIfApplicable())
			{
				$usedvalinstances[] = array(
					'kurzbz' => $valinstanzmethod->valorisierung_methode_kurzbz,
					'method' => $valmethod
				);
			}
		}

		if(count($usedvalinstances) > 1)
		{
			throw new Exception('ERROR: more than one Valorisation Method applicable.');
		}

		 if(count($usedvalinstances) == 1)
		 {
			$usedvalinstanz = $usedvalinstances[0]['method'];
			$dvdata->valorisierungmethode = $usedvalinstances[0]['kurzbz'];
			$dvdata->sumsalarypreval = round($usedvalinstanz->calcSummeGehaltsbestandteile(), 2);
			$usedvalinstanz->doValorisation();
			$dvdata->sumsalarypostval = round($usedvalinstanz->calcSummeGehaltsbestandteile(), 2);
		 }
    }
}
