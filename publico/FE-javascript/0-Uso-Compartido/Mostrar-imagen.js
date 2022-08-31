"use strict";
window.addEventListener("load", () => {

	// Acciones si cambió alguna imagen
	let inputImagen = document.querySelector("form input[name='avatar']");
	inputImagen.addEventListener("change", (e) => {
		let texto = inputImagen.value;
		let ext = texto.slice(texto.length - 4);
		[".jpg", "jpeg", ".png"].includes(ext) ? mostrarImagen(e) : "";
	});
})

let mostrarImagen = (e) => {
	// Creamos el objeto de la clase FileReader
	let reader = new FileReader();
	// Leemos el archivo subido y se lo pasamos a nuestro fileReader
	reader.readAsDataURL(e.target.files[0]);
	// Le decimos que cuando esté listo ejecute el código interno
	reader.onload = () => {
		let preview = document.querySelector("#preview");
		let image = document.createElement("img");
		image.src = reader.result;
		preview.innerHTML = "";
		preview.append(image);
	};
}