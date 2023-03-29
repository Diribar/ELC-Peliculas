"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Formulario General
		cuerpo: document.querySelector("#cuerpo"),
		asegurate: document.querySelector("#cuerpo #comencemos button#rojo"),
		comencemos: document.querySelector("#cuerpo #comencemos button#verde"),
		elegiblesSimple: document.querySelectorAll("#cuerpo .elegibleSimple"),

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
		ordenamSector: document.querySelector("#encabezado #ascDes"),
		ordenamInputs: document.querySelectorAll("#encabezado #ascDes input"),

		// Filtros
		nav: document.querySelector("#filtros #campos nav"),
		cfcSelect: document.querySelector("#filtros #campos nav #cfc select"),
		ocurrioSector: document.querySelector("#filtros #campos #ocurrio"),
		ocurrioSelect: document.querySelector("#filtros #campos #ocurrio select"),
		ocurrioSISectores: document.querySelectorAll("#filtros #campos .ocurrioSI"),
		epocaSelect: document.querySelector("#filtros #campos #epoca select"),
		apMarSector: document.querySelector("#filtros #campos #apMar"),
		apMarSelect: document.querySelector("#filtros #campos #apMar select"),
		canonsSector: document.querySelector("#filtros #campos #canons"),
		canonsSelect: document.querySelector("#filtros #campos #canons select"),
		rolesIglSector: document.querySelector("#filtros #campos #rolesIglesia"),
		rolesIglesiaSelect: document.querySelector("#filtros #campos #rolesIglesia select"),
		demasElegibles: document.querySelectorAll("#filtros #campos .demasElegibles .input"),
		palabrasClave: document.querySelector("#filtros #campos #palabrasClave"),

		// Rutas
		rutaLayoutsOrdenes: "/consultas/api/layouts-y-ordenes",
		rutaGuardaFiltroID: "/consultas/api/guarda-filtro_id/?filtro_id=",
		rutaOpcionesFiltroPers: "/consultas/api/opciones-de-filtro-personalizado/?filtro_id=",
		rutaProductos: "/consultas/api/obtiene-los-productos/?datos=",

		// Otras variables
		notNull: "",
		cfc: "",
		epoca_id: "",
		ocurrio: "",
		elegibles: {},
		start: true,
	};
	// Obtiene tabla de layouts y ordenes
	const [layouts, opcionesOrdenBD] = await fetch(v.rutaLayoutsOrdenes).then((n) => n.json());

	// Funciones
	let encabFiltros = {
		// Impactos de layout
		impactosDeLayout: function () {
			// Asigna valor a las variables
			const SI = !!v.layoutSelect.value;
			v.layout = SI ? layouts.find((n) => n.id == v.layoutSelect.value) : null;
			v.notNull = SI ? v.layout.not_null_out : null;
			v.ocurrio = SI ? v.layout.ocurrio : null;
			if (SI) v.elegibles.layout = v.layoutSelect.value;

			// Siguiente rutina
			this.impactosEnDeOrden();

			// Fin
			return;
		},
		// Impactos en/de orden
		impactosEnDeOrden: function () {
			// IMPACTOS EN - Oculta/Muestra las opciones que corresponden
			const checked = document.querySelector("#encabezado select[name='orden'] option:checked");
			opcionesOrdenBD.forEach((opcion, i) => {
				if (!v.layout || (opcion.not_null_in && opcion.not_null_in != v.layout.not_null_out)) {
					v.opcionesOrdenVista[i].classList.add("ocultar");
					if (v.opcionesOrdenVista[i] == checked) v.ordenSelect.value = "";
				} else v.opcionesOrdenVista[i].classList.remove("ocultar");
			});

			// IMPACTOS DE
			if (v.ordenSelect.value) {
				const orden = opcionesOrdenBD.find((n) => n.id == v.ordenSelect.value);
				if (v.notNull == "-" && orden.not_null_out != "-") v.notNull = orden.not_null_out;
				if (v.ocurrio == "-" && orden.ocurrio != "-") v.ocurrio = orden.ocurrio;
				v.elegibles.orden = v.ordenSelect.value;
			}

			this.impactosEnDeOrdenam();

			// Fin
			return;
		},
		impactosEnDeOrdenam: function () {
			// Variables
			const orden = v.ordenSelect.value ? opcionesOrdenBD.find((n) => n.id == v.ordenSelect.value) : null;

			// IMPACTOS EN
			const SI = !v.ordenSelect.value || orden.ordenam != "ascDes";
			SI ? v.ordenamSector.classList.add("ocultar") : v.ordenamSector.classList.add("flexCol");
			SI ? v.ordenamSector.classList.remove("flexCol") : v.ordenamSector.classList.remove("ocultar");
			if (SI && v.ordenSelect.value) v.elegibles.ordenam = orden.ordenam;
			if (!SI) for (let ordenam of v.ordenamInputs) if (ordenam.checked) v.elegibles.ordenam = ordenam.value;

			// IMPACTOS DE - Sector 'OK'
			v.elegibles.ordenam ? v.ordenamSector.classList.add("OK") : v.ordenamSector.classList.remove("OK");

			this.mostrarOcultar();
			this.impactosDeCFC();

			// Fin
			return;
		},
		mostrarOcultar: () => {
			const SI = apoyo.condicionesMinimas();

			// Muestra/Oculta sectores
			SI ? v.nav.classList.remove("ocultar") : v.nav.classList.add("ocultar");
			SI ? v.asegurate.classList.add("ocultar") : v.asegurate.classList.remove("ocultar");
			SI && v.start ? v.comencemos.classList.remove("ocultar") : v.comencemos.classList.add("ocultar");

			// Fin
			return;
		},
		impactosDeCFC: function () {
			// IMPACTOS DE
			v.cfc = v.cfcSelect.value ? v.cfcSelect.value : "";
			if (v.cfc) v.elegibles.cfc = v.cfc;

			this.impactosEnDeOcurrio();

			// Fin
			return;
		},
		// Impactos en/de ocurrio
		impactosEnDeOcurrio: function () {
			// IMPACTOS EN
			v.ocurrio == "-" ? v.ocurrioSector.classList.remove("ocultar") : v.ocurrioSector.classList.add("ocultar");

			// IMPACTOS DE
			// 1. Actualiza el valor de 'ocurrio'
			if (v.ocurrio == "-" && v.ocurrioSelect.value) v.ocurrio = v.ocurrioSelect.value;
			// 2. Muestra/Oculta los sectores dependientes
			for (let sector of v.ocurrioSISectores)
				v.ocurrio == "SI" ? sector.classList.remove("ocultar") : sector.classList.add("ocultar");
			// 3. Asigna el valor para 'ocurrio'
			if (v.ocurrio == "SI" || v.ocurrio == "NO") v.elegibles.ocurrio = v.ocurrio;

			this.impactosEnDeEpoca();

			// Fin
			return;
		},
		// Impactos en/de epoca
		impactosEnDeEpoca: function () {
			if (v.ocurrio == "SI") {
				// IMPACTOS EN - Sólo se muestra el sector si ocurrió='SI' - resuelto en impactosEnDeOcurrio

				// IMPACTOS DE
				if (v.epocaSelect.value) v.epoca = v.epocaSelect.value;
			}

			this.impactosEnDeApMar();

			// Fin
			return;
		},
		// Impactos en/de apMar
		impactosEnDeApMar: function () {
			if (v.ocurrio == "SI") {
				// IMPACTOS EN
				// Sólo se muestra el sector si ocurrió='SI' - resuelto en impactosEnDeOcurrio
				// Sólo se muestra el sector si CFC='SI' y epoca='pst'
				if (v.cfc == "SI" && v.epoca == "pst") v.apMarSector.classList.remove("ocultarApMar");
				else v.apMarSector.classList.add("ocultarApMar");

				// IMPACTOS DE
				if (v.apMarSelect.value) v.elegibles.apMar = v.apMarSelect.value;
			}

			this.impactosEnDeCanonsMasRolesIglesia();

			// Fin
			return;
		},
		// Impactos en/de canons y rolesIglesia
		impactosEnDeCanonsMasRolesIglesia: function () {
			if (v.ocurrio == "SI") {
				// IMPACTOS EN
				// Sólo se muestra el sector si ocurrió='SI' - resuelto en impactosEnDeOcurrio
				// Sólo se muestra el sector si notNull='personaje' y CFC='SI'
				const SI = v.notNull == "personaje" && v.cfc == "SI";
				SI ? v.canonsSector.classList.remove("ocultarCanons") : v.canonsSector.classList.add("ocultarCanons");
				SI
					? v.rolesIglSector.classList.remove("ocultarRolesIglesia")
					: v.rolesIglSector.classList.add("ocultarRolesIglesia");

				// IMPACTOS DE
				if (v.canonsSelect.value) v.elegibles.canons = v.canonsSelect.value;
				if (v.rolesIglesiaSelect.value) v.elegibles.rolesIglesia = v.rolesIglesiaSelect.value;
			}

			this.impactosDeDemasElegibles();

			// Fin
			return;
		},
		// Impactos de Demás Elegibles
		impactosDeDemasElegibles: function () {
			for (let elegible of v.demasElegibles) if (elegible.value) v.elegibles[elegible.name] = elegible.value;

			// Fin
			return;
		},
	};
	let filtrosPers = {
		impactosDeFiltroPers: async function () {
			// Variables
			const filtro_id = v.filtroPers.value;
			if (!filtro_id) return;

			// Actualiza el filtro_id en la cookie y el usuario (session y BD)
			fetch(v.rutaGuardaFiltroID + filtro_id);

			// Obtiene las opciones de la BD
			const opciones = await fetch(v.rutaOpcionesFiltroPers + filtro_id).then((n) => n.json());

			// Actualiza los elegibles simples (Encabezado + Filtros)
			for (let elegible of v.elegiblesSimple) elegible.value = opciones[elegible.name] ? opciones[elegible.name] : "";

			// Actualiza los elegibles 'AscDes'
			for (let elegible of v.ordenamInputs) elegible.checked = opciones.ascDes && elegible.value == opciones.ascDes;

			// Actualiza los botones
			this.impactosEnBotonesPorFiltroPers();

			// Fin
			return;
		},
		impactosEnBotonesPorFiltroPers: () => {
			// 1. Inactiva las opciones 'reinicio' y 'actualiza'
			v.reinicio.classList.add("inactivo");
			v.actualiza.classList.add("inactivo");

			// 2. Acciones para los íconos 'modificaNombre' y 'elimina'
			const filtroElegido = v.filtroPers.value;
			filtroElegido == 1 ? v.modificaNombre.classList.add("inactivo") : v.modificaNombre.classList.remove("inactivo");
			filtroElegido == 1 ? v.elimina.classList.add("inactivo") : v.elimina.classList.remove("inactivo");

			// Fin
			return;
		},
		impactosEnBotonesPorElegibles: () => {
			// Inactiva las opciones de 'modificaNombre' y 'elimina' en la vista
			v.modificaNombre.classList.add("inactivo");
			v.elimina.classList.add("inactivo");

			// Activa las opciones de 'reinicio' y 'actualiza'
			v.reinicio.classList.remove("inactivo");
			if (v.filtroPers.value != 1) v.actualiza.classList.remove("inactivo");

			// Fin
			return;
		},
		impactoEnBotonesPorCondicMins: () => {
			// Variables
			const SI = apoyo.condicionesMinimas();

			// Si no están dadas las condiciones mínimas, se inactivan todos los botones
			if (!SI) for (let icono of v.iconos) icono.classList.add("inactivo");

			// Fin
			return;
		},
	};
	let apoyo = {
		condicionesMinimas: () => {
			const SI_layout = !!v.layoutSelect.value;
			const SI_orden = !!v.ordenSelect.value;
			const SI_ordenam = !!v.elegibles.ordenam;
			const SI = SI_layout && SI_orden && SI_ordenam;

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
			if (!v.comencemos.className.includes("ocultar")) return;

			// Obtiene los productos
			let productos = await fetch(v.rutaProductos + JSON.stringify(v.elegibles));

			// Actualiza el contador
			// Actualiza la información mostrada

			// Fin
			return;
		},
	};

	// Eventos
	v.cuerpo.addEventListener("change", async (e) => {
		// Variables
		let clickEnFiltrosPers = e.target.name == "filtrosPers";
		v.elegibles = {};

		// Novedades en el Filtro Personalizado
		if (clickEnFiltrosPers) await filtrosPers.impactosDeFiltroPers();

		// Impacto en Encabezado y Filtros
		encabFiltros.impactosDeLayout();
		if (e.target.name == "palabrasClave")
			e.target.value ? palabrasClave.classList.add("verde") : palabrasClave.classList.remove("verde");

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
	v.comencemos.addEventListener("click", async () => {
		// Oculta el botón
		v.start = false;
		v.comencemos.classList.add("ocultar");

		// Siguientes pasos
		await zonaDeProds.obtieneLosProductos();

		// Fin
		return;
	});

	// Start-up
	encabFiltros.impactosDeLayout();
});
