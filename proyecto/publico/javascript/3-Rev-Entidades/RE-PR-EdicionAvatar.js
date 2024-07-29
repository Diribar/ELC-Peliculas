"use strict";
window.addEventListener("load", () => {
	// Variables de bloque
	let botonesAvatar = document.querySelectorAll(".contOpcionAvatar ul");
	let imagenNuevaDOM = document.querySelector("#izquierda img");
	let imagenActualDOM = document.querySelector("#derecha img");

	let resultados = [[], []];

	// RATIO ------------------------------

	// Variables de Imagen Nueva
	let imagenNueva = FN(imagenNuevaDOM);
	let imagenActual = FN(imagenActualDOM);

	// Comparaciones de ratio
	// 1. Mejor imagen nueva
	const altoAncho = "Mejor relación de alto y ancho";
	if (imagenNueva.ratio > imagenActual.ratio && !imagenActual.ratioAdecuado) resultados[0].push(altoAncho);
	// 2. Mejor imagen actual
	else if (imagenActual.ratio > imagenNueva.ratio && !imagenNueva.ratioAdecuado) resultados[1].push(altoAncho);

	// Comparaciones de calidad
	if (imagenNueva.alto > imagenActual.alto && imagenActual.alto < 700) resultados[0].push("Mayor tamaño");
	if (imagenActual.alto > imagenNueva.alto && imagenNueva.alto < 700) resultados[1].push("Mayor tamaño");

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
	let alto = imagenDOM.naturalHeight;
	let ancho = imagenDOM.naturalWidth;

	let ratio = alto / ancho;
	let ratioAdecuado = ratio >= 1.42 && ratio <= 2;
	return {alto, ratio, ratioAdecuado};
};
