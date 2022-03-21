"use strict";
window.addEventListener("load", () => {
	// Declaración de variables
	let preview = document.querySelector("form #segundaColumna #preview");
	let url = document.querySelector("form #segundaColumna #url");

	// Copiar al portapapeles
	if (url && url.innerHTML)
		preview.addEventListener("click", () => {
			navigator.clipboard.writeText(url.innerHTML);
		});
	// Acciones si cambió alguna imagen
	let inputImagen = document.querySelector("form input[name='avatar']");
	inputImagen.addEventListener("change", (e) => {
		texto = inputImagen.value;
		let ext = texto.slice(texto.length - 4);
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
		preview = document.querySelector("#preview");
		image = document.createElement("img");
		image.src = reader.result;
		preview.innerHTML = "";
		preview.append(image);
	};
};
