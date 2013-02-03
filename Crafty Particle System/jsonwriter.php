<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

    $fileName = $_GET['fileName'];
	filter_var($fileName, FILTER_SANITIZE_STRING, FILTER_FLAG_STRIP_LOW);
    $json = $_POST['json'];
	
    $file = fopen('json/'.$fileName.'.json','x+');
    fwrite($file, $json);
    fclose($file);

    echo $json;
?>