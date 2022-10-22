"use strict";
window.addEventListener("load", async () => {
	// Variables
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let vista = window.location.pathname;
	let ruta = "/crud/api/obtener-col-cap/?entidad=";
	// Obtiene el botón de 'alternancia'
	let botonAlternancia = document.querySelector("#cuerpo #encabezado .fa-arrow-right-arrow-left");
	
	// Obtiene el 'id' que falta (colección o capítulo)
	let id_Colec_Cap = await fetch(ruta + entidad + "&id=" + prodID).then((n) => n.json());
	botonAlternancia.addEventListener("click", () => {
		window.location.href =
			vista +
			"?entidad=" +
			(entidad == "colecciones" ? "capitulos" : "colecciones") +
			"&id=" +
			id_Colec_Cap;
	});
});
