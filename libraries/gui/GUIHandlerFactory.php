<?php
require_once __DIR__ .'/FormData.php';
require_once __DIR__ .'/GUIDienstverhaeltnis.php';
require_once __DIR__ .'/GUIVertragsbestandteilStunden.php';
require_once __DIR__ .'/GUIVertragsbestandteilFunktion.php';
require_once __DIR__ .'/GUIVertragsbestandteilKuendigungsfrist.php';
require_once __DIR__ .'/GUIVertragsbestandteilZeitaufzeichnung.php';
require_once __DIR__ .'/GUIVertragsbestandteilFreitext.php';
require_once __DIR__ .'/GUIGehaltsbestandteil.php';

class GUIHandlerFactory {

    public static function getGUIHandler($type)
    {
		$handler = null;
        switch ($type) {
			case FormData::TYPE_STRING:
				$handler = new FormData();
				break;
            case GUIDienstverhaeltnis::TYPE_STRING:
                $handler = new GUIDienstverhaeltnis();
                break;
            case GUIVertragsbestandteilStunden::TYPE_STRING:
                $handler = new GUIVertragsbestandteilStunden();
                break;
            case GUIVertragsbestandteilFunktion::TYPE_STRING:
                $handler = new GUIVertragsbestandteilFunktion();
                break;
            case GUIVertragsbestandteilKuendigungsfrist::TYPE_STRING:
                $handler = new GUIVertragsbestandteilKuendigungsfrist();
                break;
            case GUIVertragsbestandteilZeitaufzeichnung::TYPE_STRING:
                $handler = new GUIVertragsbestandteilZeitaufzeichnung();
                break;
            case GUIVertragsbestandteilFreitext::TYPE_STRING:
                $handler = new GUIVertragsbestandteilFreitext();
                break;
			case GUIGehaltsbestandteil::TYPE_STRING:
				$handler = new GUIGehaltsbestandteil();
				break;
            default:
				throw new \Exception('type not found: '.$type);
        }        
		return $handler;
    }
}