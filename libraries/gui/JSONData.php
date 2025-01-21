<?php

trait JSONData {
    protected function getJSONData(&$target, &$decoded, $attributeName)
    {
        if (isset($decoded[$attributeName]))
        {
            $target = $decoded[$attributeName];
            return true;
        }
        return false;
    }

    protected function getJSONDataString(&$target, &$decoded, $attributeName)
    {
        if (isset($decoded[$attributeName]))
        {
            $target = htmlspecialchars($decoded[$attributeName]);
            return true;
        }
        return false;
    }

    protected function getJSONDataInt(&$target, &$decoded, $attributeName)
    {
        if (isset($decoded[$attributeName]) && 
			(false !== filter_var($decoded[$attributeName], FILTER_VALIDATE_INT)))
        {
            $target =  filter_var($decoded[$attributeName], FILTER_VALIDATE_INT);
            return true;
        }
        return false;
    }

    protected function getJSONDataFloat(&$target, &$decoded, $attributeName)
    {
        if (isset($decoded[$attributeName]) && 
			(false !== filter_var($decoded[$attributeName], FILTER_VALIDATE_FLOAT)))
        {
            $target =  $decoded[$attributeName];
            return true;
        }
        return false;
    }

    protected function getJSONDataBool(&$target, &$decoded, $attributeName)
    {
        if (isset($decoded[$attributeName]) 
			&& (null !== filter_var($decoded[$attributeName], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)) )
        {
            $target =  filter_var($decoded[$attributeName], FILTER_VALIDATE_BOOLEAN);
            return true;
        }
        return false;
    }
}
