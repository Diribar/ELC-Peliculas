"use strict";
window.addEventListener("load", () => {
	let beneficios = document.querySelectorAll("#medio #titulo")[0];
	let perjuicios = document.querySelectorAll("#medio #titulo")[1];

	// Variables de Imagen Nueva
	let imagenNuevaDOM = document.querySelector("#izquierda img");
	let imagenNueva = {
		dom: imagenNuevaDOM,
		ancho: imagenNuevaDOM.naturalWidth,
		alto: imagenNuevaDOM.naturalHeight,
	};
	imagenNueva.ratio = imagenNueva.alto / imagenNueva.ancho;
	imagenNueva.ratioAdecuado = imagenNueva.ratio >= 1.42 && imagenNueva.ratio <= 2;

	// Variables de Imagen Actual
	let imagenActualDOM = document.querySelector("#derecha img");
	let imagenActual = {
		dom: imagenActualDOM,
		ancho: imagenActualDOM.naturalWidth,
		alto: imagenActualDOM.naturalHeight,
	};
	imagenActual.ratio = imagenActual.alto / imagenActual.ancho;
	imagenActual.ratioAdecuado = imagenActual.ratio >= 1.42 && imagenActual.ratio <= 2;

	// Comparaciones de ratio
	let mejorRatio =
		!imagenActual.ratioAdecuado &&
		(imagenNueva.ratioAdecuado || (imagenNueva.ratio > imagenActual.ratio && imagenNueva.ratio <= 2));
	let peorRatio =
		!imagenNueva.ratioAdecuado &&
		(imagenActual.ratioAdecuado || (imagenActual.ratio > imagenNueva.ratio && imagenActual.ratio <= 2));

	// Comparaciones de calidad
	let mejorCalidad = (imagenActual.alto < 700) & (imagenNueva.alto > imagenActual.alto);
	let peorCalidad = (imagenNueva.alto < 700) & (imagenActual.alto > imagenNueva.alto);

	// Averiguar si el original proviene de un link externo
	let imagenActualEsLinkExterno = !imagenActualDOM.src.includes("imagenes");

	// Beneficios
	if (!mejorRatio) document.querySelector("#beneficios #ratio").classList.add("ocultar");
	if (!mejorCalidad) document.querySelector("#beneficios #resolucion").classList.add("ocultar");
	if (!mejorRatio && !mejorCalidad) {
		const para = document.createElement("p");
		para.innerText = "ninguno";
		beneficios.appendChild(para);
	}
	

	// Perjuicios
	if (!peorRatio) document.querySelector("#perjuicios #ratio").classList.add("ocultar");
	if (!peorCalidad) document.querySelector("#perjuicios #resolucion").classList.add("ocultar");
	if (!peorRatio && !peorCalidad) {
		const para = document.createElement("p");
		para.innerText = "ninguno";
		perjuicios.appendChild(para);
	}

	console.log(
		"mejorRatio:" + mejorRatio,
		"peorRatio:" + peorRatio,
		"mejorCalidad:" + mejorCalidad,
		"peorCalidad:" + peorCalidad,
		"imagenActualEsLinkExterno:" + imagenActualEsLinkExterno,
		"imagenNueva-ratio:" + imagenNueva.ratio,
		"imagenActual-ratio:" + imagenActual.ratio
	);
});
