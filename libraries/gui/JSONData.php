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
            $target = filter_var($decoded[$attributeName], FILTER_SANITIZE_STRING);
            return true;
        }
        return false;
    }

    /**
     * Sanitize Strind and convert empty string to null. Workaround for 
     * filter_var('', FILTER_VALIDATE_INT, FILTER_FLAG_EMPTY_STRING_NULL); which is only
     * available in PHP >= 8.0
     */
    protected function getJSONDataString_EmptyNull(&$target, &$decoded, $attributeName)
    {
        if (isset($decoded[$attributeName]))
        {
            $target = filter_var($decoded[$attributeName], FILTER_SANITIZE_STRING);
            if ($target == '')
            {
                $target = null;
            }
            return true;
        }
        $target = null;
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
