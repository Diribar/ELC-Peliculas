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
	let pausa = 200; // milisegundos
	let ocultarCartel;

	// Acciones si no hay productos en 'session'
	if (!productos) {
		// Variables
		ocultarCartel = true;
		const APIs = [
			{ruta: "busca-los-productos", duracion: 1200},
			{ruta: "reemplaza-las-peliculas-por-su-coleccion", duracion: 1000},
			{ruta: "pule-la-informacion", duracion: 1000},
			{ruta: "obtiene-los-hallazgos-de-origen-IM-y-FA", duracion: 100},
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
			let ahora = Date.now();
			// Busca la información
			let aux = fetch("api/desambiguar-" + API.ruta + "/");

			// Evoluciona el progreso mientras espera la información
			for (let repeticion = 0; repeticion < parseInt(API.duracion / pausa); repeticion++) {
				await espera(pausa);
				duracionAcum += pausa;
				DOM.progreso.style.width = parseInt((duracionAcum / duracionTotal) * 100) + "%";
			}

			// Se asegura de haber recibido la información
			let delta=Date.now() - ahora
			console.log(delta, API.duracion,parseInt((delta/API.duracion-1)*100)+"%");
			aux = await aux;
		}
		DOM.progreso.style.width = "100%";

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
			let boton = li.querySelector("button");

			// Información a enviar al BE
			li.querySelector("input[name='TMDB_entidad").value = prod.TMDB_entidad;
			li.querySelector("input[name='TMDB_id").value = prod.TMDB_id;
			li.querySelector("input[name='nombreOriginal").value = prod.nombreOriginal;
			li.querySelector("input[name='idiomaOriginal_id").value = prod.idiomaOriginal_id;

			// Imagen
			let imagen = boton.querySelector("img");
			imagen.src = prod.avatar
				? "https://image.tmdb.org/t/p/original" + prod.avatar
				: localhost + "/imagenes/0-Base/Avatar/Sin-Avatar.jpg";
			imagen.alt = prod.nombreOriginal;
			imagen.title = prod.nombreOriginal;

			// Información a mostrar
			let infoPeli = boton.querySelector("#infoPeli");
			infoPeli.querySelector("#nombreOriginal").innerHTML = prod.nombreOriginal;
			infoPeli.querySelector("#nombreCastellano").innerHTML = prod.nombreCastellano;

			// Completa los años y entidad nombre
			const anos = prod.anoFin && prod.anoFin > prod.anoEstreno ? prod.anoFin + "-" + prod.anoEstreno : prod.anoEstreno;
			infoPeli.querySelector("#anoEstreno").innerHTML = anos + " - " + prod.entidadNombre;

			// Si es una colección, agrega la cantidad de capítulos
			if (prod.entidad == "colecciones") infoPeli.querySelector("#capitulos").innerHTML = "Capítulos: " + prod.capitulos;
			else infoPeli.querySelector("#capitulos").remove();

			// Quita la clase 'ocultar'
			li.classList.remove("ocultar");

			// Agrega el form
			DOM.listado.insertBefore(li, DOM.ingrManual);
		}

	// Productos ya en BD
	if (prodsYaEnBD.length)
		for (let prod of prodsYaEnBD) {
			// Crea el elemento 'li'
			let li = DOM.prodsYaEnBD.cloneNode(true);
			let boton = li.querySelector("a button");

			// Información a enviar al BE
			li.querySelector("a").href += prod.entidad + "&id=" + prod.yaEnBD_id;

			// Imagen
			let avatar = !prod.avatar
				? localhost + "/imagenes/0-Base/Avatar/Sin-Avatar.jpg"
				: prod.avatar.includes("/")
				? prod.avatar
				: localhost + "/imagenes/2-Productos/Final/" + prod.avatar;
			let imagen = boton.querySelector("img");
			imagen.src = avatar;
			imagen.alt = prod.nombreOriginal;
			imagen.title = prod.nombreOriginal;
			// Información a mostrar
			let infoPeli = boton.querySelector("#infoPeli");
			infoPeli.querySelector("#nombreOriginal").innerHTML = prod.nombreOriginal;
			infoPeli.querySelector("#nombreCastellano").innerHTML = prod.nombreCastellano;
			infoPeli.querySelector("#anoEstreno").innerHTML = prod.anoEstreno + " - " + prod.entidadNombre;
			// Quita la clase 'ocultar'
			li.classList.remove("ocultar");

			// Agrega el form
			DOM.listado.append(li);
		}

	// Elimina los forms modelo, que ya no se necesitan más
	DOM.prodsNuevos.remove();
	DOM.prodsYaEnBD.remove();

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
let espera = (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
