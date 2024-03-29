<?php

require_once __DIR__."/../../libraries/gui/GUIVertragsbestandteilFunktion.php";
require_once __DIR__."/../../libraries/gui/FormData.php";

use PHPUnit\Framework\TestCase;

class GUIVertragsbestandteilFunktionTest extends TestCase
{

	private static $CI;
	
    public function setUp()
    {
		error_reporting(E_ALL & ~E_STRICT & ~E_DEPRECATED);
		self::$CI =& get_instance();
        self::$CI->load->helper('hlp_common');
        self::$CI->load->helper('hlp_return_object');
	}
	
	public function testMapJSON_01()
	{
		$jsondata = file_get_contents(__DIR__.'/funktion01.json');
		$decoded = json_decode($jsondata, true);
		$formDataMapper = new FormData();
		$formDataMapper->mapJSON($decoded);
		// VBS
		$vbs = $formDataMapper->getVbs();
		$this->assertNotEmpty($vbs);
		$this->assertNotEmpty($vbs['fc5f4ab8-4652-40e4-9ac3-e76bbf7310af']);
        $vbsMapper = new GUIVertragsbestandteilFunktion();
		$vbsMapper->mapJSON($vbs['fc5f4ab8-4652-40e4-9ac3-e76bbf7310af']);
		$vbsData=$vbsMapper->getData();
		$this->assertNotEmpty($vbsData['funktion']);
		$this->assertEquals('Leitung', $vbsData['funktion']);
		// GBS
		$this->assertEmpty($vbsMapper->getGbs());

		
	}

	

}