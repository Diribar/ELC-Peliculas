window.addEventListener("load", () => {
	let inputImagen = document.querySelector("input[name='avatar']");
	let imagen=document.querySelector("#imagenProducto img")
	console.log(imagen.src);
	
	// Acciones si cambió alguna imagen
	inputImagen.addEventListener("change", (e) => {
		texto = inputImagen.value;
		ext = texto.slice(texto.lastIndexOf("."));
		[".jpg", ".png"].includes(ext) ? mostrarImagen(e) : "";
	});
});

let mostrarImagen = (e) => {
	// Creamos el objeto de la clase FileReader
	reader = new FileReader();
	// Leemos el archivo subido y se lo pasamos a nuestro fileReader
	reader.readAsDataURL(e.target.files[0]);
	// Le decimos que cuando esté listo ejecute el código interno
	reader.onload = () => {
		image = document.createElement("img");
		image.src = reader.result;
		preview = document.querySelector("#imagenProducto");
		preview.innerHTML = "";
		preview.append(image);
	};
};
