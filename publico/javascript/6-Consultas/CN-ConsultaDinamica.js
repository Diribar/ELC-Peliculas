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

		// Encabezado
		layout_idSelect: document.querySelector("#encabezado select[name='layout_id']"),
		orden_idSelect: document.querySelector("#encabezado select[name='orden_id']"),
		opcionesOrdenVista: document.querySelectorAll("#encabezado select[name='orden_id'] option:not(option[value=''])"),
		ascDesSector: document.querySelector("#encabezado #ascDes"),
		ascDesInputs: document.querySelectorAll("#encabezado #ascDes input"),
		contador_de_prods: document.querySelector("#encabezado #derecha #contador_de_prods"),

		// Filtros
		camposTitulo: document.querySelector("#filtros #campos div:has(h2)"),
		camposNav: document.querySelector("#filtros #campos div nav"),
		cfcSelect: document.querySelector("#filtros #campos div nav #cfc select"),
		ocurrioSector: document.querySelector("#filtros #campos #ocurrio"),
		ocurrioSelect: document.querySelector("#filtros #campos #ocurrio select"),
		ocurrioSISectores: document.querySelectorAll("#filtros #campos .ocurrioSI"),
		epocasSector: document.querySelector("#filtros #campos #epocas"),
		epocasSelect: document.querySelector("#filtros #campos #epocas select"),
		apMarSector: document.querySelector("#filtros #campos #apMar"),
		apMarSelect: document.querySelector("#filtros #campos #apMar select"),
		canonsSector: document.querySelector("#filtros #campos #canons"),
		canonsSelect: document.querySelector("#filtros #campos #canons select"),
		rolesIglSector: document.querySelector("#filtros #campos #rolesIglesia"),
		rolesIglesiaSelect: document.querySelector("#filtros #campos #rolesIglesia select"),
		demasElegibles: document.querySelectorAll("#filtros #campos .demasElegibles .input"),
		palabrasClave: document.querySelector("#filtros #campos #palabrasClave"),

		// Zona de Productos
		vistaProds: document.querySelector("#zona_de_prods #vistaProds"),
		listado: document.querySelector("#zona_de_prods #vistaProds #listado"),
	};
	let rutas = {
		layoutsOrdenes: "/consultas/api/layouts-y-ordenes",
		guardaFiltroID: "/consultas/api/guarda-filtro_id/?filtro_id=",
		opcionesFiltroPers: "/consultas/api/opciones-de-filtro-personalizado/?filtro_id=",
		productos: "/consultas/api/obtiene-los-productos/?datos=",
		rclvs: "/consultas/api/obtiene-los-rclvs/?datos=",
		// Botonera
		actualiza: "/consultas/api/fp-actualiza/?datos=",
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
			const SI = !!DOM.layout_idSelect.value;
			varias.layout = SI ? varias.layouts.find((n) => n.id == DOM.layout_idSelect.value) : null;
			elegibles.entidad = SI ? varias.layout.entidad : null;
			varias.ocurrio = SI ? varias.layout.ocurrio : null;
			if (SI) elegibles.layout_id = DOM.layout_idSelect.value;

			// Siguiente rutina
			this.impactosEnDeOrden();

			// Fin
			return;
		},
		// Impactos en/de orden_id
		impactosEnDeOrden: function () {
			// IMPACTOS EN - Oculta/Muestra las opciones que corresponden
			const checked = document.querySelector("#encabezado select[name='orden_id'] option:checked");
			varias.opcionesOrdenBD.forEach((opcion, i) => {
				// Acciones si no existe 'layout' o la opción tiene una entidad distinta a la de layout
				if (!varias.layout || opcion.entidad != varias.layout.entidad) {
					// 1. Oculta la opción
					DOM.opcionesOrdenVista[i].classList.add("ocultar");
					// 2. La 'des-selecciona'
					if (DOM.opcionesOrdenVista[i] == checked) DOM.orden_idSelect.value = "";
				}
				// En caso contrario, muestra la opción
				else DOM.opcionesOrdenVista[i].classList.remove("ocultar");
			});

			// IMPACTOS DE
			if (DOM.orden_idSelect.value) elegibles.orden_id = DOM.orden_idSelect.value;

			this.impactosEnDeAscDes();

			// Fin
			return;
		},
		impactosEnDeAscDes: function () {
			// Variables
			const orden = DOM.orden_idSelect.value ? varias.opcionesOrdenBD.find((n) => n.id == DOM.orden_idSelect.value) : null;

			// IMPACTOS EN
			const SI = !DOM.orden_idSelect.value || orden.asc_des != "ascDes";
			SI ? DOM.ascDesSector.classList.add("ocultar") : DOM.ascDesSector.classList.add("flexCol");
			SI ? DOM.ascDesSector.classList.remove("flexCol") : DOM.ascDesSector.classList.remove("ocultar");
			if (SI && DOM.orden_idSelect.value) elegibles.asc_des = orden.asc_des;
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
			SI ? DOM.camposTitulo.classList.remove("ocultar") : DOM.camposTitulo.classList.add("ocultar");
			SI ? DOM.camposNav.classList.remove("ocultar") : DOM.camposNav.classList.add("ocultar");
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
		// Impactos en/de epocas
		impactosEnDeEpoca: function () {
			// IMPACTOS EN - Sólo se muestra el sector si ocurrió != 'NO' - resuelto en impactosEnDeOcurrio

			// IMPACTOS DE
			const sectorVisible = window.getComputedStyle(DOM.epocasSector).getPropertyValue("display") != "none";
			if (DOM.epocasSelect.value && sectorVisible) elegibles.epocas = DOM.epocasSelect.value;

			this.impactosEnDeApMar();

			// Fin
			return;
		},
		// Impactos en/de apMar
		impactosEnDeApMar: function () {
			// IMPACTOS EN
			// Sólo se muestra el sector si ocurrió != 'NO' - resuelto en impactosEnDeOcurrio
			// Sólo se muestra el sector si CFC='SI' y epocas='pst'
			if (elegibles.cfc == "CFC" && elegibles.epocas == "pst") DOM.apMarSector.classList.remove("ocultarApMar");
			else DOM.apMarSector.classList.add("ocultarApMar");

			// IMPACTOS DE
			const sectorVisible = window.getComputedStyle(DOM.apMarSector).getPropertyValue("display") != "none";
			if (DOM.apMarSelect.value && sectorVisible) elegibles.apMar = DOM.apMarSelect.value;

			this.impactosEnDeCanonsMasRolesIglesia();

			// Fin
			return;
		},
		// Impactos en/de canons y rolesIglesia
		impactosEnDeCanonsMasRolesIglesia: function () {
			// IMPACTOS EN
			// Sólo se muestra el sector si ocurrió != 'NO' - resuelto en impactosEnDeOcurrio
			// Sólo se muestra el sector si entidad='personajes' y CFC='SI'
			let sectorVisible;
			const SI = elegibles.ocurrio == "pers" && elegibles.cfc == "CFC";

			// Oculta/Muestra sectores
			SI ? DOM.canonsSector.classList.remove("ocultarCanons") : DOM.canonsSector.classList.add("ocultarCanons");
			SI
				? DOM.rolesIglSector.classList.remove("ocultarRolesIglesia")
				: DOM.rolesIglSector.classList.add("ocultarRolesIglesia");

			// IMPACTOS DE
			sectorVisible = window.getComputedStyle(DOM.canonsSector).getPropertyValue("display") != "none";
			if (DOM.canonsSelect.value && sectorVisible) elegibles.canons = DOM.canonsSelect.value;
			sectorVisible = window.getComputedStyle(DOM.rolesIglSector).getPropertyValue("display") != "none";
			if (DOM.rolesIglesiaSelect.value && sectorVisible) elegibles.rolesIglesia = DOM.rolesIglesiaSelect.value;

			this.impactosDeDemasElegibles();

			// Fin
			return;
		},
		// Impactos de Demás Elegibles
		impactosDeDemasElegibles: function () {
			for (let elegible of DOM.demasElegibles) if (elegible.value) elegibles[elegible.name] = elegible.value;

			apoyo.limpiaLineasConsecutivas();

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
			for (let input of DOM.ascDesInputs) input.checked = opciones.ascDes && input.value == opciones.ascDes;

			// Actualiza los botones
			this.statusInicialBotonera();

			// Fin
			return;
		},
		statusInicialBotonera: () => {
			// 1. Inactiva las opciones 'nuevo', 'reinicio' y 'actualiza'
			DOM.nuevo.classList.add("inactivo");
			DOM.reinicio.classList.add("inactivo");
			DOM.actualiza.classList.add("inactivo");

			// 2. Activa los íconos 'modificaNombre' y 'elimina', salvo para el filtro Estándar
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
			const SI_layout = !!DOM.layout_idSelect.value;
			const SI_orden = !!DOM.orden_idSelect.value;
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

			// Actualiza el contador
			contador_de_prods.innerHTML = resultados.length + " resultados";
			//console.log(resultados);

			// Actualiza la información mostrada
			vistaProds.classList.remove("ocultar")

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
	// Botonera de Filtros Personalizados
	DOM.reinicio.addEventListener("click", async () => {
		// Si está inactivo, interrumpe
		if (DOM.reinicio.classList.includes("inactivo")) return;

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
	DOM.actualiza.addEventListener("click", async () => {
		// Si está inactivo, interrumpe
		if (DOM.actualiza.className.includes("inactivo")) return;
		else filtrosPers.statusInicialBotonera();

		// Variables
		const filtro_id = DOM.filtroPers.value;
		if (!filtro_id) return;
		let objeto = {...elegibles, filtro_id};
		delete objeto.entidad;

		// Guarda los cambios en el filtro personalizado
		fetch(rutas.actualiza + JSON.stringify(objeto));

		// Fin
		return;
	});

	// Start-up
	encabFiltros.impactosDeLayout();
});
