"use strict";
window.addEventListener("load", async () => {
	// Variables
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let objeto = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;
	let edicsAceptar = document.querySelectorAll(".edicion .fa-circle-check");
	let edicsRech = document.querySelectorAll(".edicion .fa-circle-xmark");
	let ediciones_id = document.querySelectorAll(".edicion .edicion_id");
	let inputs = document.querySelectorAll(".edicion .inputs");
	let rutaAprob = "/revision/api/edic_aprob/";

	// Editar - Hecho
	edicsAceptar.forEach((edicAceptar, indice) => {
		edicAceptar.addEventListener("click", async () => {
			// Completar el objeto
			let url = objeto;
			url += "&edicion_id=" + ediciones_id[indice].innerHTML;
			url += "&campo=" + inputs[indice].name;
			let respuesta = await fetch(rutaAprob + url).then((n) => n.json());
			// console.log(respuesta);
			if (respuesta.reload) window.location.reload();
		});
	});
	// Guardar - Hecho
	edicsRech.forEach((edicRech, indice) => {
		edicRech.addEventListener("click", async () => {
			console.log(indice, ediciones_id[indice].innerHTML, inputs[indice].name);
		});
	});
});
