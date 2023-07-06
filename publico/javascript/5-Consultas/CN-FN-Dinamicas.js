"use strict";

let impactos = {
	configDinamica: function ({v, DOM}) {
		this.enDeLayout(v, DOM);
		return;
	},
	enDeLayout: function (v, DOM) {
		// Impacto en configCons: layout_id y bhr
		// Impactos en v: layout_id y entidad

		// Variables
		v.layout_id = DOM.layout_id.value;

		// Obtiene el 'configCons.layout_id' y eventualmente el 'configCons.bhr'
		if (v.layout_id) {
			// Obtiene el 'configCons.layout_id'
			configCons.layout_id = v.layout_id;

			// Obtiene el 'configCons.bhr', si esté implícito
			const layoutBD = v.layoutsBD.find((n) => n.id == v.layout_id);
			v.entidad = layoutBD.entidad;
			["personajes", "hechos"].includes(v.entidad) ? (configCons.bhr = "SI") : delete configCons.bhr;
		}
		// Elimina los 'configCons.layout_id' y 'configCons.bhr'
		else delete configCons.layout_id, configCons.bhr;

		// Fin
		this.enDeOrden(v, DOM);
		return;
	},
	enDeOrden: function (v, DOM) {
		// Impacto en configCons: orden_id
		// Impactos en v: orden_id

		// Oculta/Muestra las opciones que corresponden
		const checked = DOM.orden_id.querySelector("option:checked");
		v.ordenesBD.forEach((ordenBD, i) => {
			// Acciones si la opción no corresponde al layout
			if (!v.layout_id || ordenBD.layout_id != v.layout_id) {
				// La oculta
				DOM.orden_idOpciones[i].classList.add("ocultar");

				// Si estaba seleccionada, cambia la selección por la de 'sin valor'
				if (checked && DOM.orden_idOpciones[i].value == checked.value) DOM.orden_id.value = "";
			}
			// Si la opción está vinculada con el layout, la muestra
			else DOM.orden_idOpciones[i].classList.remove("ocultar");
		});

		// IMPACTOS DE
		v.orden_id = DOM.orden_id.value;
		v.orden_id ? (configCons.orden_id = v.orden_id) : delete configCons.orden_id;

		// Fin
		this.enDeAscDes(v, DOM);
		return;
	},
	enDeAscDes: function (v, DOM) {
		// Impacto en configCons: ascDes
		// Impactos en v: ascDes

		// Variables
		const ordenBD = v.orden_id ? v.ordenesBD.find((n) => n.id == v.orden_id) : null;

		// IMPACTOS EN
		if (v.orden_id && ordenBD.ascDes == "ascDes") {
			// Muestra ascDes
			DOM.ascDes.classList.remove("ocultar");
			DOM.ascDes.classList.add("flexCol");
			const checked = DOM.ascDes.querySelector("input:checked");
			v.orden_id && checked ? (configCons.ascDes = checked.value) : delete configCons.ascDes;
		} else {
			// Oculta ascDes
			DOM.ascDes.classList.add("ocultar");
			DOM.ascDes.classList.remove("flexCol");
			v.orden_id ? (configCons.ascDes = ordenBD.ascDes) : delete configCons.ascDes;
		}

		// IMPACTOS DE - 'OK' para que el fondo sea verde/rojo
		v.ascDes = configCons.ascDes;
		v.ascDes ? DOM.ascDes.classList.add("OK") : DOM.ascDes.classList.remove("OK");

		this.muestraOculta(v, DOM);
		this.deCFC(v, DOM);

		// Fin
		return;
	},
	muestraOculta: (v, DOM) => {
		// Muestra/Oculta sectores
		const mostrar = v.layout_id && v.orden_id && v.ascDes;
		for (let div of DOM.mostrarSiEncabOK) mostrar ? div.classList.remove("ocultar") : div.classList.add("ocultar");

		// Muestra/Oculta botones 'Asegurate' y 'Comencemos'
		mostrar ? DOM.asegurate.classList.add("ocultar") : DOM.asegurate.classList.remove("ocultar");
		mostrar && v.comencemos ? DOM.comencemos.classList.remove("ocultar") : DOM.comencemos.classList.add("ocultar");

		// Fin
		return;
	},
	deCFC: function (v, DOM) {
		// Impacto en configCons:	layout_id y bhr
		// Impactos en v:			layout_id y entidad

		// IMPACTOS DE
		varias.cfc = DOM.cfcSelect.value ? DOM.cfcSelect.value : "";
		if (varias.cfc) elegibles.cfc = varias.cfc;

		this.enDeOcurrio(v, DOM);

		// Fin
		return;
	},
	enDeOcurrio: function (v, DOM) {
		// Impacto en configCons:	layout_id y bhr
		// Impactos en v:			layout_id y entidad

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
	enDeEpoca: function (v, DOM) {
		// Impacto en configCons:	layout_id y bhr
		// Impactos en v:			layout_id y entidad

		// IMPACTOS EN - Sólo se muestra el sector si ocurrió != 'NO' - resuelto en impactosEnDeOcurrio

		// IMPACTOS DE
		const sectorVisible = window.getComputedStyle(DOM.epocasSector).getPropertyValue("display") != "none";
		if (DOM.epocasSelect.value && sectorVisible) elegibles.epocas = DOM.epocasSelect.value;

		this.enDeApMar(v, DOM);

		// Fin
		return;
	},
	enDeApMar: function (v, DOM) {
		// Impacto en configCons:	layout_id y bhr
		// Impactos en v:			layout_id y entidad

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
		// Impacto en configCons:	layout_id y bhr
		// Impactos en v:			layout_id y entidad

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
		// Impacto en configCons:	layout_id y bhr
		// Impactos en v:			layout_id y entidad
		for (let preferencia of DOM.mostrarSiempre) if (preferencia.value) elegibles[preferencia.name] = preferencia.value;

		apoyo.limpiaLineasConsecutivas(v, DOM);

		// Fin
		return;
	},
};

let apoyo = {
	limpiaLineasConsecutivas: (v, DOM) => {
		// Variables
		let hijos = document.querySelectorAll("#cuerpo #configCons .sectorConDesplV nav > *");
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
