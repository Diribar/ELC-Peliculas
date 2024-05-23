"use strict";
window.addEventListener("load", async () => {
	// Variables
	let inputs = document.querySelectorAll(".edicion .inputs");
	let ediciones = document.querySelectorAll(".edicion .inputError");
	let aprobs = document.querySelectorAll(".edicion .inputError .aprob");
	let rechs = document.querySelectorAll(".edicion .inputError .rech");
	let edicsID = document.querySelectorAll(".edicion .edicID");
	let condiciones = "?entidad=links";
	let motivoGenerico_id = await fetch("/revision/api/edicion/motivo-generico").then((n) => n.json());

	// Decisión tomada
	for (let indice = 0; indice < ediciones.length; indice++) {
		// Variables
		let url = condiciones;
		url += "&edicID=" + edicsID[indice].innerHTML;
		url += "&campo=" + inputs[indice].name;

		// Eventos
		aprobs[indice].addEventListener("click", async () => {
			url += "&aprob=SI";
			await resultado(url);
		});
		rechs[indice].addEventListener("click", async () => {
			url += "&motivo_id=" + motivoGenerico_id;
			await resultado(url);
		});
	}
});

// Fórmulas
let resultado = async (url) => {
	let ruta = "/revision/api/link/edicion/";
	let respuesta = await fetch(ruta + url).then((n) => n.json());

	// Si el resultado es 'OK', recarga la vista
	if (respuesta.OK) location.reload();
	// Muestra el mensaje
	else if (respuesta.mensaje) console.log(respuesta.mensaje);

	// Fin
	return;
};
