"use strict";
window.addEventListener("load", async () => {
	// Si no existe la información a desambiguar, redirige al paso anterior
	const desambiguar = await fetch("api/desambiguar-busca-session-desambiguar").then((n) => (n ? n.json() : ""));
	if (!desambiguar) location.href = "palabras-clave";

	// Variables
	let DOM = {
		// DOM - Opciones
		listado: document.querySelector("#listado"),
		ingrManual: document.querySelector("#listado #ingrManual"),
		prodsNuevos: document.querySelector("#listado #prodsNuevos"),
		prodsYaEnBD: document.querySelector("#listado #prodsYaEnBD"),

		// DOM - Cartel
		fondo: document.querySelector("#tapar-el-fondo"),
		cartel: document.querySelector("#cartel"),
		cartelTitulo: document.querySelector("#cartel #titulo"),
		cartelUl: document.querySelector("#cartel ul"),
		cartelAlerta: document.querySelector("#cartel #alerta"),
		cartelTrabajando: document.querySelector("#cartel #trabajando"),
	};
	const localhost = await fetch("/api/localhost").then((n) => (n ? n.json() : ""));
	let lis_fa_circle;

	// Cartel - configuración
	cartel_Configuracion(DOM);

	// Acciones si no hay productos en 'session'
	let productos = desambiguar.productos;
	if (!productos) {
		// Muestra el cartel
		let titulo = "En proceso...";
		const contenidos = ["Buscando productos", "Reemplazando películas por su colección", "Completando la información"];
		lis_fa_circle = cartel_Armado({DOM, titulo, contenidos});

		// Busca los productos y los guarda en session
		lis_fa_circle[0].classList.replace("fa-regular", "fa-solid");
		await fetch("api/desambiguar-busca-los-productos/");
		lis_fa_circle[0].classList.replace("fa-circle", "fa-circle-check");

		// Reemplaza las películas por su colección
		lis_fa_circle[1].classList.replace("fa-regular", "fa-solid");
		await fetch("api/desambiguar-reemplaza-las-peliculas-por-su-coleccion/");
		lis_fa_circle[1].classList.replace("fa-circle", "fa-circle-check");

		// Pule la información
		lis_fa_circle[2].classList.replace("fa-regular", "fa-solid");
		productos = await fetch("api/desambiguar-pule-la-informacion/").then((n) => n.json());
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
	if (lis_fa_circle) {
		// Actualiza los íconos
		lis_fa_circle[2].classList.replace("fa-circle", "fa-circle-check");

		// Oculta el cartel
		DOM.fondo.classList.add("ocultar");
		DOM.cartel.classList.remove("aumenta");
		DOM.cartel.classList.add("disminuye");
	}

	// Desplazamiento original
	desplazamHoriz();

	// Comienzo de Back-end - Acciones a partir del click en una opción
	accionesLuegoDeElegirProdNuevo(DOM);
});
// Funciones
let cartel_Configuracion = (DOM) => {
	// Quita los dots del 'ul'
	DOM.cartelUl.style.listStyleType = "none";

	// Cambia el color de fondo
	DOM.cartel.classList.add("trabajando");

	// Cambia el ícono de encabezado
	DOM.cartelAlerta.classList.add("ocultar");
	DOM.cartelTrabajando.classList.remove("ocultar");

	// Fin
	return;
};
let cartel_Armado = ({DOM, titulo, contenidos}) => {
	// Titulo
	DOM.cartelTitulo.innerHTML = titulo;
	DOM.cartelUl.innerHTML = "";

	// Contenido
	for (let contenido of contenidos) {
		// Crea el 'li'
		let li = document.createElement("li");

		// Crea el círculo y lo agrega
		let i = document.createElement("i");
		i.classList.add("fa-regular", "fa-circle");
		li.appendChild(i);

		// Agrega el texto
		li.innerHTML += contenido;
		DOM.cartelUl.appendChild(li);
	}

	// DOM - íconos
	const lis_fa_circle = document.querySelectorAll("#cartel li i.fa-circle");

	// Hace visible el cartel
	DOM.fondo.classList.remove("ocultar");
	DOM.cartel.classList.remove("ocultar");
	DOM.cartel.classList.remove("disminuye");
	DOM.cartel.classList.add("aumenta");

	// Fin
	return lis_fa_circle;
};
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
