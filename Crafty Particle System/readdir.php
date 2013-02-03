<?php
if ($handle = opendir('json')) {
    while (false !== ($entry = readdir($handle))) {
        if ($entry != "." && $entry != "..") {
		    $entry = substr($entry, 0, -5);
            echo "$entry\n";
        }
    }
    closedir($handle);
}
?>