/*global $ */
/*global math */
/*global Uint8ClampedArray */
/*global Float32Array */
/*global _ */
/*eslint-disable no-console */
var object3d;
function handleFileSelect(event){
	var file = event.target.files[0];
	var fr = new FileReader();
	fr.onload = function(ev){
		console.timeEnd('loading');
		object3d = new Object3d();
		object3d.parse(ev.target.result.split('\n'));
		object3d.element = document.getElementById('canvas');
		updateOptions();
		object3d.render();
	};
	fr.readAsText(file);
	console.time('loading');
}
function handleTextureSelect(event){
	var file = event.target.files[0];
	var image = new DataImage();
	var fr = new FileReader();
	fr.onload = function(ev){
		image.src = ev.target.result;
		object3d.setTexture(image);
	};
	fr.readAsDataURL(file);
}
//$.ajax('SanekNeutralPlateWrappedT.obj', {
//$.ajax('teapotTextured.obj', {
$.ajax('diablo3_pose.obj', {
//$.ajax('01_Male05_Neutral.obj', {
	success: function(data){
		object3d = new Object3d();
		//dTexture.src = 'SanekNeutralPlateWrappedT_u1_v1.jpg';
		//dTexture.src = 'teapotTexture2.png';
		dTexture.src = 'diablo3_pose_diffuse.png';
		//dTexture.src = 'Male_05_Neutral_Colour.jpg';
		object3d.parse(data.split('\n'));
		object3d.element = document.getElementById('canvas');
		updateOptions();
		//object3d.render();
	}
});
var dTexture = new Image();
dTexture.onload = function(){
	object3d.setTexture(dTexture);
	object3d.render();
};
/*
var Color = function(){
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.a = 255;
};
*/
var DataImage = function(width, height){
	this.height = height;
	this.width = width;
	this.data = new Uint8ClampedArray(this.height*this.width*4);
	this.set = function(x, y, color){
		if ((x>0) && (y>0) && (x<this.width) && (y<this.width)){
			//x = Math.round(x);
			//y = Math.round(y);
			var offset = this.width*y*4+x*4;
			this.data[offset] = color.r;
			this.data[offset+1] = color.g;
			this.data[offset+2] = color.b;
			this.data[offset+3] = color.a;
		}
	};
	this.get = function(x,y,obj){
		//y = this.height-y;
		var offset = this.width*y*4+x*4;
		if (typeof obj == 'undefined'){
			return {
				r: this.data[offset],
				g: this.data[offset+1],
				b: this.data[offset+2],
				a: this.data[offset+3]
			};
		}
		else{
			obj.r = this.data[offset];
			obj.g = this.data[offset+1];
			obj.b = this.data[offset+2];
			obj.a = this.data[offset+3];
			return;
		}
	};
	this.getImageData = function(){
		return new ImageData(this.data, this.width, this.height);
	};
	this.setImageData = function(imageData){
		this.data = new Uint8ClampedArray(imageData.data);
		this.height = imageData.height;
		this.width = imageData.width;
	};
};
//var copy = 0;
function Point(p,n,t){
	this.px = 0;
	this.py = 0;
	this.pz = 0;
	this.nx = 0;
	this.ny = 0;
	this.nz = 0;
	this.tx = 0;
	this.ty = 0;
	this.shadeOfGray = 1;
	this.set = function(p,n,t){
		this.px = Number(p[0]);
		this.py = Number(p[1]);
		this.pz = Number(p[2]);
		if (n !== undefined){
			this.nx = Number(n[0]);
			this.ny = Number(n[1]);
			this.nz = Number(n[2]);
		}
		if (t !== undefined){
			this.tx = Number(t[0]);
			this.ty = Number(t[1]);
		}
	};
	this.setP = function(px, py, pz, nx, ny, nz, tx, ty, shadeOfGray){
		this.px = px;
		this.py = py;
		this.pz = pz;
		this.nx = nx;
		this.ny = ny;
		this.nz = nz;
		this.tx = tx;
		this.ty = ty;
		this.shadeOfGray = shadeOfGray;
	};
	this.copy = function(){
		var newPoint = new Point();
		newPoint.px = this.px;
		newPoint.py = this.py;
		newPoint.pz = this.pz;
		newPoint.nx = this.nx;
		newPoint.ny = this.ny;
		newPoint.nz = this.nz;
		newPoint.tx = this.tx;
		newPoint.ty = this.ty;
		newPoint.shadeOfGray = this.shadeOfGray;
		return newPoint;
	};
	this.plus = function(point){
		this.px += point.px;
		this.py += point.py;
		this.pz += point.pz;
		this.nx += point.nx;
		this.ny += point.ny;
		this.nz += point.nz;
		this.tx += point.tx;
		this.ty += point.ty;
		this.shadeOfGray += point.shadeOfGray;
		return this;
	};
	this.minus = function(point){
		this.px -= point.px;
		this.py -= point.py;
		this.pz -= point.pz;
		this.nx -= point.nx;
		this.ny -= point.ny;
		this.nz -= point.nz;
		this.tx -= point.tx;
		this.ty -= point.ty;
		this.shadeOfGray -= point.shadeOfGray;
		return this;
	};
	this.multiply = function(k){
		this.px *= k;
		this.py *= k;
		this.pz *= k;
		this.nx *= k;
		this.ny *= k;
		this.nz *= k;
		this.tx *= k;
		this.ty *= k;
		this.shadeOfGray *= k;
		return this;
	};
	this.floor = function(){
		/*
		this.px = Math.floor(this.px);
		this.py = Math.floor(this.py);
		*/
		this.px = this.px | 0;
		this.py = this.py | 0;
		return this;
	};
	this.round = function(){
		this.px = Math.round(this.px);
		this.py = Math.round(this.py);
		return this;
	};
	this.normalFrom = function(x, y, z){
		var length = Math.sqrt(x*x+y*y+z*z);
		x/=length;
		y/=length;
		z/=length;
		
		//return new Float32Array([this.nx*x,this.ny*y,this.nz*z]);
		return new Float32Array([this.nx,this.ny,this.nz]);
	};
}

