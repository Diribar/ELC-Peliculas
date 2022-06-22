"use strict";
window.addEventListener("load", () => {
	// Variables
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let iconosDecision = document.querySelectorAll(".yaExistentes .decision");
	let filas_yaExistentes = document.querySelectorAll(".yaExistentes");
	let links_url = document.querySelectorAll(".yaExistentes input[name='url'");
	let ruta = "/revision/api/altas/";
	let condiciones = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;

	// Decisión tomada
	iconosDecision.forEach((iconoDecision, indice) => {
		iconoDecision.addEventListener("click", async () => {
			// Variables
			let aprobado = indice % 2 ? "NO" : "SI";
			let indiceLink = parseInt(indice / 2);
			let url = condiciones;
			// Completar el url
			url += "&url=" + links_url[indiceLink].value;
			url += "&aprobado=" + aprobado;
			let respuesta = await fetch(ruta + url).then((n) => n.json());
			// if (respuesta.reload) window.location.reload();
		});
	});
});
