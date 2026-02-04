<?php
/**
 * Valorisation method: valorisation increase in steps ("gestaffelt"), e.g. first 1000 7%, second 1500 5%, rest 2%
 */
class ValorisierungGestaffelt extends AbstractValorisationMethod
{
	const DEBUG = false;

	protected $wochenstunden;
	protected $valorisation;

	protected $fulltimehours;

	protected $gehaltstypen;
	protected $gbsforval;
	protected $buckets;
	protected $scalefactor_fte2pt;

	public function __construct()
	{
		parent::__construct();
		$this->wochenstunden = null;
		$this->valorisation = 0;
		$this->fulltimehours = $this->ci->config->item('VAL_FULLTIME_HOURS');
		$this->gbsforval = array();
		$this->gehaltstypen = array();
		$this->buckets = array();
		$this->scalefactor_fte2pt = 1;
	}

	public function checkParams()
	{
		parent::checkParams();
		if( !isset($this->params->valorisierung->stufen) || !is_array($this->params->valorisierung->stufen) )
		{
			throw new Exception('Parameter stufen missing or not an array');
		}
	}

	public function calculateValorisation()
	{
		$this->fetchWochenstunden();
		$this->calcScaleFactor_FTE2PT();
		$this->fetchGehaltstypen();
		$this->prepareBuckets();
		$this->prepareGehaltsbestandteileForValorisierung();
		$this->distributeGehaltsbestandteileToBuckets();
		$this->calcValorisationForGehaltsbestandteile();
		$this->distributeValorisationToGehaltsbestandteile();
	}

	protected function prepareBuckets()
	{
		foreach($this->params->valorisierung->stufen as $stufe)
		{
			$this->buckets[] = (object) array(
				'prozent' => $stufe->prozent,
				'obergrenze' => $stufe->obergrenze,
				'untergrenze' => $stufe->untergrenze,
				'sumslices' => 0,
				'slices' => array()
			);
		}

		if(self::DEBUG)
		{
			print_r($this->buckets);
			echo PHP_EOL;
		}
	}

	protected function prepareGehaltsbestandteileForValorisierung()
	{
		$gbs = $this->getGehaltsbestandteileForValorisierung(self::NUR_ZU_VALORISIERENDE_UND_UNGESPERRTE_GBS);
		foreach($gbs as $gb)
		{
			$gb instanceof \vertragsbestandteil\Gehaltsbestandteil;
			$sort = isset($this->gehaltstypen[$gb->getGehaltstyp_kurzbz()])
				? $this->gehaltstypen[$gb->getGehaltstyp_kurzbz()]
				: 99;
			$this->gbsforval[$gb->getGehaltsbestandteil_id()] = (object) array(
				"gehaltsbestandteil_id" => $gb->getGehaltsbestandteil_id(),
				"gehaltsbestandteiltyp_kurzbz" => $gb->getGehaltstyp_kurzbz(),
				"betrag_valorisiert" => $this->scaleGehaltsbestandteilFTE($gb->getBetrag_valorisiert()),
				"valorisierung" => 0,
				"sort" => $sort
			);
		}
		uasort($this->gbsforval, function($a, $b) {
			return $a->sort - $b->sort;
		});

		if(self::DEBUG)
		{
			print_r($this->gbsforval);
			echo PHP_EOL;
		}
	}

	protected function distributeGehaltsbestandteileToBuckets()
	{
		$bucketIterator = new ArrayIterator($this->buckets);
		$curbucket = $bucketIterator->current();

		foreach($this->gbsforval as $gb)
		{
			$betrag = $gb->betrag_valorisiert;
			while($betrag > 0)
			{
				if($curbucket->obergrenze === NULL) {
					$valorisierung = $betrag * ($curbucket->prozent / 100);
					$valorisierung_scaled = $valorisierung * $this->scalefactor_fte2pt;
					$this->valorisation += $valorisierung_scaled;
					$curbucket->slices[] = (object) array(
						'gehaltsbestandteil_id' => $gb->gehaltsbestandteil_id,
						'betrag' => $betrag,
						'valorisierung' => $valorisierung,
						'valorisierung_scaled' => $valorisierung_scaled
					);
					$curbucket->sumslices += $betrag;
					$betrag -= $betrag;
				}
				else
				{
					$spaceinbucket = ($curbucket->obergrenze - $curbucket->untergrenze) - $curbucket->sumslices;
					if($betrag < $spaceinbucket)
					{
						$valorisierung = $betrag * ($curbucket->prozent / 100);
						$valorisierung_scaled = $valorisierung * $this->scalefactor_fte2pt;
						$this->valorisation += $valorisierung_scaled;
						$curbucket->slices[] = (object) array(
							'gehaltsbestandteil_id' => $gb->gehaltsbestandteil_id,
							'betrag' => $betrag,
							'valorisierung' => $valorisierung,
							'valorisierung_scaled' => $valorisierung_scaled
						);
						$curbucket->sumslices += $betrag;
						$betrag -= $betrag;
					}
					else
					{
						$valorisierung = $spaceinbucket * ($curbucket->prozent / 100);
						$valorisierung_scaled = $valorisierung * $this->scalefactor_fte2pt;
						$this->valorisation += $valorisierung_scaled;
						$curbucket->slices[] = (object) array(
							'gehaltsbestandteil_id' => $gb->gehaltsbestandteil_id,
							'betrag' => $spaceinbucket,
							'valorisierung' => $valorisierung,
							'valorisierung_scaled' => $valorisierung_scaled
						);
						$curbucket->sumslices += $spaceinbucket;
						$betrag -= $spaceinbucket;
						$bucketIterator->next();
						$curbucket = $bucketIterator->current();
					}
				}
			}
		}

		if(self::DEBUG)
		{
			print_r($this->buckets);
			echo PHP_EOL;
			echo "Valorisierung: " . $this->valorisation . PHP_EOL;
		}
	}

