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
		ocultarCartel = true;
		const APIs = [
			{ruta: "busca-los-productos", duracion: 1100},
			{ruta: "reemplaza-las-peliculas-por-su-coleccion", duracion: 700},
			{ruta: "pule-la-informacion", duracion: 800},
			{ruta: "obtiene-los-hallazgos-de-origen-IM-y-FA", duracion: 0},
		];
		let duracionTotal = 0;
		for (let API of APIs) duracionTotal += API.duracion;

		// Muestra el cartel
		DOM.cartel.classList.remove("ocultar");
		DOM.cartel.classList.remove("disminuye");
		DOM.cartel.classList.add("aumenta");

		// Ejecuta las APIs 'form'
		let duracionAcum = 0;
		for (let API of APIs) {
			await fetch("api/desambiguar-" + API.ruta + "/");
			duracionAcum += API.duracion;
			DOM.progreso.style.width = parseInt((duracionAcum / duracionTotal) * 100) + "%";
		}

		// Combina los hallazgos 'yaEnBD'
		productos = await fetch("api/desambiguar-combina-los-hallazgos-yaEnBD/").then((n) => n.json());
	}

	// Agrega los productos
	let {prodsNuevos, prodsYaEnBD, mensaje} = productos;

	// Agrega el mensaje
	document.querySelector("#mensaje").innerHTML = mensaje;

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

			// Quita la clase 'ocultar'
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

	// Hace foco en el primer producto
	document.querySelector("#listado li button").focus();

	// Desplazamiento original
	desplazamHoriz();

	// Acciones luego de elegir un producto nuevo
	accionesLuegoDeElegirProdNuevo(DOM);

	// Desaparece el cartel
	if (ocultarCartel) {
		// Oculta el cartel
		DOM.cartel.classList.remove("aumenta");
		DOM.cartel.classList.add("disminuye");
	}
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

			// Muestra el cartel
			DOM.tituloCartel.innerHTML = "Estamos procesando la información...";
			DOM.progreso.style.width = "0%";
			DOM.cartel.classList.remove("ocultar");
			DOM.cartel.classList.remove("disminuye");
			DOM.cartel.classList.add("aumenta");

			// Obtiene los datos
			let datos = {
				TMDB_entidad: e.target[0].value,
				TMDB_id: e.target[1].value,
				nombreOriginal: encodeURIComponent(e.target[2].value), // Es necesario porque sólo se consigue mediante 'search'
				idiomaOriginal_id: e.target[3].value, // Es necesario porque sólo se consigue mediante 'search'
			};

			// Actualiza Datos Originales
			await fetch("api/desambiguar-actualiza-datos-originales/?datos=" + JSON.stringify(datos)); // El 'await' es necesario para esperar a que se grabe la cookie en la controladora
			DOM.progreso.style.width = "100%";

			// 2. Averigua si la info tiene errores
			const errores = await fetch("api/desambiguar-averigua-si-la-info-tiene-errores").then((n) => n.json());

			// Desaparece el cartel
			DOM.cartel.classList.remove("aumenta");
			DOM.cartel.classList.add("disminuye");

			// Fin
			if (errores.hay) location.href = "datos-duros";
			else location.href = "datos-adicionales";
		});
	}
};
