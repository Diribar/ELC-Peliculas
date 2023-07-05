"use strict";
// Variables de start-up
const ruta = "/consultas/api/";
const rutas = {
	// Obtiene
	obtiene: {
		layoutsMasOrdenes: ruta + "obtiene-layouts-y-ordenes", // layoutsOrdenes
		prefsFiltroPers: ruta + "obtiene-las-preferencias-del-filtroPers/?filtroPers_id=", // opcionesFiltroPers
		diasDelAno: ruta + "obtiene-los-dias-del-ano", // diasDelAno
	},

	guarda: {
		nuevoFiltroPers: ruta + "guarda-nuevo-filtroPers/?datos=",
	},

	// Actualiza
	actualiza: {
		filtroPers_id: ruta + "actualiza-filtroPers_id/?filtroPers_id=", // guardaFiltroID
		prefsFiltroPers: ruta + "actualiza-prefs-filtroPers/?datos=", // actualiza
	},

	// Resultados
	resultados: {
		prods: ruta + "obtiene-los-productos/?datos=", // productos
		rclvs: ruta + "obtiene-los-rclvs/?datos=", // rclvs
	},
};

// Funciones
let FN = {
	actualizaBotonera: ({}) => {
		let DOM = {
			
			filtroPers: document.querySelector("#filtroPers select[name='filtroPers']"),
			nuevo: document.querySelector("#filtroPers i#nuevo"),
			reinicio: document.querySelector("#filtroPers i#reinicio"),
			actualiza: document.querySelector("#filtroPers i#actualiza"),
			modificaNombre: document.querySelector("#filtroPers i#modificaNombre"),
			elimina: document.querySelector("#filtroPers i#elimina"),
			iconos: document.querySelectorAll("#filtroPers #iconos i"),
		};

		// Quita las clases crear y editar en el input


		// Fin
		return;
	},

	// Según necesidad del usuario
	actualizaPrefs: async (filtroPers_id) => {
		// Variables
		let DOM = {
			prefsSimples: document.querySelectorAll("#cuerpo .prefSimple .input"),
			ascDesInputs: document.querySelectorAll("#encabezado #ascDes input"),
		};
		const prefsFiltroPers = await fetch(rutas.obtiene.prefsFiltroPers + filtroPers_id).then((n) => n.json());

		// Actualiza las preferencias simples (Encabezado + Filtros)
		for (let prefSimple of DOM.prefsSimples) prefSimple.value = prefsFiltroPers[prefSimple.name] ? prefsFiltroPers[prefSimple.name] : "";

		// Actualiza las preferencias 'AscDes'
		for (let ascDesInput of DOM.ascDesInputs) ascDesInput.checked = prefsFiltroPers.ascDes && ascDesInput.value == prefsFiltroPers.ascDes;
	},
	nuevoFiltroPers: (filtroPers_id) => {
		// Variables
		let DOM = {filtroPers: document.querySelector("#filtroPers select[name='filtroPers']")};
		const filtroPers_id = DOM.filtroPers.value;

		// Actualiza el filtroPers_id en la session, cookie y el usuario
		if (filtroPers_id) fetch(rutas.actualiza.filtroPers_id + filtroPers_id);
		else return;

		// Fin
		return;
	},
};

// Ejecuta las funciones de start-up
window.addEventListener("load", () => {
	// Fin
	return;
});

let botonPelicula = async (producto) => {
	// Crea el elemento 'boton'. El 'true' es para incluir también a los hijos
	const botonPelicula = document.querySelector("#vistaProds #botonPelicula");
	let clon = botonPelicula.cloneNode(true);
	let boton = {
		anchor: clon.querySelector("a"),
		avatar: clon.querySelector("img"),
		nombreOriginal: clon.querySelector("#nombreOriginal"),
		nombreCastellano: clon.querySelector("#nombreCastellano"),
		anoEstreno: clon.querySelector("#anoEstreno"),
	};

	// Dirección del link
	boton.anchor.href += producto.entidad + "&id=" + producto.id;

	// Imagen
	const localhost = await fetch("/api/localhost").then((n) => n.json());
	let avatar = localhost + "/imagenes/2-Productos/Final/" + producto.avatar;
	boton.avatar.src = avatar;
	boton.avatar.alt = producto.nombreOriginal;
	boton.avatar.title = producto.nombreOriginal;

	// Demás datos
	boton.nombreCastellano.innerHTML = producto.nombreCastellano;
	if (producto.nombreCastellano != producto.nombreOriginal) boton.nombreOriginal.innerHTML = producto.nombreOriginal;
	boton.anoEstreno.innerHTML = producto.anoEstreno + " - " + producto.entidadNombre;

	// Quitar la clase 'ocultar'
	clon.classList.remove("ocultar");

	// Agrega el form
	const listado = document.querySelector("#listado");
	listado.append(clon);
};
