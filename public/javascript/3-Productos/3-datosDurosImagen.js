window.addEventListener("load", () => {
	// Copiar al portapapeles
	let img = document.querySelector("form #imagenPeli label img");
	let copiar = document.querySelector("form #imagenPeli button");
	copiar.addEventListener("click", () => {
		navigator.clipboard.writeText(img.src);
	})
	// Acciones si cambió alguna imagen
	let inputImagen = document.querySelector("form input[name='avatar']");
	inputImagen.addEventListener("change", (e) => {
		texto = inputImagen.value;
		ext = texto.slice(texto.length - 4);
		[".jpg", ".png", ".gif", ".bmp"].includes(ext) ? mostrarImagen(e) : ""
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
