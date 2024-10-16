"use strict";
window.addEventListener("load", async () => {
	// Variables
	const DOM = {
		mensaje: document.querySelector("#mensaje"),

		// Opciones
		listado: document.querySelector("#listado"),
		ingrManual: document.querySelector("#listado #ingrManual"),
		prodsNuevos: document.querySelector("#listado .prodsNuevos"),
		prodsYaEnBD: document.querySelector("#listado .prodsYaEnBD"),

		// Cartel
		cartelProgreso: document.querySelector("#cartelProgreso"),
		tituloCartel: document.querySelector("#cartelProgreso #titulo"),
		progreso: document.querySelector("#cartelProgreso #progreso"),
	};

	// Obtiene los datos de session
	const rutaBuscaInfoDeSession = rutas.session;
	let desambiguar = await fetch(rutaBuscaInfoDeSession).then((n) => n.json());
	if (!desambiguar) location.href = "agregar-pc"; // si no existe, redirige al paso anterior

	// Si corresponde, completa los datos de sesion
	if (!desambiguar.mensaje) {
		await barraProgreso(rutas.pre, APIs);
		desambiguar = await fetch(rutaBuscaInfoDeSession).then((n) => n.json());
	}
	const {prodsNuevos, prodsYaEnBD, mensaje} = desambiguar;

	// Agrega el mensaje
	DOM.mensaje.innerHTML = mensaje;

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
				: "/publico/imagenes/Avatar/Sin-Avatar.jpg";
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
			if (prod.entidad == "colecciones")
				infoPeli.querySelector("#capitulos").innerHTML = "Capítulos: " + prod.cantCaps_vTMDB;
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
			li.querySelector("a").href = "/" + prod.entidad + "/detalle/p/?id=" + prod.id;

			// Imagen
			let avatar = !prod.avatar
				? "/publico/imagenes/Avatar/Sin-Avatar.jpg"
				: prod.avatar.includes("/")
				? prod.avatar
				: "/Externa/2-Productos/Final/" + prod.avatar;
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

	// Desaparece el cartelProgreso
	DOM.cartelProgreso.classList.remove("aumenta");
	DOM.cartelProgreso.classList.add("disminuye");

	// Miscelaneas
	document.querySelector("#listado li button").focus(); // Hace foco en el primer producto
	desplazamHoriz(); // Desplazamiento original
	accionesAlElegirProdNuevo(DOM); // Acciones luego de elegir un producto nuevo
});

// Variables
const rutas = {
	pre: "/producto/api/pa-",
	actualiza: "/producto/api/pa-actualiza-datos-originales/?datos=",
	valida: "/producto/api/pa-valida-ds",
	session: "/producto/api/pa-busca-info-de-session",
};
const APIs = [
	{ruta: "busca-los-productos", duracion: 2000},
	{ruta: "reemplaza-las-peliculas-por-su-coleccion", duracion: 2000},
	{ruta: "organiza-la-info", duracion: 1000},
	{ruta: "agrega-hallazgos-de-IM-y-FA", duracion: 200},
	{ruta: "obtiene-el-mensaje", duracion: 200},
];

// Funciones
const accionesAlElegirProdNuevo = (DOM) => {
	// Variables
	DOM.forms = document.querySelectorAll(".prodsNuevos form");
	let yaEligio;

	for (let form of DOM.forms) {
		form.addEventListener("submit", async (e) => {
			// Frena el POST
			e.preventDefault();

			// Pasa/no pasa
			if (yaEligio) return;
			else yaEligio = true;

			// Muestra el cartelProgreso
			DOM.tituloCartel.innerHTML = "Procesando la información...";
			DOM.progreso.style.width = "0%";
			DOM.cartelProgreso.classList.remove("disminuye");
			DOM.cartelProgreso.classList.remove("ocultar");
			DOM.cartelProgreso.classList.add("aumenta");

			// Obtiene los datos
			let datos = {
				TMDB_entidad: e.target[0].value,
				TMDB_id: e.target[1].value,
				nombreOriginal: encodeURIComponent(e.target[2].value), // Es necesario porque sólo se consigue mediante 'search'
				idiomaOriginal_id: e.target[3].value, // Es necesario porque sólo se consigue mediante 'search'
			};

			// Actualiza Datos Originales
			await fetch(rutas.actualiza + JSON.stringify(datos)); // El 'await' es necesario para esperar a que se grabe la cookie en la controladora
			DOM.progreso.style.width = "100%";

			// 2. Averigua si la info tiene errores
			const errores = await fetch(rutas.valida).then((n) => n.json());

			// Desaparece el cartelProgreso
			DOM.cartelProgreso.classList.remove("aumenta");
			DOM.cartelProgreso.classList.add("disminuye");

			// Fin
			if (errores.hay) location.href = "agregar-dd";
			else location.href = "agregar-da";
		});
	}
};
