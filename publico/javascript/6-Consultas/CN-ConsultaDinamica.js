"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Formulario General
		cuerpo: document.querySelector("#cuerpo"),
		asegurate: document.querySelector("#cuerpo #comencemos button#rojo"),
		comencemos: document.querySelector("#cuerpo #comencemos button#verde"),
		elegiblesSimple: document.querySelectorAll("#cuerpo .elegibleSimple .input"),

		// Filtro personalizado
		filtroPers: document.querySelector("#filtrosPers select[name='filtrosPers']"),
		nuevo: document.querySelector("#filtrosPers i#nuevo"),
		reinicio: document.querySelector("#filtrosPers i#reinicio"),
		actualiza: document.querySelector("#filtrosPers i#actualiza"),
		modificaNombre: document.querySelector("#filtrosPers i#modificaNombre"),
		elimina: document.querySelector("#filtrosPers i#elimina"),
		iconos: document.querySelectorAll("#filtrosPers #iconos i"),

		// Layout y Orden
		layoutSelect: document.querySelector("#encabezado select[name='layout']"),
		ordenSelect: document.querySelector("#encabezado select[name='orden']"),
		opcionesOrdenVista: document.querySelectorAll("#encabezado select[name='orden'] option:not(option[value=''])"),
		ascDesSector: document.querySelector("#encabezado #ascDes"),
		ascDesInputs: document.querySelectorAll("#encabezado #ascDes input"),

		// Filtros
		nav: document.querySelector("#filtros #campos nav"),
		cfcSelect: document.querySelector("#filtros #campos nav #cfc select"),
		ocurrioSector: document.querySelector("#filtros #campos #ocurrio"),
		ocurrioSelect: document.querySelector("#filtros #campos #ocurrio select"),
		ocurrioSISectores: document.querySelectorAll("#filtros #campos .ocurrioSI"),
		epoca_idSelect: document.querySelector("#filtros #campos #epoca_id select"),
		apMarSector: document.querySelector("#filtros #campos #apMar"),
		apMarSelect: document.querySelector("#filtros #campos #apMar select"),
		canonsSector: document.querySelector("#filtros #campos #canons"),
		canonsSelect: document.querySelector("#filtros #campos #canons select"),
		rolesIglSector: document.querySelector("#filtros #campos #rolesIglesia"),
		rolesIglesiaSelect: document.querySelector("#filtros #campos #rolesIglesia select"),
		demasElegibles: document.querySelectorAll("#filtros #campos .demasElegibles .input"),
		palabrasClave: document.querySelector("#filtros #campos #palabrasClave"),
	};
	let rutas = {
		layoutsOrdenes: "/consultas/api/layouts-y-ordenes",
		guardaFiltroID: "/consultas/api/guarda-filtro_id/?filtro_id=",
		opcionesFiltroPers: "/consultas/api/opciones-de-filtro-personalizado/?filtro_id=",
		productos: "/consultas/api/obtiene-los-productos/?datos=",
		rclvs: "/consultas/api/obtiene-los-rclvs/?datos=",
	};
	let elegibles = {};
	let varias = {
		comencemos: true,
		...(await fetch(rutas.layoutsOrdenes).then((n) => n.json())),
	};
	// Obtiene tabla de layouts y ordenes

	// Funciones
	let encabFiltros = {
		// Impactos de layout
		impactosDeLayout: function () {
			// Asigna valor a las variables
			const SI = !!DOM.layoutSelect.value;
			varias.layout = SI ? varias.layouts.find((n) => n.id == DOM.layoutSelect.value) : null;
			elegibles.entidad = SI ? varias.layout.entidad : null;
			varias.ocurrio = SI ? varias.layout.ocurrio : null;
			// if (SI) elegibles.layout_id = DOM.layoutSelect.value;

			// Siguiente rutina
			this.impactosEnDeOrden();

			// Fin
			return;
		},
		// Impactos en/de orden
		impactosEnDeOrden: function () {
			// IMPACTOS EN - Oculta/Muestra las opciones que corresponden
			const checked = document.querySelector("#encabezado select[name='orden'] option:checked");
			varias.opcionesOrdenBD.forEach((opcion, i) => {
				// Acciones si no existe 'layout' o la opción tiene una entidad distinta a la de layout
				if (!varias.layout || opcion.entidad != varias.layout.entidad) {
					// 1. Oculta la opción
					DOM.opcionesOrdenVista[i].classList.add("ocultar");
					// 2. La 'des-selecciona'
					if (DOM.opcionesOrdenVista[i] == checked) DOM.ordenSelect.value = "";
				}
				// En caso contrario, muestra la opción
				else DOM.opcionesOrdenVista[i].classList.remove("ocultar");
			});

			// IMPACTOS DE
			if (DOM.ordenSelect.value) elegibles.orden_id = DOM.ordenSelect.value;

			this.impactosEnDeAscDes();

			// Fin
			return;
		},
		impactosEnDeAscDes: function () {
			// Variables
			const orden = DOM.ordenSelect.value ? varias.opcionesOrdenBD.find((n) => n.id == DOM.ordenSelect.value) : null;

			// IMPACTOS EN
			const SI = !DOM.ordenSelect.value || orden.asc_des != "ascDes";
			SI ? DOM.ascDesSector.classList.add("ocultar") : DOM.ascDesSector.classList.add("flexCol");
			SI ? DOM.ascDesSector.classList.remove("flexCol") : DOM.ascDesSector.classList.remove("ocultar");
			if (SI && DOM.ordenSelect.value) elegibles.asc_des = orden.asc_des;
			if (!SI) for (let input of DOM.ascDesInputs) if (input.checked) elegibles.asc_des = input.value;

			// IMPACTOS DE - Sector 'OK'
			elegibles.asc_des ? DOM.ascDesSector.classList.add("OK") : DOM.ascDesSector.classList.remove("OK");

			this.mostrarOcultar();
			this.impactosDeCFC();

			// Fin
			return;
		},
		mostrarOcultar: () => {
			const SI = apoyo.condicionesMinimas();

			// Muestra/Oculta sectores
			SI ? DOM.nav.classList.remove("ocultar") : DOM.nav.classList.add("ocultar");
			SI ? DOM.asegurate.classList.add("ocultar") : DOM.asegurate.classList.remove("ocultar");
			SI && varias.comencemos ? DOM.comencemos.classList.remove("ocultar") : DOM.comencemos.classList.add("ocultar");

			// Fin
			return;
		},
		impactosDeCFC: function () {
			// IMPACTOS DE
			varias.cfc = DOM.cfcSelect.value ? DOM.cfcSelect.value : "";
			if (varias.cfc) elegibles.cfc = varias.cfc;

			this.impactosEnDeOcurrio();

			// Fin
			return;
		},
		// Impactos en/de ocurrio
		impactosEnDeOcurrio: function () {
			// IMPACTOS EN
			varias.ocurrio ? DOM.ocurrioSector.classList.add("ocultar") : DOM.ocurrioSector.classList.remove("ocultar");

			// IMPACTOS DE
			// 1. Actualiza el valor de 'ocurrio'
			if (!varias.ocurrio && DOM.ocurrioSelect.value) varias.ocurrio = DOM.ocurrioSelect.value;
			// 2. Muestra/Oculta los sectores dependientes
			for (let ocurrioSISector of DOM.ocurrioSISectores)
				varias.ocurrio && varias.ocurrio != "NO"
					? ocurrioSISector.classList.remove("ocurrioSI")
					: ocurrioSISector.classList.add("ocurrioSI");
			// 3. Asigna el valor para 'ocurrio'
			if (varias.ocurrio) elegibles.ocurrio = varias.ocurrio;

			this.impactosEnDeEpoca();

			// Fin
			return;
		},
		// Impactos en/de epoca_id
		impactosEnDeEpoca: function () {
			if (varias.ocurrio && varias.ocurrio != "NO") {
				// IMPACTOS EN - Sólo se muestra el sector si ocurrió != 'NO' - resuelto en impactosEnDeOcurrio

				// IMPACTOS DE
				varias.epoca_id = DOM.epoca_idSelect.value ? DOM.epoca_idSelect.value : "";
				if (varias.epoca_id) elegibles.epoca_id = varias.epoca_id;
			}

			this.impactosEnDeApMar();

			// Fin
			return;
		},
		// Impactos en/de apMar
		impactosEnDeApMar: function () {
			if (varias.ocurrio && varias.ocurrio != "NO") {
				// IMPACTOS EN
				// Sólo se muestra el sector si ocurrió != 'NO' - resuelto en impactosEnDeOcurrio
				// Sólo se muestra el sector si CFC='SI' y epoca_id='pst'
				if (varias.cfc == "CFC" && varias.epoca_id == "pst") DOM.apMarSector.classList.remove("ocultarApMar");
				else DOM.apMarSector.classList.add("ocultarApMar");

				// IMPACTOS DE
				if (DOM.apMarSelect.value) elegibles.apMar = DOM.apMarSelect.value;
			}

			this.impactosEnDeCanonsMasRolesIglesia();

			// Fin
			return;
		},
		// Impactos en/de canons y rolesIglesia
		impactosEnDeCanonsMasRolesIglesia: function () {
			// IMPACTOS EN
			// Sólo se muestra el sector si ocurrió != 'NO' - resuelto en impactosEnDeOcurrio
			// Sólo se muestra el sector si entidad='personajes' y CFC='SI'
			const SI = elegibles.ocurrio == "pers" && varias.cfc == "CFC";
			SI ? DOM.canonsSector.classList.remove("ocultarCanons") : DOM.canonsSector.classList.add("ocultarCanons");
			SI
				? DOM.rolesIglSector.classList.remove("ocultarRolesIglesia")
				: DOM.rolesIglSector.classList.add("ocultarRolesIglesia");

			// IMPACTOS DE
			if (DOM.canonsSelect.value) elegibles.canons_id = DOM.canonsSelect.value;
			if (DOM.rolesIglesiaSelect.value) elegibles.roles_iglesia_id = DOM.rolesIglesiaSelect.value;

			this.impactosDeDemasElegibles();

			// Fin
			return;
		},
		// Impactos de Demás Elegibles
		impactosDeDemasElegibles: function () {
			for (let elegible of DOM.demasElegibles) if (elegible.value) elegibles[elegible.name] = elegible.value;

			// Fin
			return;
		},
	};
	let filtrosPers = {
		impactosDeFiltroPers: async function () {
			// Variables
			const filtro_id = DOM.filtroPers.value;
			if (!filtro_id) return;

			// Actualiza el filtro_id en la cookie y el usuario (session y BD)
			fetch(rutas.guardaFiltroID + filtro_id);

			// Obtiene las opciones de la BD
			const opciones = await fetch(rutas.opcionesFiltroPers + filtro_id).then((n) => n.json());

			// Actualiza los elegibles simples (Encabezado + Filtros)
			for (let elegibleSimple of DOM.elegiblesSimple)
				elegibleSimple.value = opciones[elegibleSimple.name] ? opciones[elegibleSimple.name] : "";

			// Actualiza los elegibles 'AscDes'
			for (let input of DOM.ascDesInputs) input.checked = opciones.ascDes && elegible.value == opciones.ascDes;

			// Actualiza los botones
			this.impactosEnBotonesPorFiltroPers();

			// Fin
			return;
		},
		impactosEnBotonesPorFiltroPers: () => {
			// 1. Inactiva las opciones 'reinicio' y 'actualiza'
			DOM.reinicio.classList.add("inactivo");
			DOM.actualiza.classList.add("inactivo");

			// 2. Acciones para los íconos 'modificaNombre' y 'elimina'
			const filtroElegido = DOM.filtroPers.value;
			filtroElegido == 1 ? DOM.modificaNombre.classList.add("inactivo") : DOM.modificaNombre.classList.remove("inactivo");
			filtroElegido == 1 ? DOM.elimina.classList.add("inactivo") : DOM.elimina.classList.remove("inactivo");

			// Fin
			return;
		},
		impactosEnBotonesPorElegibles: () => {
			// Inactiva las opciones de 'modificaNombre' y 'elimina' en la vista
			DOM.modificaNombre.classList.add("inactivo");
			DOM.elimina.classList.add("inactivo");

			// Activa las opciones de 'nuevo', 'reinicio' y 'actualiza'
			DOM.nuevo.classList.remove("inactivo");
			DOM.reinicio.classList.remove("inactivo");
			if (DOM.filtroPers.value != 1) DOM.actualiza.classList.remove("inactivo");

			// Fin
			return;
		},
		impactoEnBotonesPorCondicMins: () => {
			// Variables
			const SI = apoyo.condicionesMinimas();

			// Si no están dadas las condiciones mínimas, se inactivan todos los botones
			if (!SI) for (let icono of DOM.iconos) icono.classList.add("inactivo");

			// Fin
			return;
		},
	};
	let apoyo = {
		condicionesMinimas: () => {
			const SI_layout = !!DOM.layoutSelect.value;
			const SI_orden = !!DOM.ordenSelect.value;
			const SI_ascDes = !!elegibles.asc_des;
			const SI = SI_layout && SI_orden && SI_ascDes;

			// Comencemos
			if (!SI) varias.comencemos = true;

			// Fin
			return SI;
		},
		limpiaLineasConsecutivas: () => {
			// Variables
			let hijos = document.querySelectorAll("#cuerpo #filtros .sectorConDesplV nav > *");
			let tags = [];

			hijos.forEach((hijo, num) => {
				// Limpia el historial de 'ocultar' para los 'HR'
				if (hijo.tagName == "HR") hijo.classList.remove("ocultar");
				// Detecta todos los hijos con orden dos y visibles
				if (
					window.getComputedStyle(hijo).getPropertyValue("order") == 2 &&
					window.getComputedStyle(hijo).getPropertyValue("display") != "none"
				)
					tags.push({tag: hijo.tagName, num});
			});

			// Si hay 2 líneas consecutivas en orden dos, oculta la última
			for (let i = 1; i < tags.length; i++)
				if (tags[i - 1].tag == "HR" && tags[i].tag == "HR") hijos[tags[i].num].classList.add("ocultar");

			// Fin
			return;
		},
	};
	let zonaDeProds = {
		obtieneLosProductos: async () => {
			// Si no se hizo 'click' sobre el botón 'comencemos', frena
			if (varias.comencemos) return;

			// Obtiene los resultados
			console.log("Busca los productos");
			const resultados =
				elegibles.entidad == "producto"
					? await fetch(rutas.productos + JSON.stringify(elegibles)).then((n) => n.json())
					: [];

			console.log(resultados.length);
			// Actualiza el contador

			// Actualiza la información mostrada

			// Fin
			return;
		},
	};

	// Eventos
	DOM.cuerpo.addEventListener("change", async (e) => {
		// Variables
		let clickEnFiltrosPers = e.target.name == "filtrosPers";
		elegibles = {};

		// Novedades en el Filtro Personalizado
		if (clickEnFiltrosPers) await filtrosPers.impactosDeFiltroPers();

		// Impacto en Encabezado y Filtros
		encabFiltros.impactosDeLayout();
		if (e.target.name == "palabrasClave")
			e.target.value ? DOM.palabrasClave.classList.add("verde") : DOM.palabrasClave.classList.remove("verde");

		// Botones en Filtros Personalizados
		if (!clickEnFiltrosPers) {
			if (!apoyo.condicionesMinimas()) filtrosPers.impactoEnBotonesPorCondicMins();
			else filtrosPers.impactosEnBotonesPorElegibles();
		}

		// Limpia líneas consecutivas
		apoyo.limpiaLineasConsecutivas();

		// Obtiene los productos
		await zonaDeProds.obtieneLosProductos();

		// Fin
		return;
	});
	// Comencemos
	DOM.comencemos.addEventListener("click", async () => {
		// Oculta el botón
		DOM.comencemos.classList.add("ocultar");
		varias.comencemos = false;

		// Siguientes pasos
		await zonaDeProds.obtieneLosProductos();

		// Fin
		return;
	});
	// Reinicio
	reinicio.addEventListener("click", async () => {
		// Variables
		elegibles = {};

		// Novedades en el Filtro Personalizado
		await filtrosPers.impactosDeFiltroPers();

		// Impacto en Encabezado y Filtros, y Palabras Clave
		encabFiltros.impactosDeLayout();
		DOM.palabrasClave.value ? DOM.palabrasClave.classList.add("verde") : DOM.palabrasClave.classList.remove("verde");

		// Limpia líneas consecutivas
		apoyo.limpiaLineasConsecutivas();

		// Obtiene los productos
		await zonaDeProds.obtieneLosProductos();

		// Fin
		return;
	});

	// Start-up
	encabFiltros.impactosDeLayout();
});
