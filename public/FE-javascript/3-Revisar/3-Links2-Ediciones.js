"use strict";
window.addEventListener("load", async () => {
	// Variables
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let iconosDecision = document.querySelectorAll(".edicion .decision");
	let ediciones_id = document.querySelectorAll(".edicion .edicion_id");
	let inputs = document.querySelectorAll(".edicion .inputs");
	let ruta = "/revision/api/edicion/";
	let condiciones = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;

	// Decisión tomada
	iconosDecision.forEach((iconoDecision, indice) => {
		iconoDecision.addEventListener("click", async () => {
			// Variables
			let aprobado = indice % 2 ? "NO" : "SI";
			let indiceEdicion = parseInt(indice / 2);
			let url = condiciones;
			// Completar el url
			url += "&edicion_id=" + ediciones_id[indiceEdicion].innerHTML;
			url += "&campo=" + inputs[indiceEdicion].name;
			url += "&aprobado=" + aprobado;
			let respuesta = await fetch(ruta + url).then((n) => n.json());
			if (respuesta.reload) window.location.reload();
		});
	});
});
