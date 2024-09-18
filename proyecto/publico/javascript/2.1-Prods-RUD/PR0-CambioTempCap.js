"use strict";
window.addEventListener("load", async () => {
	// Variables
	const origenUrl = pathname.slice(0, -1);
	let ruta;

	// Obtiene el ID de la colección
	ruta = "/crud/api/obtiene-col-cap/?entidad=capitulos&id=";
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
			const ruta = "/crud/api/obtiene-capitulos/";
			const capitulos = await fetch(ruta + "?coleccion_id=" + colID + "&temporada=" + tempNum).then((n) => n.json());
			const capID = capitulos[0].id;

			// Actualiza la vista
			location.href =
				"/inactivar-captura/?entidad=capitulos&id=" +
				id +
				"&prodEntidad=capitulos&prodId=" +
				capID +
				"&origenUrl=" +
				encodeURIComponent(origenUrl);
		});

	// CAMBIOS EN EL CAPÍTULO --> cambiar el url
	capSelect.addEventListener("change", async () => {
		// Variables
		const tempNum = tempSelect ? tempSelect.value : 1;
		const capNum = capitulo.value;
		const ruta = "/crud/api/obtiene-cap-id/?entidad=capitulos";

		// Obtiene el capID
		const capID = await fetch(ruta + "&coleccion_id=" + colID + "&temporada=" + tempNum + "&capitulo=" + capNum).then((n) =>
			n.json()
		);

		// Actualiza la vista
		location.href =
			"/inactivar-captura/?entidad=capitulos&id=" +
			id +
			"&prodEntidad=capitulos&prodId=" +
			capID +
			"&origenUrl=" +
			encodeURIComponent(origenUrl);
	});
});
