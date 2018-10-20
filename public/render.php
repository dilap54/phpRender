<?php
/**
 * http://192.168.1.111:3334/render.php?ZKplDiff=3&Zk=3&rotateX=0&rotateY=0&rotateZ=0&movX=0&movY=0&movZ=0&width=893&height=480&modelId=1&fill&perspective
 */
    require_once('Renderer.php');
    require_once('db.php');

    if (isset($_GET["modelId"])){
        $modelId = intval($_GET["modelId"]);
    } else {
        http_response_code(400);
        exit();
    }
    
    
    $sqlresult = $db->query("SELECT * FROM `models` WHERE (`id` = " . $modelId . ") LIMIT 1;");
    $row = $sqlresult->fetch_assoc();

    $renderer = new Renderer("files/" . $row["filename"]);

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
    if (isset($_GET["fill"])){
        $renderer->fill = true;
    }
    if (isset($_GET["stroke"])){
        $renderer->stroke = true;
    }
    if (isset($_GET["perspective"])){
        $renderer->perspective = true;
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