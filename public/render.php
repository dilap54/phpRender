<?php
/**
 * http://192.168.1.111:3334/render.php?Zk=1.5&ZKplDiff=1.5&rotateX=0.1&rotateY=-0.1&movY=-0.3&movZ=0.1&width=720&height=600
 */
    require_once('Renderer.php');

    $renderer = new Renderer('files/diablo3_pose.obj');

    if (isset($_GET["Zk"])){
        $renderer->Zk = $_GET["Zk"];
    }
    if (isset($_GET["ZKplDiff"])){
        $renderer->Zpl = $renderer->Zk - $_GET["ZKplDiff"];
    }
    if (isset($_GET["rotateX"])){
        $renderer->rotateX = $_GET["rotateX"];
    }
    if (isset($_GET["rotateY"])){
        $renderer->rotateY = $_GET["rotateY"];
    }
    if (isset($_GET["rotateZ"])){
        $renderer->rotateZ = $_GET["rotateZ"];
    }
    if (isset($_GET["movX"])){
        $renderer->movX = $_GET["movX"];
    }
    if (isset($_GET["movY"])){
        $renderer->movY = $_GET["movY"];
    }
    if (isset($_GET["movZ"])){
        $renderer->movZ = $_GET["movZ"];
    }

    $width = 600;
    $height = 300;
    if (isset($_GET["width"])){
        $width = $_GET["width"];
    }
    if (isset($_GET["height"])){
        $height = $_GET["height"];
    }
    $width = min($width, 1920);
    $height = min($height, 1080);
    $width = max($width, 30);
    $height = max($height, 30);

    $image = @imagecreatetruecolor($width, $height)
        or die('Невозможно инициализировать GD поток');
    imagefill($image, 0, 0, imagecolorallocate($image, 255, 255, 255));

    $renderer->buildProjectionVertexes();
    $renderer->paint($width, $height, $image);

    header ('Content-Type: image/png');
    imagepng($image);
    imagedestroy($image);
?>