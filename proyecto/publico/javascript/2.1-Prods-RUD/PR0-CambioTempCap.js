"use strict";
window.addEventListener("load", async () => {
	// Variables
	const prodID = new URL(location.href).searchParams.get("id");
	const codigo = location.pathname.slice(1, -1);
	const origen = false
		? null
		: codigo == "producto/detalle"
		? "DTP"
		: codigo == "producto/edicion"
		? "EDP"
		: codigo == "links/abm"
		? "LK"
		: "";
	let ruta;

	// Obtiene el ID de la colección
	ruta = "/crud/api/obtiene-col-cap/?entidad=capitulos&id=";
	let colID = await fetch(ruta + prodID).then((n) => n.json());

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
				prodID +
				"&prodEntidad=capitulos&prodID=" +
				capID +
				"&origen=" +
				origen;
		});

	// CAMBIOS EN EL CAPÍTULO --> cambiar el url
	capSelect.addEventListener("change", async () => {
		// Obtiene los datos para conseguir el capID
		const tempNum = tempSelect ? tempSelect.value : 1;
		const capNum = capitulo.value;

		// Obtiene el capID
		const ruta = "/crud/api/obtiene-cap-id/?entidad=capitulos";
		const capID = await fetch(ruta + "&coleccion_id=" + colID + "&temporada=" + tempNum + "&capitulo=" + capNum).then((n) =>
			n.json()
		);

		// Actualiza la vista
		location.href =
			"/inactivar-captura/?entidad=capitulos&id=" + prodID + "&prodEntidad=capitulos&prodID=" + capID + "&origen=" + origen;
	});
});
