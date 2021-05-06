window.addEventListener("load", () => {
	document.getElementById("inputImagen").onchange = function(e) {
		// Ocultar y mostrar elementos
		document.getElementById("labelImagen").classList.add("ocultar")
		document.getElementById("iconoImagenRojo").classList.add("ocultar")
		document.getElementById("iconoImagenVerde").classList.remove("ocultar")
		// Creamos el objeto de la clase FileReader
		let reader = new FileReader();
		// Leemos el archivo subido y se lo pasamos a nuestro fileReader
		reader.readAsDataURL(e.target.files[0]);
		// Le decimos que cuando este listo ejecute el código interno
		reader.onload = function(){
			let preview = document.getElementById('preview'),
			image = document.createElement('img');
			image.src = reader.result;
			preview.innerHTML = '';
			preview.append(image);
		};
		console.log("sí")
	}
})