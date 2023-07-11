"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Zona de Productos
		listado: document.querySelector("#zonaDeProds #vistaProds #listado"),
	};

	// Funciones
	let zonaDeProds = {
		obtieneLosProductos: async () => {

			// Momento del ano
			if (elegibles.layout_id == 1 && elegibles.orden_id == 1) {
				// Obtiene el diaDelAno
				const ahora = new Date();
				const diaUsuario = ahora.getDate();
				const mes_idUsuario = ahora.getMonth() + 1;
				elegibles.diaDelAno_id = varias.diasDelAno.find((n) => n.dia == diaUsuario && n.mes_id == mes_idUsuario).id;

				//resultados =
				resultados = await fetch(rutas.momento + JSON.stringify(elegibles)).then((n) => n.json());
			}

			// Actualiza el contador
			contador_de_prods.innerHTML = resultados.length + " resultados";

			// Actualiza los resultados
			DOM.listado.innerHTML = "";
			if (!resultados.length) {
			} else {
				const tope = Math.min(4, resultados.length);
				for (let i = 0; i < tope; i++) {
					await botonPelicula(resultados[i]);
				}
			}

			// Actualiza la información mostrada
			vistaProds.classList.remove("ocultar");

			// Fin
			return;
		},
	};
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
