"use strict";
window.addEventListener("load", async () => {
	// Variables
	let entidad = new URL(location.href).searchParams.get("entidad");
	let prodID = new URL(location.href).searchParams.get("id");
	let vista = location.pathname;
	let ruta = "./api/obtiene-col-cap/?entidad=";
	// Obtiene el botón de 'alternancia'
	let botonAlternancia = document.querySelector("#cuerpo #encabezado .fa-arrow-right-arrow-left");
	
	// Obtiene el 'id' que falta (colección o capítulo)
	let id_Colec_Cap = await fetch(ruta + entidad + "&id=" + prodID).then((n) => n.json());
	botonAlternancia.addEventListener("click", () => {
		location.href =
			vista +
			"?entidad=" +
			(entidad == "colecciones" ? "capitulos" : "colecciones") +
			"&id=" +
			id_Colec_Cap;
	});
});
