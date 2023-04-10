"use strict";
window.addEventListener("load", () => {
	// Variables
	let prodEntidad = new URL(location.href).searchParams.get("entidad");
	let prodID = new URL(location.href).searchParams.get("id");
	let iconosIN = document.querySelectorAll(".yaExistentes .in");
	let iconosFuera = document.querySelectorAll(".yaExistentes .fuera");
	let links_url = document.querySelectorAll(".yaExistentes input[name='url'");
	let ruta = "/revision/api/link/alta-baja/";
	let condiciones = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;

	// Decisión tomada
	iconosIN.forEach((icono, indice) => {
		icono.addEventListener("click", async () => {
			// Variables
			let url = condiciones;
			// Completar el url
			url += "&url=" + encodeURIComponent(links_url[indice].value);
			url += "&IN=SI";
			url += "&aprob=" + (icono.className.includes("aprob") ? "SI" : "NO");
			let respuesta = await fetch(ruta + url).then((n) => n.json());
			if (respuesta.reload) location.reload();
		});
	});
	iconosFuera.forEach((icono, indice) => {
		icono.addEventListener("click", async () => {
			// Variables
			let url = condiciones;
			// Completar el url
			url += "&url=" + encodeURIComponent(links_url[indice].value);
			url += "&IN=NO";
			url += "&aprob=" + (icono.className.includes("aprob") ? "SI" : "NO");
			let respuesta = await fetch(ruta + url).then((n) => n.json());
			if (respuesta.reload) location.reload();
		});
	});
});
