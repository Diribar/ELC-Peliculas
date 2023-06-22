"use strict";
window.addEventListener("load", async () => {
	// Si no existe la información a desambiguar, redirige al paso anterior
	const desambiguar = await fetch("api/desambiguar-busca-session-desambiguar").then((n) => (n ? n.json() : ""));
	if (!desambiguar) location.href = "palabras-clave";

	// Variables
	let DOM = {
		// Opciones
		listado: document.querySelector("#listado"),
		ingrManual: document.querySelector("#listado #ingrManual"),
		prodsNuevos: document.querySelector("#listado #prodsNuevos"),
		prodsYaEnBD: document.querySelector("#listado #prodsYaEnBD"),

		// Cartel
		cartel: document.querySelector("#cartel"),
		tituloCartel: document.querySelector("#cartel #titulo"),
		progreso: document.querySelector("#cartel #progreso"),
	};
	const localhost = await fetch("/api/localhost").then((n) => (n ? n.json() : ""));
	let productos = desambiguar.productos;
	let ocultarCartel;

	// Acciones si no hay productos en 'session'
	if (!productos) {
		// Variables
		const rutasAPI = [
			"busca-los-productos",
			"reemplaza-las-peliculas-por-su-coleccion",
			"pule-la-informacion",
			"obtiene-los-hallazgos-de-origen-IM-y-FA",
		];
		const cantAPIs = rutasAPI.length + 1;
		let api = 0;
		ocultarCartel = true;

		// Muestra el cartel
		DOM.cartel.classList.remove("ocultar");
		DOM.cartel.classList.remove("disminuye");
		DOM.cartel.classList.add("aumenta");

		// Ejecuta las APIs iniciales
		for (let rutaAPI of rutasAPI) {
			await fetch("api/desambiguar-" + rutaAPI + "/");
			api++;
			DOM.progreso.style.width = parseInt((api / cantAPIs) * 100) + "%";
		}

		// Combina los hallazgos 'yaEnBD'
		productos = await fetch("api/desambiguar-combina-los-hallazgos-yaEnBD/").then((n) => n.json());
	}

	// Agrega los productos
	let {prodsNuevos, prodsYaEnBD, mensaje} = productos;

	// Productos nuevos
	if (prodsNuevos.length)
		for (let prod of prodsNuevos) {
			// Crea el elemento 'li'
			let li = DOM.prodsNuevos.cloneNode(true);
			// Información a enviar al BE
			li.children[0][0].value = prod.TMDB_entidad;
			li.children[0][1].value = prod.TMDB_id;
			li.children[0][2].value = prod.nombreOriginal;
			li.children[0][3].value = prod.idiomaOriginal_id;
			// Imagen
			li.children[0][4].children[0].src = prod.avatar
				? "https://image.tmdb.org/t/p/original" + prod.avatar
				: localhost + "/imagenes/0-Base/Avatar/Sin-Avatar.jpg";
			li.children[0][4].children[0].alt = prod.nombreOriginal;
			li.children[0][4].children[0].title = prod.nombreOriginal;
			// Información a mostrar
			li.children[0][4].children[1].children[0].children[0].innerHTML = prod.nombreOriginal;
			li.children[0][4].children[1].children[1].children[0].innerHTML = prod.nombreCastellano;
			// Completa los años
			if (prod.entidad == "colecciones") {
				let ano = prod.anoFin > prod.anoEstreno ? prod.anoFin + "-" + prod.anoEstreno : prod.anoEstreno;
				li.children[0][4].children[1].children[3].innerHTML = ano;
				li.children[0][4].children[1].children[4].innerHTML = "Capítulos: " + prod.capitulos;
			} else li.children[0][4].children[1].children[3].innerHTML = prod.anoEstreno;
			li.children[0][4].children[1].children[3].innerHTML += " - " + prod.entidadNombre;

			// Quitar la clase 'ocultar'
			li.classList.remove("ocultar");
			// Agrega el form
			DOM.listado.insertBefore(li, DOM.ingrManual);
			// Elimina el form modelo, que ya no se necesita
			DOM.prodsNuevos.remove();
		}

	// Productos ya en BD
	if (prodsYaEnBD.length)
		for (let prod of prodsYaEnBD) {
			// Crea el elemento 'li'
			let li = DOM.prodsYaEnBD.cloneNode(true);
			// Información a enviar al BE
			li.children[0].href += prod.entidad + "&id=" + prod.yaEnBD_id;

			// Imagen
			let avatar = !prod.avatar
				? localhost + "/imagenes/0-Base/Avatar/Sin-Avatar.jpg"
				: prod.avatar.includes("/")
				? prod.avatar
				: localhost + "/imagenes/2-Productos/Final/" + prod.avatar;
			li.children[0].children[0].children[0].src = avatar;
			li.children[0].children[0].children[0].alt = prod.nombreOriginal;
			li.children[0].children[0].children[0].title = prod.nombreOriginal;
			// Información a mostrar
			li.children[0].children[0].children[1].children[0].children[0].innerHTML = prod.nombreOriginal;
			li.children[0].children[0].children[1].children[1].children[0].innerHTML = prod.nombreCastellano;
			li.children[0].children[0].children[1].children[3].innerHTML = prod.anoEstreno + " - " + prod.entidadNombre;
			// Quitar la clase 'ocultar'
			li.classList.remove("ocultar");

			// Agrega el form
			DOM.listado.append(li);
			// Elimina el form modelo, que ya no se necesita
			DOM.prodsYaEnBD.remove();
		}

	// Agrega el mensaje
	document.querySelector("#mensaje").innerHTML = mensaje;

	// Hace foco en el primer producto
	document.querySelector("#listado li button").focus();

	// Desaparece el cartel
	if (ocultarCartel) {
		// Oculta el cartel
		DOM.cartel.classList.remove("aumenta");
		DOM.cartel.classList.add("disminuye");
	}

	// Desplazamiento original
	desplazamHoriz();

	// Comienzo de Back-end - Acciones a partir del click en una opción
	accionesLuegoDeElegirProdNuevo(DOM);
});
// Funciones
let accionesLuegoDeElegirProdNuevo = (DOM) => {
	// Variables
	const forms = document.querySelectorAll("#prodsNuevos form");
	let yaEligio;

	for (let form of forms) {
		form.addEventListener("submit", async (e) => {
			// Frena el POST
			e.preventDefault();

			// Pasa/no pasa
			if (yaEligio) return;
			else yaEligio = true;

			// Obtiene los datos
			let datos = {
				TMDB_entidad: e.target[0].value,
				TMDB_id: e.target[1].value,
				nombreOriginal: encodeURIComponent(e.target[2].value), // Es necesario porque sólo se consigue mediante 'search'
				idiomaOriginal_id: e.target[3].value, // Es necesario porque sólo se consigue mediante 'search'
			};

			// Muestra el cartel
			let titulo = "Estamos procesando la información...";
			const contenidos = ["Obteniendo más información del producto", "Revisando la información disponible"];
			let lis_fa_circle = cartel_Armado({DOM, titulo, contenidos});

			// 1. Actualiza Datos Originales
			lis_fa_circle[0].classList.replace("fa-regular", "fa-solid");
			await fetch("api/desambiguar-actualiza-datos-originales/?datos=" + JSON.stringify(datos)); // El 'await' es necesario para esperar a que se grabe la cookie en la controladora
			lis_fa_circle[0].classList.replace("fa-circle", "fa-circle-check");

			// 2. Averigua si la info tiene errores
			lis_fa_circle[1].classList.replace("fa-regular", "fa-solid");
			const errores = await fetch("api/desambiguar-averigua-si-la-info-tiene-errores").then((n) => n.json());
			lis_fa_circle[1].classList.replace("fa-circle", "fa-circle-check");

			// Desaparece el cartel
			DOM.fondo.classList.add("ocultar");
			DOM.cartel.classList.remove("aumenta");
			DOM.cartel.classList.add("disminuye");

			// Fin
			if (errores.hay) location.href = "datos-duros";
			else location.href = "datos-adicionales";
		});
	}
};