function getNormalVector(face){
	var firstTriangleVector = {
		px: face[1].px-face[0].px,
		py: face[1].py-face[0].py,
		pz: face[1].pz-face[0].pz
	};
	var secondTriangleVector = {
		px: face[2].px-face[0].px,
		py: face[2].py-face[0].py,
		pz: face[2].pz-face[0].pz
	};
	/*
	var firstTriangleVector = face[1].copy().minus(face[0]);
	var secondTriangleVector = face[2].copy().minus(face[0]);
	*/
	var normalVector = [
		firstTriangleVector.py*secondTriangleVector.pz-firstTriangleVector.pz*secondTriangleVector.py,
		-(firstTriangleVector.px*secondTriangleVector.pz-firstTriangleVector.pz*secondTriangleVector.px),
		firstTriangleVector.px*secondTriangleVector.py-firstTriangleVector.py*secondTriangleVector.px
	];
	var normalLength = Math.sqrt(normalVector[0]*normalVector[0]+normalVector[1]*normalVector[1]+normalVector[2]*normalVector[2]);
	normalVector = [
		normalVector[0]/normalLength,
		normalVector[1]/normalLength,
		normalVector[2]/normalLength
	];
	return normalVector;
}

function Object3d(){
	console.log('created new Object3d');

	this.options = {
		fill: true,
		stroke: false,
		perspective: true,
		smoothLight: false,
		texture: true
	};
	this.Zk = 2;
	this.ZkplDiff = 1;
	this.Zpl = this.Zk - this.ZkplDiff;

	this.rotateX = 0;
	this.rotateY = 0;
	this.rotateZ = 0;

	this.movX = 0;
	this.movY = 0;
	this.movZ = 0;

	this.zBuffer = [];

	this.faces = [];
	this.vertexes = [[null,null,null,null]];
	this.projectionVertexes = [[null,null,null,null]];
	this.projectionFaces = [];
	this.normals = [[null,null,null,null]];
	this.VTs = [null];

	this.parse = function(lines){
		console.time('parsing');
		for (var i = 0; i<lines.length; i++){
			if (lines[i] !== '' && lines[i][0] != '#'){
				var arr = lines[i].trim().split(' ');
				var newArr = [];
				var j;
				for (j=0; j<arr.length; j++){
					if (arr[j].length>0){
						newArr.push(arr[j]);
					}
				}
				arr = newArr;
				if (arr[0] == 'v'){
					var vertex = math.matrix([
						Number(arr[1]),
						Number(arr[2]),
						Number(arr[3]),
						1
					]);
					this.vertexes.push(vertex);
				}
				else if (arr[0] == 'f'){
					var face = [];
					for (j=1; j<arr.length; j++){
						var facePoint = arr[j].split('/');
						face.push({
							pos: Number(facePoint[0]), //Индекс вершины
							norm: Number(facePoint[2]), //Индекс нормали
							texture: Number(facePoint[1]) //Индекс координат текстуры
						});
					}
					
					if (face.length == 3){//Костыль, чтобы все face'ы были 3-х угольными
						this.faces.push(face);
					}
					else if (face.length == 4){
						this.faces.push([face[0],face[1],face[2]]);
						this.faces.push([face[2],face[3],face[0]]);
					}
				}
				else if (arr[0] == 'vn'){
					var normal = [
						Number(arr[1]),
						Number(arr[2]),
						Number(arr[3]),
						0
					];
					this.normals.push(normal);
				}
				else if (arr[0] == 'vt'){
					var vt = new Float32Array([
						Number(arr[1]),
						1-Number(arr[2])
					]);
					this.VTs.push(vt);
				}
			}
			
		}
		console.timeEnd('parsing');
	};
	this.buildProjectionVertexes = function(){
		//Матрица  поворота
		console.time('projectionMatrix');
		var radX = this.rotateX*Math.PI;
		var radY = this.rotateY*Math.PI;
		var radZ = this.rotateZ*Math.PI;
		var rotateXMatrix = math.matrix([
			[1,0,0,0],
			[0,Math.cos(radX),-Math.sin(radX),0],
			[0,Math.sin(radX),Math.cos(radX),0],
			[0,0,0,1]
		]);
		var rotateYMatrix = math.matrix([
			[Math.cos(radY),0,Math.sin(radY),0],
			[0,1,0,0],
			[-Math.sin(radY),0,Math.cos(radY),0],
			[0,0,0,1]
		]);
		var rotateZMatrix = math.matrix([
			[Math.cos(radZ),-Math.sin(radZ),0,0],
			[Math.sin(radZ),Math.cos(radZ),0,0],
			[0,0,1,0],
			[0,0,0,1]
		]);
		var rotateMatrix = math.multiply(rotateXMatrix, rotateYMatrix);
		rotateMatrix = math.multiply(rotateMatrix, rotateZMatrix);

		//Матрица перемещения
		var moveMatrix = math.matrix([
			[1,0,0,this.movX],
			[0,1,0,this.movY],
			[0,0,1,this.movZ],
			[0,0,0,1]
		]);
		//Итоговая матрица(без проекции)
		var tranformMatrix = math.multiply(moveMatrix, rotateMatrix);
		//Построение новых вершин
		this.projectionVertexes = new Array(this.vertexes.length);
		var vertexesLength = this.vertexes.length;
		var i;
		for (i=1; i<vertexesLength; i++){
			if (i%100000===0){
				console.log('100000 face\'ов');
			}
			var transformedVertex = math.multiply(tranformMatrix, this.vertexes[i]);//Поворот
			var projectionMatrix = math.matrix([//Матрица проекции
				[(this.Zk-this.Zpl)/(this.Zk-transformedVertex._data[2]),0,0,0],
				[0,(this.Zk-this.Zpl)/(this.Zk-transformedVertex._data[2]),0,0],
				//[0,0,1,-this.Zpl],
				[0,0,1,1],
				[0,0,0,1]
			]);
			if (this.options.perspective){
				transformedVertex = math.multiply(projectionMatrix, transformedVertex);//Проекция
			}
			
			this.projectionVertexes[i] = transformedVertex._data;
		}
		this.projectionNormals = new Array(this.normals.length);
		var normalsLength = this.normals.length;
		for (i=1; i<normalsLength; i++){
			this.projectionNormals[i] = math.multiply(rotateMatrix, this.normals[i])._data;
		}
		console.timeEnd('projectionMatrix');
	};
	this.line = function(x0,y0,x1,y1,color,ctx){
		var steep = Math.abs(x0-x1)<Math.abs(y0-y1);
		var tmp;
		if (steep){
			tmp = x0;
			x0 = y0;
			y0 = tmp;
			
			tmp = x1;
			x1 = y1;
			y1 = tmp;
		}
		if (x0>x1){
			tmp = x0;
			x0 = x1;
			x1 = tmp;

			tmp = y0;
			y0 = y1;
			y1 = tmp;
		}

		var deltax = Math.abs(x1-x0);
		var deltay = Math.abs(y1-y0);
		var error = 0;
		var deltaerr = deltay;
		var y = y0;
		for (var x = x0; x<=x1; x++){
			if (steep){
				ctx.set(y,x,color);
			}
			else{
				ctx.set(x,y,color);
			}
			
			error += deltaerr;
			if (2*error>=deltax){
				if (y0>y1){
					y--;
				}
				else{
					y++;
				}

				error -= deltax;
			}
		}
	};
	this.paint = function(width, height, ctx){
		console.time('painting');
		var aspect = Math.min(width, height);
		var widthd2 = width>>1;
		var heightd2 = height>>1;
		var w = aspect/4;
		var h = -aspect/4;
		var facesLength = this.faces.length;
		var face = [
			new Point([0,0,0],[0,0,0],[0,0]),
			new Point([0,0,0],[0,0,0],[0,0]),
			new Point([0,0,0],[0,0,0],[0,0])
		];
		var color = {};
		var t0,t1,t2,tt;
		var totalHeight = 1;
		var j = 0;
		var y = 0;
		for (var i=0; i<facesLength; i++){//Каждый face
			if (i%100000===0){
				console.log('100000 face\'ов');
			}
			//var face = this.projectionFaces[i]
			for (j=0; j<3; j++){
				face[j] = {
					px: this.projectionVertexes[this.faces[i][j].pos][0],
					py: this.projectionVertexes[this.faces[i][j].pos][1],
					pz: this.projectionVertexes[this.faces[i][j].pos][2],
					nx: (this.projectionNormals[this.faces[i][j].norm] !== undefined) ? this.projectionNormals[this.faces[i][j].norm][0]:0,
					ny: (this.projectionNormals[this.faces[i][j].norm] !== undefined) ? this.projectionNormals[this.faces[i][j].norm][1]:0,
					nz: (this.projectionNormals[this.faces[i][j].norm] !== undefined) ? this.projectionNormals[this.faces[i][j].norm][2]:0,
					tx: (this.VTs[this.faces[i][j].texture] !== undefined) ? this.VTs[this.faces[i][j].texture][0]:0,
					ty: (this.VTs[this.faces[i][j].texture] !== undefined) ? this.VTs[this.faces[i][j].texture][1]:0,
				};
			}
			var normalVector = getNormalVector(face);

			if (normalVector[2]>0 && (face[0].py != face[1].py || face[0].py != face[2].py)){
				var shadeOfGray = 1;
				if (!this.options.smoothLight){
					shadeOfGray = normalVector[2];
				}
				//Обработка точек face'а перед отрисовкой
				//for (var j=0; j<face.length; j++){
				for (j=0; j<3; j++){
					//Цвет точки (для плавных теней)
					if (this.options.smoothLight){
						face[j].shadeOfGray = face[j].nz;
					}
					//Переход в экранные координаты
					face[j].px = face[j].px*w+widthd2;
					//face[j].py = Math.floor(face[j].py*h+height/2);
					face[j].py = (face[j].py*h+heightd2)|0;
					if (this.options.texture && this.texture !== undefined){
						face[j].tx *= this.texture.width;
						face[j].ty *= this.texture.height;
					}
				}
				if (this.options.fill){
					t0 = face[0];
					t1 = face[1];
					t2 = face[2];
					//var tt;
					
					if (t0.py>t1.py){
						tt = t0;
						t0 = t1;
						t1 = tt;
					}
					if (t0.py>t2.py){
						tt = t0;
						t0 = t2;
						t2 = tt;
					}
					if (t1.py>t2.py){
						tt = t1;
						t1 = t2;
						t2 = tt;
					}
					
					totalHeight = t2.py-t0.py+1;
					//Костыли
					if (t0.py<0){
						t0.py = 0;
					}
					if (t2.py>height){
						t2.py = height;
					}
					
					var t2minust0 = {
						px: t2.px-t0.px,
						py: t2.py-t0.py,
						pz: t2.pz-t0.pz,
						nx: t2.nx-t0.nx,
						ny: t2.ny-t0.ny,
						nz: t2.nz-t0.nz,
						tx: t2.tx-t0.tx,
						ty: t2.ty-t0.ty,
						shadeOfGray: t2.shadeOfGray-t0.shadeOfGray
					};
					//Да, тут надо тупо перечислять все поля
					//Нет, это не быдлокод
					//Потому что так намного быстрее
					var t2minust1 = {
						px: t2.px-t1.px,
						py: t2.py-t1.py,
						pz: t2.pz-t1.pz,
						nx: t2.nx-t1.nx,
						ny: t2.ny-t1.ny,
						nz: t2.nz-t1.nz,
						tx: t2.tx-t1.tx,
						ty: t2.ty-t1.ty,
						shadeOfGray: t2.shadeOfGray-t1.shadeOfGray
					};
					var t1minust0 = {
						px: t1.px-t0.px,
						py: t1.py-t0.py,
						pz: t1.pz-t0.pz,
						nx: t1.nx-t0.nx,
						ny: t1.ny-t0.ny,
						nz: t1.nz-t0.nz,
						tx: t1.tx-t0.tx,
						ty: t1.ty-t0.ty,
						shadeOfGray: t1.shadeOfGray-t0.shadeOfGray
					};
					/*
					var t2minust0 = t2.copy().minus(t0);
					var t2minust1 = t2.copy().minus(t1);
					var t1minust0 = t1.copy().minus(t0);
					*/
					var A, B, alpha=1, beta=1;
					for (y = t0.py; y<=t2.py;y++){//Каждая строка
						var secondHalf = y>t1.py || t1.py === t0.py;
						var segmentHeight = (secondHalf) ? t2.py-t1.py+1 : t1.py-t0.py+1;
						if (segmentHeight === 0){
							segmentHeight = 1;
						}
						alpha = (y-t0.py)/totalHeight;
						beta = (secondHalf) ? (y-t1.py)/segmentHeight : (y-t0.py)/segmentHeight;
						A = {
							px: (t2minust0.px*alpha+t0.px)|0,
							py: (t2minust0.py*alpha+t0.py)|0,
							pz: t2minust0.pz*alpha+t0.pz,
							nx: t2minust0.nx*alpha+t0.nx,
							ny: t2minust0.ny*alpha+t0.ny,
							nz: t2minust0.nz*alpha+t0.nz,
							tx: t2minust0.tx*alpha+t0.tx,
							ty: t2minust0.ty*alpha+t0.ty,
							shadeOfGray: t2minust0.shadeOfGray*alpha+t0.shadeOfGray
						};
						if (secondHalf){
							B = {
								px: (t2minust1.px*beta+t1.px)|0,
								py: (t2minust1.py*beta+t1.py)|0,
								pz: t2minust1.pz*beta+t1.pz,
								nx: t2minust1.nx*beta+t1.nx,
								ny: t2minust1.ny*beta+t1.ny,
								nz: t2minust1.nz*beta+t1.nz,
								tx: t2minust1.tx*beta+t1.tx,
								ty: t2minust1.ty*beta+t1.ty,
								shadeOfGray: t2minust1.shadeOfGray*beta+t1.shadeOfGray
							};
						}
						else{
							B = {
								px: (t1minust0.px*beta+t0.px)|0,
								py: (t1minust0.py*beta+t0.py)|0,
								pz: t1minust0.pz*beta+t0.pz,
								nx: t1minust0.nx*beta+t0.nx,
								ny: t1minust0.ny*beta+t0.ny,
								nz: t1minust0.nz*beta+t0.nz,
								tx: t1minust0.tx*beta+t0.tx,
								ty: t1minust0.ty*beta+t0.ty,
								shadeOfGray: t1minust0.shadeOfGray*beta+t0.shadeOfGray
							};
						}
						//Так медленно
						//A = t2minust0.copy().multiply(alpha).plus(t0);
						//B = (secondHalf) ? t2.copy().minus(t1).multiply(beta).plus(t1) : t1.copy().minus(t0).multiply(beta).plus(t0);
						if (A.px>B.px){
							tt = A;
							A = B;
							B = tt;
						}
						//Больше костылей
						if (A.px<0){
							A.px = 0;
						}
						if (B.px>width){
							B.px = width;
						}
						//A.floor();
						//B.floor();
						var z=0, ywidth=y*width;
						var apxEqualBpx = (A.px===B.px);
						var bpzMinusApz = B.pz-A.pz;
						var phi = 1;
						for (j=A.px; j<B.px; j++){//Каждый пиксель
							if (apxEqualBpx){
								phi = 1;
							}
							else{
								phi = (j-A.px)/(B.px-A.px);
							}
							z = A.pz+(bpzMinusApz)*phi;
							
							if (this.options.smoothLight){
								shadeOfGray = A.shadeOfGray+(B.shadeOfGray-A.shadeOfGray)*phi;
								//console.log(shadeOfGray);
							}
							
							var idx = ywidth+j;
							
							if (this.texture !== undefined && this.options.texture){
								this.texture.get(Math.round(A.tx+(B.tx-A.tx)*phi), Math.round(A.ty+(B.ty-A.ty)*phi), color);
								color.r*=shadeOfGray;
								color.g*=shadeOfGray;
								color.b*=shadeOfGray;
							}
							else{
								color.r = Math.round(250*shadeOfGray);
								color.g = Math.round(250*shadeOfGray);
								color.b = Math.round(250*shadeOfGray);
								color.a = 255;
							}
							
							if (this.zBuffer[idx]<z){
								this.zBuffer[idx] = z;
								ctx.set(j,y,color);
							}
						}
					}
				}
				if (this.options.stroke){
					var colorLine = {r:0,g:0,b:0,a:255};
					var x = Math.round(face[0].px);
					y = Math.round(face[0].py);
					for(j=1; j<=face.length; j++){//Каждая вершина на face'e
						var x1 = Math.round(face[j%face.length].px);
						var y1 = Math.round(face[j%face.length].py);
						this.line(x,y,x1,y1,colorLine, ctx);
						x = x1; y=y1;
					}
				}
			}
		}
		console.timeEnd('painting');
	};
	this.render = function(){
		console.time('rendering');
		this.onScreenCanvas = this.element;
		this.onScreenCanvas.width = $('#viewport').width();
		this.onScreenCanvas.height = $(window).height()-128;
		this.width = this.onScreenCanvas.width;
		this.height = this.onScreenCanvas.height;
		this.zBuffer = new Float32Array(this.onScreenCanvas.width*this.onScreenCanvas.height);
		this.zBuffer.fill(-Infinity);
		this.ctx = new DataImage(this.onScreenCanvas.width, this.onScreenCanvas.height);

		this.buildProjectionVertexes();
		this.paint(this.onScreenCanvas.width, this.onScreenCanvas.height, this.ctx);
		var onScreenCanvasContext = this.onScreenCanvas.getContext('2d');
		//onScreenCanvasContext.scale(2, 2);
		//onScreenCanvasContext.putImageData(this.ctx.getImageData(), 0, 0);
		onScreenCanvasContext.imageSmoothingEnabled = true;
		onScreenCanvasContext.putImageData(this.ctx.getImageData(), 0, 0);
		
		console.timeEnd('rendering');
	};
	this.setTexture = function(image){
		var textureCanves = document.createElement('canvas');
		textureCanves.width = image.width;
		textureCanves.height = image.height;
		textureCanves.getContext('2d').drawImage(image, 0,0,image.width, image.height);
		this.texture = new DataImage(image.width, image.height);
		this.texture.setImageData(textureCanves.getContext('2d').getImageData(0,0,image.width, image.height));
	};
}
document.getElementById('file').addEventListener('change', handleFileSelect);
document.getElementById('texture').addEventListener('change', handleTextureSelect);
$('#Zpl').on('input',optionsChangeHandler);
$('#Zk').on('input',optionsChangeHandler);
$('#rotateX').on('input', optionsChangeHandler);
$('#rotateY').on('input', optionsChangeHandler);
$('#rotateZ').on('input', optionsChangeHandler);
$('#perspectiveCheck').on('change', optionsChangeHandler);
$('#fillCheck').on('change', optionsChangeHandler);
$('#smoothLight').on('change', optionsChangeHandler);
$('#textureCheck').on('change', optionsChangeHandler);
$('#strokeCheck').on('change', optionsChangeHandler);
$('#moveX').on('input', optionsChangeHandler);
$('#moveY').on('input', optionsChangeHandler);
$('#moveZ').on('input', optionsChangeHandler);

