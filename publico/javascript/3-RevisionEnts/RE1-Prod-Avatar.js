"use strict";
window.addEventListener("load", () => {
	// Variables de bloque
	let botonesAvatar = document.querySelectorAll(".contenedorOpcionAvatar ul");
	let imagenNuevaDOM = document.querySelector("#izquierda img");
	let imagenActualDOM = document.querySelector("#derecha img");

	let resultados = [[], []];

	// RATIO ------------------------------

	// Variables de Imagen Nueva
	let imagenNueva = FN(imagenNuevaDOM);
	let imagenActual = FN(imagenActualDOM);

	// Comparaciones de ratio
	if (
		!imagenActual.ratioAdecuado &&
		(imagenNueva.ratioAdecuado || (imagenNueva.ratio > imagenActual.ratio && imagenNueva.ratio <= 2))
	)
		resultados[0].push("Mejor relación de alto/ancho");
	else if (
		!imagenNueva.ratioAdecuado &&
		(imagenActual.ratioAdecuado || (imagenActual.ratio > imagenNueva.ratio && imagenActual.ratio <= 2))
	)
		resultados[1].push("Mejor relación de alto/ancho");

	// Comparaciones de calidad
	if (imagenNueva.alto > imagenActual.alto && imagenActual.alto < 700) resultados[0].push("Mejor resolución");
	if (imagenActual.alto > imagenNueva.alto && imagenNueva.alto < 700) resultados[1].push("Mejor resolución");

	// Agrega las ventajas de cada opción
	resultados.forEach((resultado, i) => {
		for (let beneficio of resultado) {
			let li = document.createElement("li");
			li.innerText = beneficio;
			botonesAvatar[i].appendChild(li);
		}
	});
});

// Funciones
let FN = (imagenDOM) => {
	let dom = imagenDOM;
	let ancho = imagenDOM.naturalWidth;
	let alto = imagenDOM.naturalHeight;

	let ratio = alto / ancho;
	let ratioAdecuado = ratio >= 1.42 && ratio <= 2;
	return {alto, ratio, ratioAdecuado};
};
