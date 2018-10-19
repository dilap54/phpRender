<?php
/**
 * Функция умножения двух матриц
 */
function matrixmult($m1,$m2){
      $r=count($m1);
      if (!is_array($m1[0])){
            for ($i=0; $i<$r; $i++){
                  $m1[$i] = array($m1[$i]);
            }
      }
      $c=count($m2[0]);
	$p=count($m2);
      if (!is_array($m2[0])){
            for ($i=0; $i<$p; $i++){
                  $m2[$i] = array($m2[$i]);
            }
      }
	$c=count($m2[0]);
	$p=count($m2);
	if(count($m1[0])!=$p){throw new Exception('Incompatible matrixes');}
	$m3=array();
	for ($i=0;$i< $r;$i++){
		for($j=0;$j<$c;$j++){
			$m3[$i][$j]=0;
			for($k=0;$k<$p;$k++){
				$m3[$i][$j]+=$m1[$i][$k]*$m2[$k][$j];
			}
		}
      }
      if (count($m3[0]) == 1){
            for ($i=0; $i<count($m3); $i++){
                  $m3[$i] = $m3[$i][0];
            }
      }
	return($m3);
}

class Object3d {
      private $file_name;
      private $file_content;
      private $vertexes = array(array(null, null, null, null));
      private $projectionVertexes = array(array(null, null, null, null));
      private $projectionNormals = array();
      private $faces = array();
      private $normals = array(array(null, null, null, null));
      private $VTs = array();
      private $zbuffer = array();
      
      /**Z координата центра камеры */
      public $Zk = 2;
      /**Расстояние от центра камеры до плоскости проецирования */
      public $Zpl = -1;
      public $rotateX = 0.2;
      public $rotateY = 0.2;
      public $rotateZ = 0;
      public $movX = 0;
      public $movY = -0.3;
      public $movZ = 0;

      function __construct($file_name){
            $this->file_name = $file_name;
            $this->file_content = file($file_name);
            $this->parse_obj($this->file_content);
      }
      /**
       * Парсинг Obj файла и сохранение результата парсинга в поля класса
       */
      function parse_obj($file_content){
            for ($i = 0; $i<count($file_content); $i++){//Идем по всем строкам
                  //Если строка пустая или начинается с комментария, то пропускаем
                  if (($file_content[$i] == "" || substr($file_content[$i],0,1) == "#")){
                        continue;
                  }
                  //Разбиваем строку на части по пробелу
                  $arr = explode(" ", trim($file_content[$i]));
                  if (count($arr) <= 1){
                        continue;
                  }

                  //Убираем пустые части
                  $newArr = array();
                  for ($j=0; $j<count($arr); $j++){
                        if (strlen($arr[$j])>0){
                              $newArr[] = $arr[$j];
                        }
                  }
                  $arr = $newArr;

                  if ($arr[0] == "v"){//Парсинг вершин
                        $vertex = array(floatval($arr[1]), floatval($arr[2]), floatval($arr[3]), 1);
                        $this->vertexes[] = $vertex;
                  } elseif ($arr[0] == "f") {//Парсинг поверхростей
                        $face = array();
                        for ($j=1; $j<count($arr); $j++){//Каждая точка поверхности
                              $facePoint = explode("/", $arr[$j]);//Разделение точки на составляющие
                              $face[] = array(
                                    "pos" => intval($facePoint[0]), //Индекс вершины
                                    "norm" => intval($facePoint[2]), //Индекс нормали
                                    "texture" => intval($facePoint[1]) //Индекс координат текстуры
                              );
                        }

                        if (count($face) == 3){
                              $this->faces[] = $face;
                        } elseif (count($face) == 4){
                              $this->faces[] = array($face[0], $face[1], $face[2]);
                              $this->faces[] = array($face[2], $face[3], $face[0]);
                        }
                  } elseif ($arr[0] == "vn"){
                        $normal = array(
                              floatval($arr[1]),
                              floatval($arr[2]),
                              floatval($arr[3]),
                              0
                        );
                        $this->normals[] = $normal;
                  } elseif ($arr[0] == "vt"){
                        $vt = array(
                              floatval($arr[1]),
                              1-floatval($arr[2])
                        );
                        $this->VTs[] = $vt;
                  }
            }
      }
      
