"use strict";
let botonPelicula = async (producto) => {
	// Crea el elemento 'boton'. El 'true' es para incluir también a los hijos
	const botonPelicula = document.querySelector("#vistaProds #botonPelicula");
	let clon = botonPelicula.cloneNode(true);
	let boton = {
		anchor: clon.querySelector("a"),
		avatar: clon.querySelector("img"),
		nombre_original: clon.querySelector("#nombre_original"),
		nombre_castellano: clon.querySelector("#nombre_castellano"),
		ano_estreno: clon.querySelector("#ano_estreno"),
	};

	// Dirección del link
	boton.anchor.href += producto.entidad + "&id=" + producto.id;

	// Imagen
	const localhost = await fetch("/api/localhost").then((n) => n.json());
	let avatar = localhost + "/imagenes/2-Productos/Final/" + producto.avatar;
	boton.avatar.src = avatar;
	boton.avatar.alt = producto.nombre_original;
	boton.avatar.title = producto.nombre_original;

	// Demás datos
	boton.nombre_castellano.innerHTML = producto.nombre_castellano;
	if (producto.nombre_castellano != producto.nombre_original) boton.nombre_original.innerHTML = producto.nombre_original;
	boton.ano_estreno.innerHTML = producto.ano_estreno + " - " + producto.entidadNombre;

	// Quitar la clase 'ocultar'
	clon.classList.remove("ocultar");

	// Agrega el form
	const listado = document.querySelector("#listado");
	listado.append(clon);
};
