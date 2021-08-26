<?php

defined('MOODLE_INTERNAL') || die();

function atto_clickview_params_for_js($elementid, $options, $fpoptions) {
	$params = array(
		'onlineUrl' => '//<~onlineHost~>',
		'consumerKey' => '<~consumerKey~>',
		'schoolId' => '',
		'allowIframe' => false
	);
	
	if (!empty($options['legacy']) or !empty($options['noclean']) or !empty($options['trusted'])) {
            $params['allowIframe'] = true;
        }
	
	return $params;
}