	protected function calcValorisationForGehaltsbestandteile()
	{
		foreach($this->buckets as $bucket) 
		{
			foreach($bucket->slices as $slice)
			{
				$this->gbsforval[$slice->gehaltsbestandteil_id]->valorisierung += $slice->valorisierung_scaled;
			}
		}

		if(self::DEBUG)
		{
			print_r($this->gbsforval);
			echo PHP_EOL;
		}
	}

	protected function calcScaleFactor_FTE2PT()
	{
		if( $this->wochenstunden < floatval($this->fulltimehours)
			&& $this->wochenstunden > 0
			&& floatval($this->fulltimehours) > 0 )
		{
			// get scale factor if week hours are under fulltime hours
			$this->scalefactor_fte2pt = 1 / floatval($this->fulltimehours) * floatval($this->wochenstunden);
		}

		if(self::DEBUG)
		{
			echo "ScaleFactor FTE2PT: " . $this->scalefactor_fte2pt . PHP_EOL;
		}
	}

	protected function fetchGehaltstypen()
	{
		$this->ci->load->model('vertragsbestandteil/GehaltsTyp_model');
		$gtmodel = $this->ci->GehaltsTyp_model;
		$gtmodel->addOrder('sort', 'ASC');
		$res = $gtmodel->load();
		$gts = getData($res);

		if(!is_array($gts))
		{
			return;
		}

		foreach($gts as $gt)
		{
			$this->gehaltstypen[$gt->gehaltstyp_kurzbz] = $gt->sort;
		}

		if(self::DEBUG)
		{
			print_r($this->gehaltstypen);
			echo PHP_EOL;
		}
	}

	protected function fetchWochenstunden()
	{
		foreach($this->vertragsbestandteile as $vb)
		{
			if( $vb->getVertragsbestandteiltyp_kurzbz() === 'stunden' )
			{
				if( $vb->getTeilzeittyp_kurzbz() === 'altersteilzeit' )
				{
					$lvbbatz = $this->ci->VertragsbestandteilLib->fetchLastVertragsbestandteilStundenBeforeAltersteilzeit($vb->getDienstverhaeltnis_id());
					if($lvbbatz)
					{
						$this->wochenstunden = $lvbbatz->getWochenstunden();
					}
					else
					{
						throw new Exception(__CLASS__ . ' can not determine ATZ Wochenstunden.');
					}
				}
				else
				{
					$this->wochenstunden = $vb->getWochenstunden();
				}
			}
		}

		if(self::DEBUG)
		{
			echo "Wochenstunden: " . $this->wochenstunden . PHP_EOL;
			echo "Vollzeitstunden: " . $this->fulltimehours . PHP_EOL;
		}
	}

	protected function scaleGehaltsbestandteilFTE($betrag_valorisiert)
	{
		// if week hours are under full time hours
		if( floatval($this->wochenstunden) < floatval($this->fulltimehours)
			&& $this->wochenstunden > 0 && floatval($this->fulltimehours) > 0 )
		{
			// scale sum up to full time hours
			$scaled_betrag_valorisiert = $betrag_valorisiert / floatval($this->wochenstunden) * floatval($this->fulltimehours);
			return $scaled_betrag_valorisiert;
		}
		else
		{
			return $betrag_valorisiert;
		}
	}

	protected function distributeValorisationToGehaltsbestandteile()
	{
		// for each applicable Gehaltsbestandteil
		foreach ($this->getGehaltsbestandteileForValorisierung() as $gehaltsbestandteil)
		{
			$gehaltsbestandteil instanceof \vertragsbestandteil\Gehaltsbestandteil;

			// add valorisation part to valorisaiton amount
			$betrag_valorisiert =
				$gehaltsbestandteil->getBetrag_valorisiert()
				+ $this->gbsforval[$gehaltsbestandteil->getGehaltsbestandteil_id()]->valorisierung;

			$gehaltsbestandteil->setBetrag_valorisiert(round($betrag_valorisiert, 2));
		}
	}
}