function updateOptions(){
	object3d.options = {
		fill: $('#fillCheck').prop('checked'),
		stroke: $('#strokeCheck').prop('checked'),
		perspective: $('#perspectiveCheck').prop('checked'),
		smoothLight: $('#smoothLight').prop('checked'),
		texture: $('#textureCheck').prop('checked')
	};
	if (object3d.perspective){
		$('#Zpl').attr('disabled', false);
		$('Zk').attr('disabled', false);
	}
	else{
		$('#Zpl').attr('disabled', false);
		$('Zk').attr('disabled', true);
	}

	object3d.ZkplDiff = Number($('#Zpl').val());
	object3d.Zk = Number($('#Zk').val());
	object3d.Zpl = object3d.Zk - object3d.ZkplDiff;

	object3d.rotateX = Number($('#rotateX').val());
	object3d.rotateY = Number($('#rotateY').val());
	object3d.rotateZ = Number($('#rotateZ').val());

	object3d.movX = Number($('#moveX').val());
	object3d.movY = Number($('#moveY').val());
	object3d.movZ = Number($('#moveZ').val());
}
function optionsChangeHandler(){
	updateOptions();
	console.log('\n');
	object3d.render();
}
var Jcanvas = $('#canvas');
var mousedown = false;
Jcanvas.on('mousedown', function(){
	mousedown = true;
});
Jcanvas.on('mouseup', function(){
	mousedown = false;
});
Jcanvas.on('mouseleave', function(){
	mousedown = false;
});
var throttleRender = _.throttle(function(){
	console.log('\n');
	object3d.render();
},100);
Jcanvas.on('mousemove', function(ev){
	if (mousedown){
		object3d.rotateX+=Number(ev.originalEvent.movementY/500);
		object3d.rotateY+=Number(ev.originalEvent.movementX/300);
		throttleRender();
	}
});
/*
function testPerf(){
	object3d.render();
	var time = Date.now();
	var count = 14;
	for (var i=0; i<count; i++){
		object3d.render();
	}
	console.log('perfEnd', (Date.now()-time)/count);
}
function MyMathModule(global) {
    "use asm";
    var exp = global.Math.exp;
    function doubleExp(value) {
        value = +value;
        return +(+exp(+value) * 2.0);
    }
    return { doubleExp: doubleExp };
}
*/