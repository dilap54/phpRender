var renderOptions;
$('#file').on('change', function(event){
	var file = this.files[0];
	if (!file) return
	if (file.size > 1024*1024*3){
		alert('Файл слишком большой');
		return;
	}
	var fd = new FormData();
	fd.append('file', file);
	$.ajax({
		url: 'upload.php',
		type: 'POST',
		data: fd,
		processData: false, 
		contentType: false,
		success: function(data){
			console.log(data);
			$('#fileId').val(Number(data));
			optionsChangeHandler();
		}
	})
})

var img = document.getElementById('img');

$('#fileId').on('input',optionsChangeHandler);
$('#Zpl').on('input',optionsChangeHandler);
$('#Zk').on('input',optionsChangeHandler);
$('#rotateX').on('input', optionsChangeHandler);
$('#rotateY').on('input', optionsChangeHandler);
$('#rotateZ').on('input', optionsChangeHandler);
$('#perspectiveCheck').on('change', optionsChangeHandler);
$('#fillCheck').on('change', optionsChangeHandler);
$('#strokeCheck').on('change', optionsChangeHandler);
$('#moveX').on('input', optionsChangeHandler);
$('#moveY').on('input', optionsChangeHandler);
$('#moveZ').on('input', optionsChangeHandler);

var throttleRender = _.throttle(function(){
	console.log('render');
	var getParams = [
		'ZKplDiff='+renderOptions.ZKplDiff,
		'Zk='+renderOptions.Zk,
		'rotateX='+renderOptions.rotateX,
		'rotateY='+renderOptions.rotateY,
		'rotateZ='+renderOptions.rotateZ,
		'movX='+renderOptions.movX,
		'movY='+renderOptions.movY,
		'movZ='+renderOptions.movZ,
		'width='+renderOptions.width,
		'height='+renderOptions.height,
		'modelId='+renderOptions.modelId
	];
	if (renderOptions.fill) { getParams.push('fill'); }
	if (renderOptions.stroke) { getParams.push('stroke'); }
	if (renderOptions.perspective) { getParams.push('perspective'); }
	img.src = 'render.php?'+getParams.join('&');
	$('#imgsrc').val(img.src);
},500);

function updateOptions(){
	renderOptions = {
		fill: $('#fillCheck').prop('checked'),
		stroke: $('#strokeCheck').prop('checked'),
		perspective: $('#perspectiveCheck').prop('checked'),
		ZKplDiff: Number($('#Zpl').val()),
		Zk: Number($('#Zk').val()),
		rotateX: Number($('#rotateX').val()),
		rotateY: Number($('#rotateY').val()),
		rotateZ: Number($('#rotateZ').val()),
		movX: Number($('#moveX').val()),
		movY: Number($('#moveY').val()),
		movZ: Number($('#moveZ').val()),
		width: img.width || 720,
		height: img.height || 480,
		modelId: Number($('#fileId').val()),
	}
	if (renderOptions.perspective){
		$('#Zpl').attr('disabled', false);
		$('#Zk').attr('disabled', false);
	}
	else{
		$('#Zpl').attr('disabled', true);
		$('#Zk').attr('disabled', true);
	}
}
function optionsChangeHandler(){
	updateOptions();
	throttleRender();
}

updateOptions();
throttleRender();