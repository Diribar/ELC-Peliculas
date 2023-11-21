"use strict";
window.addEventListener("load", () => {
	// Variables
	let DOM = {
		yaExistentes: document.querySelectorAll(".yaExistentes"),
		iconosIN: document.querySelectorAll(".yaExistentes .in"),
		iconosFuera: document.querySelectorAll(".yaExistentes .fuera"),
		linksUrl: document.querySelectorAll(".yaExistentes input[name='url'"),
	};
	let v = {
		prodEntidad: new URL(location.href).searchParams.get("entidad"),
		prodID: new URL(location.href).searchParams.get("id"),
		ruta: "/revision/api/link/alta-baja/",
	};
	const condiciones = "?prodEntidad=" + v.prodEntidad + "&prodID=" + v.prodID;

	// Decisión tomada
	DOM.iconosIN.forEach((icono, indice) => {
		icono.addEventListener("click", async () => {
			// Variables
			let url = condiciones;
			// Completar el url
			url += "&url=" + encodeURIComponent(DOM.linksUrl[indice].value);
			url += "&IN=SI";
			url += "&aprob=" + (icono.className.includes("aprob") ? "SI" : "NO");
			let respuesta = await fetch(v.ruta + url).then((n) => n.json());
			if (respuesta.reload) location.reload();
		});
	});
	DOM.iconosFuera.forEach((icono, indice) => {
		icono.addEventListener("click", async () => {
			// Variables
			let url = condiciones;
			// Completar el url
			url += "&url=" + encodeURIComponent(DOM.linksUrl[indice].value);
			url += "&IN=NO";
			url += "&aprob=" + (icono.className.includes("aprob") ? "SI" : "NO");
			let respuesta = await fetch(v.ruta + url).then((n) => n.json());
			if (respuesta.reload) DOM.yaExistentes[indice].classList.add("ocultar")
		});
	});
});
