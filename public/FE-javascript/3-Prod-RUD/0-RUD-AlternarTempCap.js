"use strict";
window.addEventListener("load", async () => {
	// Variables
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let vista = window.location.pathname;
	let ruta

	// Obtener el ID de la colección
	ruta = "/producto/tridente/api/obtener-col-cap/?entidad=capitulos&id=";
	let colID = await fetch(ruta + prodID).then((n) => n.json());

	// Obtener DOM de Temporada y Capítulos
	let tempSelect = document.querySelector("#encabezado select#temporada");
	let capSelect = document.querySelector("#encabezado select#capitulo");

	// CAMBIOS EN LA TEMPORADA --> se deben actualizar los capítulos
	tempSelect.addEventListener("change", async () => {
		// Obtener la temporada
		let tempNum = temporada.value.slice(10);
		// Obtener los capítulos de la temporada
		let ruta = "/producto/agregar/api/TP-averiguar-capitulos/";
		let capitulos = await fetch(ruta + "?coleccion_id=" + colID + "&temporada=" + tempNum).then(
			(n) => n.json()
		);
		// Eliminar las opciones actuales
		capSelect.innerHTML = "<option selected class='ocultar'>Elegí</option>";
		// Agregar las nuevas opciones
		for (let capitulo of capitulos) {
			capSelect.innerHTML += "<option>Capítulo " + capitulo + "</option>";
		}
	});

	// CAMBIOS EN EL CAPÍTULO --> cambiar el url
	capSelect.addEventListener("change", async () => {
		// Obtener los datos para conseguir el capID
		let tempNum = temporada.value.slice(10);
		let capNum = capitulo.value.slice(9);
		// Obtener el capID
		let ruta = "/producto/tridente/api/obtener-cap-id/?entidad=capitulos";
		let capID = await fetch(
			ruta + "&coleccion_id=" + colID + "&temporada=" + tempNum + "&capitulo=" + capNum
		).then((n) => n.json());
		window.location.href = vista + "?entidad=capitulos&id=" + capID;
	});	
	
	// CAPÍTULOS ANTERIOR O POSTERIOR
	// Obtener el ID del capítulo anterior y del posterior
	ruta = "/producto/tridente/api/obtener-cap-ant-y-post/?id=";
	let [capAntID, capPostID] = await fetch(ruta + prodID).then((n) => n.json());
	// Acción si se elije "capítulo anterior"
	let botonCapAnt = document.querySelector("#cuerpo #encabezado .fa-circle-left");
	if (capAntID) {
		botonCapAnt.classList.remove("inactivo");
		botonCapAnt.addEventListener("click", () => {
			window.location.href = vista + "?entidad=" + entidad + "&id=" + capAntID;
		});
	} else botonCapAnt.classList.add("inactivo");
	// Acción si se elije "capítulo posterior"
	let botonCapPost = document.querySelector("#cuerpo #encabezado .fa-circle-right");
	if (capPostID) {
		botonCapPost.classList.remove("inactivo");
		botonCapPost.addEventListener("click", () => {
			window.location.href = vista + "?entidad=" + entidad + "&id=" + capPostID;
		});
	} else botonCapPost.classList.add("inactivo");
});
