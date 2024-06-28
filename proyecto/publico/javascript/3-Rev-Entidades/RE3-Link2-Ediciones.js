"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		inputs: document.querySelectorAll(".edicion .inputs"),
		ediciones: document.querySelectorAll(".edicion .inputError"),
		aprobs: document.querySelectorAll(".edicion .inputError .aprob"),
		rechs: document.querySelectorAll(".edicion .inputError .rech"),
		edicsID: document.querySelectorAll(".edicion .edicID"),
	};
	const condicion = "?entidad=links";
	const motivoGenerico_id = await fetch("/revision/api/edicion/motivo-generico").then((n) => n.json());

	// Decisión tomada
	for (let indice = 0; indice < DOM.ediciones.length; indice++) {
		// Variables
		let url = condicion;
		url += "&edicID=" + DOM.edicsID[indice].innerHTML;
		url += "&campo=" + DOM.inputs[indice].name;

		// Eventos
		DOM.aprobs[indice].addEventListener("click", async () => {
			url += "&aprob=SI";
			await resultado(url);
		});
		DOM.rechs[indice].addEventListener("click", async () => {
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
