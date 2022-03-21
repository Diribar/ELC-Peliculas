"use strict";
window.addEventListener("load", async () => {
	// Variables
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let producto_id = new URL(window.location.href).searchParams.get("id");
	let vista = window.location.pathname;

	// Obtener el ID de la colección
	let ruta = "/producto/tridente/api/obtener-col-cap/?entidad=capitulos&id=";
	let coleccion_id = await fetch(ruta + producto_id).then((n) => n.json());

	// Obtener DOM de Temporada y Capítulos
	let temporada = document.querySelector("#encabezado select#temporada");
	let capitulo = document.querySelector("#encabezado select#capitulo");

	// Si cambia Temp --> actualizar los capítulos
	temporada.addEventListener("change", async () => {
		// Obtener los 2 datos para conseguir el capID
		let col = coleccion_id;
		let temp = temporada.value.slice(10);
		// Obtener los capítulos de la temporada
		ruta = "/producto/agregar/api/TP-averiguar-capitulos/";
		let capitulos = await fetch(ruta + "?coleccion_id=" + col + "&temporada=" + temp).then(
			(n) => n.json()
		);
		// Eliminar las opciones actuales
		capitulo.innerHTML = "<option selected class='ocultar'>Elegí</option>";
		// Agregar las nuevas opciones
		for (let capitulo of capitulos) {
			capitulo.innerHTML += "<option>Capítulo " + capitulo + "</option>";
		}
	});

	// Si cambia el capítulo --> cambiar el url
	capitulo.addEventListener("change", async () => {
		// Obtener los 3 datos para conseguir el capID
		let col = coleccion_id;
		let temp = temporada.value.slice(10);
		let capitulo = capitulo.value.slice(9);
		// Obtener el capID
		ruta = "/producto/tridente/api/obtener-cap-id/?entidad=capitulos";
		let capID = await fetch(
			ruta + "&coleccion_id=" + col + "&temporada=" + temp + "&capitulo=" + capitulo
		).then((n) => n.json());
		window.location.href = vista + "?entidad=capitulos&id=" + capID;
	});

	// Acción si se elige 'colección/capítulo'
	if (entidad != "peliculas") {
		// Obtener el DOM
		let colCapDOM = document.querySelector("#cuerpo #encabezado .fa-arrow-right-arrow-left");
		// Obtener el 'colCapID'
		let ruta = "/producto/tridente/api/obtener-col-cap/?entidad=";
		let colCapID = await fetch(ruta + entidad + "&id=" + producto_id).then((n) => n.json());
		// Alternar entre colección y capítulo
		colCapDOM.addEventListener("click", () => {
			window.location.href =
				vista +
				"?entidad=" +
				(entidad == "colecciones" ? "capitulos" : "colecciones") +
				"&id=" +
				colCapID;
		});
	}

	// Acción si se elije "capítulo anterior" o "posterior"
	if (entidad == "capitulos") {
		// Obtener el DOM
		let capAntDOM = document.querySelector("#cuerpo #encabezado .fa-circle-left");
		let capPostDOM = document.querySelector("#cuerpo #encabezado .fa-circle-right");
		// Obtener el ID del capítulo anterior y del posterior
		let ruta = "/producto/tridente/api/obtener-cap-ant-y-post/?id=";
		let [capAntID, capPostID] = await fetch(ruta + producto_id).then((n) => n.json());
		// Acción si se elije "capítulo anterior"
		if (capAntID) {
			capAntDOM.classList.remove("inactivo");
			capAntDOM.addEventListener("click", () => {
				window.location.href = vista + "?entidad=" + entidad + "&id=" + capAntID;
			});
		} else capAntDOM.classList.add("inactivo");
		// Acción si se elije "capítulo posterior"
		if (capPostID) {
			capPostDOM.classList.remove("inactivo");
			capPostDOM.addEventListener("click", () => {
				window.location.href = vista + "?entidad=" + entidad + "&id=" + capPostID;
			});
		} else capPostDOM.classList.add("inactivo");
	}

});
