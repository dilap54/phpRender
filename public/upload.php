<?php
    require_once('db.php');

    $uploaddir = './files/';
    $filename = time();
    $uploadfile = $uploaddir . $filename;

    if(move_uploaded_file($_FILES['file']['tmp_name'], $uploadfile)){
        $db->query("INSERT INTO `models` (`filename`) VALUES ('". $filename ."')");
        http_response_code(201);
        echo $db->insert_id;
    } else {
        http_response_code(400);
    }
?>