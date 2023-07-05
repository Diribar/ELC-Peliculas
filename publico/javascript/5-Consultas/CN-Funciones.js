"use strict";
// Variables de start-up
const ruta = "/consultas/api/";
const rutas = {
	// Startup
	layoutsOrdenes: ruta + "obtiene-layouts-y-ordenes", // layoutsOrdenes
	prefsFP: ruta + "obtiene-las-preferencias-del-fp/?filtro_id=", // opcionesFiltroPers
	diasDelAno: ruta + "obtiene-los-dias-del-ano", // diasDelAno

	// Actualiza filtros personalizados
	actualizaFP_id: ruta + "actualiza-fp_id/?filtro_id=", // guardaFiltroID
	actualizaPrefsFP: ruta + "actualiza-prefs-fp/?datos=", // actualiza

	// Consultas
	obtieneProds: ruta + "obtiene-los-productos/?datos=", // productos
	obtieneRCLVs: ruta + "obtiene-los-rclvs/?datos=", // rclvs
};

// Funciones de start-up
let statusInicialPrefs = async (producto) => {};

// Ejecuta las funciones de start-up
window.addEventListener("load", () => {
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
