"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Partes del cuerpo
		cuerpo: document.querySelector("#cuerpo"),

		// Partes del Encabezado
		layout: document.querySelector("#cuerpo #encabezado select[name='layout']"),
		orden: document.querySelector("#cuerpo #encabezado select[name='orden']"),
		opciones_orden: document.querySelectorAll("#cuerpo #encabezado select[name='orden'] option"),
		sector_AscDes: document.querySelector("#cuerpo #encabezado #ascDes"),

		// Filtro personalizado
		filtroCabecera: document.querySelector("#filtrosPers select[name='filtrosPers']"),
		nuevo: document.querySelector("#filtrosPers i#nuevo"),
		reinicio: document.querySelector("#filtrosPers i#reinicio"),
		actualiza: document.querySelector("#filtrosPers i#actualiza"),
		modificaNombre: document.querySelector("#filtrosPers i#modificaNombre"),
		elimina: document.querySelector("#filtrosPers i#elimina"),
		iconos: document.querySelectorAll("#filtrosPers #iconos i"),

		// Partes del Filtro
		hechosReales: document.querySelector("#cuerpo #filtros #hechosReales select[name='hechosReales']"),
		sector_hechosReales: document.querySelector("#cuerpo #filtros #hechosReales"),
		sector_personajes: document.querySelector("#cuerpo #filtros #personajes"),
		sector_hechos: document.querySelector("#cuerpo #filtros #hechos"),

		// Datos elegidos
		elegiblesSimples: document.querySelectorAll("#cuerpo .elegibleSimple"),
		elegiblesComplejos: document.querySelectorAll("#cuerpo .elegibleComplejo"),

		// Rutas
		rutaCambiaFiltroPers: "/consultas/api/opciones-de-filtro-personalizado/?filtro_id=",
		rutaGuardaSessionCookies: "/consultas/api/guarda-session-cookie/?datos=",
		rutaProductos: "/consultas/api/obtiene-los-productos/?datos=",
	};
	let opciones, nombre, valor;

	// Funciones
	let impactosDeFiltro = async () => {
		// 1. Inactiva las opciones 'reinicio' y 'actualiza'
		v.reinicio.classList.add("inactivo");
		v.actualiza.classList.add("inactivo");

		// 2. Acciones para los íconos, dependiendo de si el filtro personalizado es el Estándar
		valor == 1 ? v.modificaNombre.classList.add("inactivo") : v.modificaNombre.classList.remove("inactivo");
		valor == 1 ? v.elimina.classList.add("inactivo") : v.elimina.classList.remove("inactivo");

		// 3. Obtiene las opciones de la BD
		opciones = await fetch(v.rutaCambiaFiltroPers + valor).then((n) => n.json());

		// 4. Actualiza las elecciones (Encabezado + Filtros)
		for (let elegible of v.elegiblesSimples) elegible.value = opciones[elegible.name] ? opciones[elegible.name] : "";
		for (let elegible of v.elegiblesComplejos)
			elegible.checked = opciones[elegible.name] && opciones[elegible.name].includes(elegible.value);

		// Fin
		impactosDeLayout();
		return;
	};
	let impactosDeLayout = () => {
		let layoutElegido = v.layout.value;

		// Acciones en 'Ordenes'
		for (let opcion of v.opciones_orden) {
			// Muestra opciones
			if (opcion.className.includes("siempre") || opcion.className.includes(layoutElegido))
				opcion.classList.remove("ocultar");
			// Acciones si la opcion no se corresponde con el layout
			else {
				// Oculta opciones
				opcion.classList.add("ocultar");
				// Des-selecciona una opcion si no corresponde al layout
				if (opcion.value == v.orden.value) v.orden.value = "";
			}
		}

		// Fin
		impactosDeOrden();
		return;
	};
	let impactosDeOrden = () => {
		// 1. Acciones en Ascendente / Descendente - Muestra u oculta el sector
		let ordenElegido = document.querySelector("#cuerpo select[name='orden'] option:checked");
		ordenElegido.className.includes("ascDes")
			? v.sector_AscDes.classList.remove("ocultar")
			: v.sector_AscDes.classList.add("ocultar");

		// 2. Acciones en 'Basado en Hechos Reales' - Tiene que figurar 'bhr' en el layout y en el orden
		v.layout.className.includes("bhr") && v.orden.className.includes("bhr")
			? v.sector_hechosReales.classList.remove("ocultar")
			: v.sector_hechosReales.classList.add("ocultar");

		// Fin
		impactosDeBHR();
		return;
	};
	let impactosDeBHR = () => {
		// Acciones en Personajes
		v.layout.value == "personajes"
			? v.sector_personajes.classList.remove("ocultar")
			: v.layout.value == "hechos"
			? v.sector_personajes.classList.add("ocultar")
			: v.hechosReales.className.includes("personajes")
			? v.sector_personajes.classList.remove("ocultar")
			: v.sector_personajes.classList.add("ocultar");

		// Acciones en Hechos
		v.layout.value == "hechos"
			? v.sector_hechos.classList.remove("ocultar")
			: v.layout.value == "personajes"
			? v.sector_hechos.classList.add("ocultar")
			: v.hechosReales.className.includes("hechos")
			? v.sector_hechos.classList.remove("ocultar")
			: v.sector_hechos.classList.add("ocultar");

		// Fin
		return;
	};
	let impactosEnBotonesFP = () => {
		// Inactiva las opciones de 'modificaNombre' y 'elimina' en la vista
		v.modificaNombre.classList.add("inactivo");
		v.elimina.classList.add("inactivo");

		// Acciones si el filtro personalizado es uno definido
		if (v.filtroCabecera.value) {
			// Activa la opcion de 'reinicio'
			v.reinicio.classList.remove("inactivo");
			// Activa la opcion de 'actualiza'
			if (v.filtroCabecera.value != 1) v.actualiza.classList.remove("inactivo");
		}
		// Inactiva todos los íconos menos 'nuevo' (el primero)
		else
			v.iconos.forEach((icono, i) => {
				if (i) icono.classList.add("inactivo");
			});
		// Fin
		return;
	};

	// Novedad en algún lado
	v.cuerpo.addEventListener("change", async (e) => {
		// Variables
		nombre = e.target.name;
		valor = e.target.value;

		// Novedades en el Filtro Personalizado - Borra todo y lo deja según el filtro personalizado
		if (nombre == "filtrosPers") await impactosDeFiltro();
		else {
			// Novedades en el layout
			if (nombre == "layout") impactosDeLayout();

			// Novedades en el orden
			if (nombre == "orden") impactosDeOrden();

			// Novedades en BHR
			if (nombre == "hechosReales") impactosDeBHR();

			// Botones en Filtros Personalizados
			impactosEnBotonesFP();
		}


		// Averigua si faltan datos mandatorios o si "Comencemos" está visible
		// En caso afirmativo, termina

		// Si está todo en orden, continúa el proceso

		// Fin
		return;
	});

	// Startup
	impactosDeFiltro();
});
