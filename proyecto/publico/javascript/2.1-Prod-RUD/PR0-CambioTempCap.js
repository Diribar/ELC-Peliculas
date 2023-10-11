"use strict";
window.addEventListener("load", async () => {
	// Variables
	const prodID = new URL(location.href).searchParams.get("id");
	const codigo = location.pathname.slice(1,-1)
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
	let tempSelect = document.querySelector("#encabezado select#temporada");
	let capSelect = document.querySelector("#encabezado select#capitulo");

	// CAMBIOS EN LA TEMPORADA --> se deben actualizar los capítulos
	tempSelect.addEventListener("change", async () => {
		// Obtiene la temporada
		let tempNum = temporada.value
		// Obtiene los capítulos de la temporada
		let ruta = "/crud/api/obtiene-capitulos/";
		let capitulos = await fetch(ruta + "?coleccion_id=" + colID + "&temporada=" + tempNum).then((n) => n.json());
		// Elimina las opciones actuales
		capSelect.innerHTML = "<option selected class='ocultar'>Elegí</option>";
		// Agregar las nuevas opciones
		for (let capitulo of capitulos) {
			capSelect.innerHTML += "<option>" + capitulo.numero + ". " + capitulo.nombre + "</option>";
		}
	});

	// CAMBIOS EN EL CAPÍTULO --> cambiar el url
	capSelect.addEventListener("change", async () => {
		// Obtiene los datos para conseguir el capID
		let tempNum = temporada.value
		let capNum = capitulo.value
		// Obtiene el capID
		let ruta = "/crud/api/obtiene-cap-id/?entidad=capitulos";
		let capID = await fetch(ruta + "&coleccion_id=" + colID + "&temporada=" + tempNum + "&capitulo=" + capNum).then((n) =>
			n.json()
		);
		location.href =
			"/inactivar-captura/?entidad=capitulos&id=" +
			prodID +
			"&prodEntidad=capitulos&prodID=" +
			capID +
			"&origen=" +
			origen;
	});
});
