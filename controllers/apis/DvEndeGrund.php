<?php

defined('BASEPATH') || exit('No direct script access allowed');

class DvEndeGrund extends Auth_Controller
{

    const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';
    // code igniter 
    protected $CI;

    public function __construct() {
        
        parent::__construct(
	    array(
		'index' => Self::DEFAULT_PERMISSION,
		'getDvEndeGruende' => self::DEFAULT_PERMISSION
	    )
	);
	
	$this->load->model('extensions/FHC-Core-Personalverwaltung/DvEndeGrund_model', 'DvEndeGrundModel');
    }

    function index()
    {}

    function getDvEndeGruende()
    {
	$this->DvEndeGrundModel->resetQuery();
	$this->DvEndeGrundModel->addSelect('dvendegrund_kurzbz AS value, bezeichnung AS label, NOT(aktiv) AS disabled');
	$this->DvEndeGrundModel->addOrder('sort', 'ASC');
	$dvendegruende = $this->DvEndeGrundModel->load();
	if( hasData($dvendegruende) )
	{
		$this->outputJson($dvendegruende);
		return;
	}
	else
	{
		$this->outputJsonError('no contract types found');
		return;
	}
    }
}