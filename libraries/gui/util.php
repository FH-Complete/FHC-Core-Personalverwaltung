<?php


function string2Date($datestring)
{
    $date = DateTimeImmutable::createFromFormat('Y-m-d', $datestring);
    if ($date === false) return null;
    return $date->format('Y-m-d');
}