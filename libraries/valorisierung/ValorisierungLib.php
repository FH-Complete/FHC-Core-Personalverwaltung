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
}
