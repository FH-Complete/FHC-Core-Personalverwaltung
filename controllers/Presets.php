<?php
if (! defined('BASEPATH')) exit('No direct script access allowed');

class Presets extends Auth_Controller
{
    const DEFAULT_PERMISSION = 'basis/mitarbeiter:r';
    /**
     * Constructor
     */
    public function __construct()
    {
	parent::__construct(array(
		'index'=> self::DEFAULT_PERMISSION	)
	);
	$this->load->config('extensions/FHC-Core-Personalverwaltung/presets');
    }

    /**
     * Index Controller
     * @return void
     */
    public function index()
    {
	ob_clean();
	header('Content-Type: application/javascript');

	$basedir = $this->config->item('PRESETS_BASEDIR');
	$baselocation = $this->config->item('PRESETS_BASELOCATION');
	
	$presets = array(
		'neuanlage' => array(),
		'aenderung' => array(),
		'korrektur' => array()
	);

	foreach (array_keys($presets) as $dir)
	{
		$diriterator = new DirectoryIterator($basedir . '/' . $dir);
		foreach ($diriterator as $fileInfo)
		{
			if($fileInfo->isFile() && $fileInfo->getExtension() === 'js')
			{
				$key = $dir . '_' . $fileInfo->getBasename('.js'); 
				$presets[$dir][$key] = $baselocation . '/' . $dir . '/' 
					. $fileInfo->getFilename();
			}
		}
		ksort($presets[$dir]);
	}

	$presetsjson = array();

	foreach ($presets as $category => $categorypresets)
	{
		$presetsjson[$category] = array_keys($categorypresets);
		foreach($categorypresets as $preset => $presetfile)
		{
			echo "import {$preset} from '{$presetfile}';\n";
		}
		echo "\n";
	}

	echo "export default " . str_replace('"', '', 
		json_encode($presetsjson, JSON_PRETTY_PRINT));
	return;
    }
}
