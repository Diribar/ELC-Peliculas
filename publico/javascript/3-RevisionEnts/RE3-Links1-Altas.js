"use strict";
window.addEventListener("load", () => {
	// Variables
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let iconosOK = document.querySelectorAll(".yaExistentes .in");
	let links_url = document.querySelectorAll(".yaExistentes input[name='url'");
	let ruta = "/revision/api/link-alta/";
	let condiciones = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;

	// Decisión tomada
	iconosOK.forEach((iconoOK, indice) => {
		iconoOK.addEventListener("click", async () => {
			// Variables
			let url = condiciones;
			// Completar el url
			url += "&url=" + encodeURIComponent(links_url[indice].value);
			url += "&aprob=SI";
			let respuesta = await fetch(ruta + url).then((n) => n.json());
			if (respuesta.reload) window.location.reload();
		});
	});
});
