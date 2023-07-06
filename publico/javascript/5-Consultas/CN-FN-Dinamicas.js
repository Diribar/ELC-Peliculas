"use strict";

let impactos = {
	configDinamica: function ({v, DOM}) {
		this.deLayout(v, DOM);

		// Fin
		return;
	},
	deLayout: function (v, DOM) {
		// Variables
		v.layout_id = DOM.layout_id.value;

		// Obtiene el 'configCons.layout_id' y eventualmente el 'configCons.bhr'
		if (v.layout_id) {
			// Obtiene el 'configCons.layout_id'
			configCons.layout_id = v.layout_id;

			// Obtiene el 'configCons.bhr', si esté implícito
			const layoutBD = v.layoutsBD.find((n) => n.id == v.layout_id);
			v.entidad = layoutBD.entidad;
			if (["personajes", "hechos"].includes(v.entidad)) configCons.bhr = "SI";
		}
		// Elimina los 'configCons.layout_id' y 'configCons.bhr'
		else delete configCons.layout_id, configCons.bhr;

		// Siguiente rutina
		this.enDeOrden(v, DOM);

		// Fin
		return;
	},
	enDeOrden: function (v, DOM) {
		// IMPACTOS EN - Variables
		const checked = DOM.orden_id.querySelector("option:checked");

		// Oculta/Muestra las opciones que corresponden
		v.ordenesBD.forEach((ordenBD, i) => {
			// Acciones si no existe 'layout' o la opción tiene un código distinto al de layout
			if (!v.layoutBD || ordenBD.layout_id != v.layout_id) {
				// 1. Oculta la opción
				DOM.opcionesOrdenVista[i].classList.add("ocultar");
				// 2. La 'des-selecciona'
				if (DOM.opcionesOrdenVista[i] == checked) DOM.orden_id.value = "";
			}
			// En caso contrario, muestra la opción
			else DOM.opcionesOrdenVista[i].classList.remove("ocultar");
		});

		// IMPACTOS DE
		if (DOM.orden_id.value) elegibles.orden_id = DOM.orden_id.value;

		this.enDeAscDes(v, DOM);

		// Fin
		return;
	},
	enDeAscDes: function (v, DOM) {
		// Variables
		const orden = DOM.orden_id.value ? varias.opcionesOrdenBD.find((n) => n.id == DOM.orden_id.value) : null;

		// IMPACTOS EN
		const SI = !DOM.orden_id.value || orden.asc_des != "ascDes";
		SI ? DOM.ascDesSector.classList.add("ocultar") : DOM.ascDesSector.classList.add("flexCol");
		SI ? DOM.ascDesSector.classList.remove("flexCol") : DOM.ascDesSector.classList.remove("ocultar");
		if (SI && DOM.orden_id.value) elegibles.asc_des = orden.asc_des;
		if (!SI) for (let input of DOM.ascDesInputs) if (input.checked) elegibles.asc_des = input.value;

		// IMPACTOS DE - Sector 'OK'
		elegibles.asc_des ? DOM.ascDesSector.classList.add("OK") : DOM.ascDesSector.classList.remove("OK");

		this.mostrarOcultar(v, DOM);
		this.deCFC(v, DOM);

		// Fin
		return;
	},
	mostrarOcultar: (v, DOM) => {
		const SI = apoyo.condicionesMinimas(v, DOM);

		// Muestra/Oculta sectores
		SI ? DOM.camposTitulo.classList.remove("ocultar") : DOM.camposTitulo.classList.add("ocultar");
		SI ? DOM.camposNav.classList.remove("ocultar") : DOM.camposNav.classList.add("ocultar");
		SI ? DOM.asegurate.classList.add("ocultar") : DOM.asegurate.classList.remove("ocultar");
		SI && varias.comencemos ? DOM.comencemos.classList.remove("ocultar") : DOM.comencemos.classList.add("ocultar");

		// Fin
		return;
	},
	deCFC: function (v, DOM) {
		// IMPACTOS DE
		varias.cfc = DOM.cfcSelect.value ? DOM.cfcSelect.value : "";
		if (varias.cfc) elegibles.cfc = varias.cfc;

		this.enDeOcurrio(v, DOM);

		// Fin
		return;
	},
	enDeOcurrio: function (v, DOM) {
		// IMPACTOS EN
		varias.bhr ? DOM.bhrSector.classList.add("ocultar") : DOM.bhrSector.classList.remove("ocultar");

		// IMPACTOS DE
		// 1. Actualiza el valor de 'bhr'
		if (!varias.bhr && DOM.bhrSelect.value) varias.bhr = DOM.bhrSelect.value;
		// 2. Muestra/Oculta los sectores dependientes
		for (let bhrSISector of DOM.bhrSISectores)
			varias.bhr && varias.bhr != "NO" ? bhrSISector.classList.remove("bhrSI") : bhrSISector.classList.add("bhrSI");
		// 3. Asigna el valor para 'bhr'
		if (varias.bhr) elegibles.bhr = varias.bhr;

		this.enDeEpoca(v, DOM);

		// Fin
		return;
	},
	nDeEpoca: function (v, DOM) {
		// IMPACTOS EN - Sólo se muestra el sector si ocurrió != 'NO' - resuelto en impactosEnDeOcurrio

		// IMPACTOS DE
		const sectorVisible = window.getComputedStyle(DOM.epocasSector).getPropertyValue("display") != "none";
		if (DOM.epocasSelect.value && sectorVisible) elegibles.epocas = DOM.epocasSelect.value;

		this.enDeApMar(v, DOM);

		// Fin
		return;
	},
	enDeApMar: function (v, DOM) {
		// IMPACTOS EN
		// Sólo se muestra el sector si ocurrió != 'NO' - resuelto en impactosEnDeOcurrio
		// Sólo se muestra el sector si CFC='SI' y epocas='pst'
		if (elegibles.cfc == "CFC" && elegibles.epocas == "pst") DOM.apMarSector.classList.remove("ocultarApMar");
		else DOM.apMarSector.classList.add("ocultarApMar");

		// IMPACTOS DE
		const sectorVisible = window.getComputedStyle(DOM.apMarSector).getPropertyValue("display") != "none";
		if (DOM.apMarSelect.value && sectorVisible) elegibles.apMar = DOM.apMarSelect.value;

		this.enDeCanonsMasRolesIglesia(v, DOM);

		// Fin
		return;
	},
	enDeCanonsMasRolesIglesia: function (v, DOM) {
		// IMPACTOS EN
		// Sólo se muestra el sector si ocurrió != 'NO' - resuelto en impactosEnDeOcurrio
		// Sólo se muestra el sector si codigo='personajes' y CFC='SI'
		let sectorVisible;
		const SI = elegibles.bhr == "pers" && elegibles.cfc == "CFC";

		// Oculta/Muestra sectores
		SI ? DOM.canonsSector.classList.remove("ocultarCanons") : DOM.canonsSector.classList.add("ocultarCanons");
		SI ? DOM.rolesIglSector.classList.remove("ocultarRolesIglesia") : DOM.rolesIglSector.classList.add("ocultarRolesIglesia");

		// IMPACTOS DE
		sectorVisible = window.getComputedStyle(DOM.canonsSector).getPropertyValue("display") != "none";
		if (DOM.canonsSelect.value && sectorVisible) elegibles.canons = DOM.canonsSelect.value;
		sectorVisible = window.getComputedStyle(DOM.rolesIglSector).getPropertyValue("display") != "none";
		if (DOM.rolesIglesiaSelect.value && sectorVisible) elegibles.rolesIglesia = DOM.rolesIglesiaSelect.value;

		this.deDemasElegibles(v, DOM);

		// Fin
		return;
	},
	deDemasElegibles: function (v, DOM) {
		for (let preferencia of DOM.mostrarSiempre) if (preferencia.value) elegibles[preferencia.name] = preferencia.value;

		apoyo.limpiaLineasConsecutivas(v, DOM);

		// Fin
		return;
	},
};

let dinamicas = {
	condicionesMinimasOK: (v, DOM) => {
		const SI_layout = !!DOM.layout_id.value;
		const SI_orden = !!DOM.orden_id.value;
		const SI_ascDes = !!elegibles.asc_des;
		const SI = SI_layout && SI_orden && SI_ascDes;

		// Comencemos
		if (!SI) varias.comencemos = true;

		// Fin
		return SI;
	},
	limpiaLineasConsecutivas: (v, DOM) => {
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