      public function buildProjectionVertexes(){
            
            /**
             * Матрицы поворота
             */

            $radX = $this->rotateX*M_PI;
            $radY = $this->rotateY*M_PI;
            $radZ = $this->rotateZ*M_PI;

            $rotateXMatrix = array(
                  array(1, 0, 0, 0),
                  array(0, cos($radX), -sin($radX), 0),
                  array(0, sin($radX), cos($radX), 0),
                  array(0, 0, 0, 1)
            );
            $rotateYMatrix = array(
                  array(cos($radY), 0, sin($radY), 0),
                  array(0, 1, 0, 0),
                  array(-sin($radY), 0, cos($radY), 0),
                  array(0, 0, 0, 1)
            );
            $rotateZMatrix = array(
                  array(cos($radZ), -sin($radZ), 0, 0),
                  array(sin($radZ), cos($radZ), 0, 0),
                  array(0, 0, 1, 0),
                  array(0, 0, 0, 1)
            );
            $rotateMatrix = matrixmult($rotateXMatrix, $rotateYMatrix);
            $rotateMatrix = matrixmult($rotateMatrix, $rotateZMatrix);

            /**
             * Матрицы перемещения
             */

             $moveMatrix = array(
                   array(1, 0, 0, $this->movX),
                   array(0, 1, 0, $this->movY),
                   array(0, 0, 1, $this->movZ),
                   array(0, 0, 0, 1)
             );

             /**Итоговая матрица без проекции */
             $transformMatrix = matrixmult($moveMatrix, $rotateMatrix);

             /**
              * Построение новых вершин
              */
            $this->projectionVertexes = array(count($this->vertexes));
            $vertexesLength = count($this->vertexes);
            for ($i=1; $i<$vertexesLength; $i++){
                  
                  $transformedVertex = matrixmult($transformMatrix, $this->vertexes[$i]);
                  $projectionMatrix = array(
                        array(($this->Zk-$this->Zpl)/($this->Zk-$transformedVertex[2][0]), 0, 0, 0),
                        array(0, ($this->Zk-$this->Zpl)/($this->Zk-$transformedVertex[2][0]), 0, 0),
                        array(0, 0, 1, 1),
                        array(0, 0, 0, 1)
                  );
                  $transformedVertex = matrixmult($projectionMatrix, $transformedVertex);
                  
                  
                  $this->projectionVertexes[$i] = $transformedVertex;
            }

            $this->projectionNormals = array($this->normals);
            $normalsLength = count($this->normals);
            for ($i=1; $i<$normalsLength; $i++){
                  $this->projectionNormals[$i] = matrixmult($rotateMatrix, $this->normals[$i]);
            }
      }

      function line($x0, $y0, $x1, $y1, $image){
            $steep = abs($x0-$x1) < abs($y0-$y1);
            $tmp;
            if ($steep){
                  $tmp = $x0;
                  $x0 = $y0;
                  $y0 = $tmp;

                  $tmp = $x1;
                  $x1 = $y1;
                  $y1 = $tmp;
            }
            if ($x0 > $x1){
                  $tmp = $x0;
                  $x0 = $x1;
                  $x1 = $tmp;

                  $tmp = $y0;
                  $y0 = $y1;
                  $y1 = $tmp;
            }

            $deltaX = abs($x1-$x0);
            $deltaY = abs($y1-$y0);
            $error = 0;
            $deltaerr = $deltaY;
            $y =  $y0;
            for ($x=$x0; $x<=$x1; $x++){
                  if ($steep){
                        imagesetpixel($image, $y, $x, imagecolorallocate($image, 0, 0, 0));
                  } else {
                        imagesetpixel($image, $x, $y, imagecolorallocate($image, 0, 0, 0));
                  }

                  $error += $deltaerr;
                  if (2*$error >= $deltaX){
                        if ($y0 > $y1){
                              $y--;
                        } else {
                              $y++;
                        }

                        $error -= $deltaX;
                  }
                  
                 
            }
      }

      function getNormalVector($face){
            $firstTriangleVector = array(
                  "px" => $face[1]["px"]-$face[0]["px"],
                  "py" => $face[1]["py"]-$face[0]["py"],
                  "pz" => $face[1]["pz"]-$face[0]["pz"]
            );
            $secondTriangleVector = array(
                  "px" => $face[2]["px"]-$face[0]["px"],
                  "py" => $face[2]["py"]-$face[0]["py"],
                  "pz" => $face[2]["pz"]-$face[0]["pz"]
            );
            $normalVector = array(
                  $firstTriangleVector["py"]*$secondTriangleVector["pz"]-$firstTriangleVector["pz"]*$secondTriangleVector["py"],
                  -($firstTriangleVector["px"]*$secondTriangleVector["pz"]-$firstTriangleVector["pz"]*$secondTriangleVector["px"]),
                  $firstTriangleVector["px"]*$secondTriangleVector["py"]-$firstTriangleVector["py"]*$secondTriangleVector["px"]
            );
            $normalLength = sqrt($normalVector[0]*$normalVector[0]+$normalVector[1]*$normalVector[1]+$normalVector[2]*$normalVector[2]);
            $normalVector = array(
                  $normalVector[0]/$normalLength,
                  $normalVector[1]/$normalLength,
                  $normalVector[2]/$normalLength,
            );
            return $normalVector;
      }

