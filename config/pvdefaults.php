<?php
/*
 *  PV_DEFAULT_STANDORT_ID
 *  public.tbl_standort.standort_id 
 *  if 0 then no standort_id is set in public.tbl_mitarbeiter
 */
$config['PV_DEFAULT_STANDORT_ID'] = 0;

/*
 * --------------------------------------------------------------------------
 * send Mails for WeiterbildungExpire
 * --------------------------------------------------------------------------
 *
 * Send email message to employee about expiration of training certificate.
 *
 */

$config['PV_SEND_WEITERBILDUNG_EXPIRE_MAILS'] = true;

/*
 * --------------------------------------------------------------------------
 * days before a reminder mail for will be sent
 * --------------------------------------------------------------------------
 * 
 * array(90,60,30) means that 3 reminders will be sent: 90 days before expiration, 60 days, etc.
 */
$config['PV_WEITERBILDUNG_REMINDER'] = array(90,60,30);
