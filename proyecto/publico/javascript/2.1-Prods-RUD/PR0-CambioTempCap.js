"use strict";
window.addEventListener("load", async () => {
	// Variables
	const urlOrigen = pathname.slice(0, -1);
	let ruta;

	// Obtiene el ID de la colección
	ruta = "/capitulos/api/obtiene-col-cap/?entidad=capitulos&id=";
	let colID = await fetch(ruta + id).then((n) => n.json());

	// Obtiene DOM de Temporada y Capítulos
	const tempSelect = document.querySelector("#encabezado select#temporada");
	const capSelect = document.querySelector("#encabezado select#capitulo");

	// CAMBIOS EN LA TEMPORADA --> se deben actualizar los capítulos
	if (tempSelect)
		tempSelect.addEventListener("change", async () => {
			// Obtiene la temporada
			const tempNum = tempSelect.value;

			// Obtiene el primer capítulo de la temporada
			const ruta = "/capitulos/api/obtiene-capitulos/";
			const capitulos = await fetch(ruta + "?coleccion_id=" + colID + "&temporada=" + tempNum).then((n) => n.json());
			const cap_id = capitulos[0].id;

			// Actualiza la vista
			location.href =
				"/capitulos/inactivar-captura/?id=".concat(id) +
				"&prodEntidad=capitulos&prodId=".concat(cap_id) +
				"&urlOrigen=".concat(encodeURIComponent(urlOrigen));
		});

	// CAMBIOS EN EL CAPÍTULO --> cambiar el url
	capSelect.addEventListener("change", async () => {
		// Variables
		const tempNum = tempSelect ? tempSelect.value : 1;
		const capNum = capitulo.value;
		const ruta = "/familia/api/obtiene-cap-id/?entidad=capitulos";

		// Obtiene el cap_id
		const cap_id = await fetch(ruta + "&coleccion_id=" + colID + "&temporada=" + tempNum + "&capitulo=" + capNum).then((n) =>
			n.json()
		);

		// Actualiza la vista
		location.href =
			"/capitulos/inactivar-captura/?id=".concat(id) +
			"&prodEntidad=capitulos&prodId=".concat(cap_id) +
			"&urlOrigen=".concat(encodeURIComponent(urlOrigen));
	});
});