      public function paint($width, $heigth, $image){
            $this->zbuffer = array_fill(0, $width*$heigth, -INF);
            $aspect = min($width, $heigth);
            $width2 = $width >> 1;
            $heigth2 = $heigth >> 1;
            $w = $aspect / 2;
            $h = -$aspect / 2;
            $facesLength = count($this->faces);
            for ($i = 0; $i<$facesLength; $i++){
                  for ($j = 0; $j < 3; $j++){
                        $face[$j] = array(
                              "px" => $this->projectionVertexes[$this->faces[$i][$j]["pos"]][0],
                              "py" => $this->projectionVertexes[$this->faces[$i][$j]["pos"]][1],
                              "pz" => $this->projectionVertexes[$this->faces[$i][$j]["pos"]][2],
                              "nx" => (is_array($this->projectionNormals[$this->faces[$i][$j]["norm"]]) ? $this->projectionNormals[$this->faces[$i][$j]["norm"]][0] : 0),
                              "ny" => (is_array($this->projectionNormals[$this->faces[$i][$j]["norm"]]) ? $this->projectionNormals[$this->faces[$i][$j]["norm"]][1] : 0),
                              "nz" => (is_array($this->projectionNormals[$this->faces[$i][$j]["norm"]]) ? $this->projectionNormals[$this->faces[$i][$j]["norm"]][2] : 0),
                        );
                  }

                  $normalVector = $this->getNormalVector($face);

                  if ($normalVector[2] > 0 && ($face[0]["py"] != $face[1]["py"] || $face[0]["py"] != $face[2]["py"])){
                        $shadeOfGray = 1;
                        $shadeOfGray = $normalVector[2];
                        
                        //Обработка точек face'а перед отрисовкой
                        for ($j=0; $j<3; $j++){
                              //Переход в экранные координаты
                              $face[$j]["px"] = $face[$j]["px"]*$w+$width2;
                              $face[$j]["py"] = round($face[$j]["py"]*$h+$heigth2);
                        }
      
                        /**
                         * Отрисовка поверхностей
                         */

                        $t0 = $face[0];
                        $t1 = $face[1];
                        $t2 = $face[2];

                        if ($t0["py"]>$t1["py"]){
                              $tt = $t0;
                              $t0 = $t1;
                              $t1 = $tt;
                        }
                        if ($t0["py"]>$t2["py"]){
                              $tt = $t0;
                              $t0 = $t2;
                              $t2 = $tt;
                        }
                        if ($t1["py"]>$t2["py"]){
                              $tt = $t1;
                              $t1 = $t2;
                              $t2 = $tt;
                        }

                        $totalHeight = $t2["py"]-$t0["py"]+1;
                        if ($t0["py"]<0){
                              $t0["py"] = 0;
                        }
                        if ($t2["py"]>$heigth){
                              $t2["py"] = $heigth;
                        }

                        $t2minust0 = array(
                              "px" => $t2["px"]-$t0["px"],
                              "py" => $t2["py"]-$t0["py"],
                              "pz" => $t2["pz"]-$t0["pz"],
                              "nx" => $t2["nx"]-$t0["nx"],
                              "ny" => $t2["ny"]-$t0["ny"],
                              "nz" => $t2["nz"]-$t0["nz"]
                        );

                        $t2minust1 = array(
                              "px" => $t2["px"]-$t1["px"],
                              "py" => $t2["py"]-$t1["py"],
                              "pz" => $t2["pz"]-$t1["pz"],
                              "nx" => $t2["nx"]-$t1["nx"],
                              "ny" => $t2["ny"]-$t1["ny"],
                              "nz" => $t2["nz"]-$t1["nz"]
                        );

                        $t1minust0 = array(
                              "px" => $t1["px"]-$t0["px"],
                              "py" => $t1["py"]-$t0["py"],
                              "pz" => $t1["pz"]-$t0["pz"],
                              "nx" => $t1["nx"]-$t0["nx"],
                              "ny" => $t1["ny"]-$t0["ny"],
                              "nz" => $t1["nz"]-$t0["nz"]
                        );

                        $A; $B; $alpha = 1; $beta = 1;
                        for ($y = $t0["py"]; $y<=$t2["py"]; $y++){//Каждая строка в изображении
                              $secondHalf = $y>$t1["py"] || $t1["py"] == $t0["py"];
                              $segmentHeight = ($secondHalf) ? $t2["py"]-$t1["py"]+1 : $t1["py"]-$t0["py"]+1;
                              if ($segmentHeight == 0){
                                    $segmentHeight = 1;
                              }
                              $alpha = ($y-$t0["py"])/$totalHeight;
                              $beta = ($secondHalf) ? ($y-$t1["py"])/$segmentHeight : ($y-$t0["py"])/$segmentHeight;
                              $A = array(
                                    "px" => floor($t2minust0["px"]*$alpha+$t0["px"]),
                                    "py" => floor($t2minust0["py"]*$alpha+$t0["py"])|0,
                                    "pz" => $t2minust0["pz"]*$alpha+$t0["pz"],
                                    "nx" => $t2minust0["nx"]*$alpha+$t0["nx"],
                                    "ny" => $t2minust0["ny"]*$alpha+$t0["ny"],
                                    "nz" => $t2minust0["nz"]*$alpha+$t0["nz"]
                              );
                              if ($secondHalf){
                                    $B = array(
                                          "px" => floor($t2minust1["px"]*$beta+$t1["px"]),
                                          "py" => floor($t2minust1["py"]*$beta+$t1["py"]),
                                          "pz" => $t2minust1["pz"]*$beta+$t1["pz"],
                                          "nx" => $t2minust1["nx"]*$beta+$t1["nx"],
                                          "ny" => $t2minust1["ny"]*$beta+$t1["ny"],
                                          "nz" => $t2minust1["nz"]*$beta+$t1["nz"]
                                    );
                              } else {
                                    $B = array(
                                          "px" => floor($t1minust0["px"]*$beta+$t0["px"]),
                                          "py" => floor($t1minust0["py"]*$beta+$t0["py"]),
                                          "pz" => $t1minust0["pz"]*$beta+$t0["pz"],
                                          "nx" => $t1minust0["nx"]*$beta+$t0["nx"],
                                          "ny" => $t1minust0["ny"]*$beta+$t0["ny"],
                                          "nz" => $t1minust0["nz"]*$beta+$t0["nz"]
                                    );
                              }
                              if ($A["px"]>$B["px"]){
                                    $tt = $A;
                                    $A = $B;
                                    $B = $tt;
                              }
                              if ($A["px"]<0){
                                    $A["px"] = 0;
                              }
                              if ($B["px"]>$width){
                                    $B["px"] = $width;
                              }
                              $z = 0; $ywidth = $y*$width;
                              $apxEqualBpx = ($A["px"] == $B["px"]);
                              $bpzMinusApz = $B["pz"]-$A["pz"];
                              $phi = 1;
                              for ($j = $A["px"]; $j<$B["px"]; $j++){//Каждый пиксель
                                    if ($apxEqualBpx){
                                          $phi = 1;
                                    } else {
                                          $phi = ($j-$A["px"])/($B["px"]-$A["px"]);
                                    }
                                    $z = $A["pz"]+($bpzMinusApz)*$phi;

                                    $idx = $ywidth+$j;

                                    $color = imagecolorallocate($image, round(250*$shadeOfGray), round(250*$shadeOfGray), round(250*$shadeOfGray));
                                    
                                    if ($this->zbuffer[$idx]<$z){
                                          $this->zbuffer[$idx] = $z;
                                          imagesetpixel($image, $j, $y, $color);
                                    }
                              }
                        }

                        /**
                         * Отрисовка ребер
                         */
                        $x = round($face[0]["px"]);
                        $y = round($face[0]["py"]);
      
                        for ($j=1; $j<=count($face); $j++){
                              $x1 = round($face[$j%count($face)]["px"]);
                              $y1 = round($face[$j%count($face)]["py"]);
                              $this->line($x, $y, $x1, $y1, $image);
                              $x = $x1; $y = $y1;
                        }
      
                  }
            }
      }
}
$object3d = new Object3d('files/Teapot.obj');

$image = @imagecreatetruecolor(600, 300)
      or die('Невозможно инициализировать GD поток');
imagefill($image, 0, 0, imagecolorallocate($image, 255, 255, 255));

$object3d->buildProjectionVertexes();
$object3d->paint(600, 300, $image);

header ('Content-Type: image/png');
imagepng($image);
imagedestroy($image);
?>