"use strict";

let actualizaConfigCons = {
	consolidado: function ({v, DOM}) {
		this.layout(v, DOM);
		return;
	},
	// Encabezado
	layout: function (v, DOM) {
		// Impacto en configCons: layout_id, entidad, y eventualmente bhr

		// Obtiene el 'configCons.layout_id' y eventualmente el 'configCons.bhr'
		const layout_id = DOM.layout_id.value;
		if (layout_id) {
			// Obtiene el 'configCons.layout_id'
			configCons.layout_id = layout_id;

			// Obtiene el 'configCons.bhr', si esté implícito
			const layoutBD = v.layoutsBD.find((n) => n.id == layout_id);
			configCons.entidad = layoutBD.entidad;
			if (["personajes", "hechos"].includes(v.entidad)) configCons.bhr = "SI";
		}

		// Fin
		this.orden(v, DOM);
		return;
	},
	orden: function (v, DOM) {
		// Impacto en configCons: orden_id

		// Oculta/Muestra las opciones que corresponden
		const checked = DOM.orden_id.querySelector("option:checked");
		v.ordenesBD.forEach((ordenBD, i) => {
			// Acciones si la opción no corresponde al layout
			if (!configCons.layout_id || ordenBD.layout_id != configCons.layout_id) {
				// La oculta
				DOM.orden_idOpciones[i].classList.add("ocultar");

				// Si estaba seleccionada, cambia la selección por la de 'sin valor'
				if (checked && DOM.orden_idOpciones[i].value == checked.value) DOM.orden_id.value = "";
			}
			// Si la opción está vinculada con el layout, la muestra
			else DOM.orden_idOpciones[i].classList.remove("ocultar");
		});

		// Actualiza la variable 'configCons'
		const orden_id = DOM.orden_id.value;
		if (orden_id) configCons.orden_id = orden_id;

		// Fin
		this.ascDes(v, DOM);
		return;
	},
	ascDes: function (v, DOM) {
		// Impacto en configCons: ascDes

		// Variables
		const ordenBD = configCons.orden_id ? v.ordenesBD.find((n) => n.id == configCons.orden_id) : null;

		// Actualiza la variable 'configCons' y muestra/oculta el sector
		if (configCons.orden_id && ordenBD.ascDes == "ascDes") {
			// Muestra ascDes
			DOM.ascDes.classList.remove("ocultar");
			DOM.ascDes.classList.add("flexCol");

			// Actualiza la variable 'configCons'
			const checked = DOM.ascDes.querySelector("input:checked");
			if (configCons.orden_id && checked) configCons.ascDes = checked.value;
		} else {
			// Oculta ascDes
			DOM.ascDes.classList.add("ocultar");
			DOM.ascDes.classList.remove("flexCol");

			// Actualiza la variable 'configCons'
			if (configCons.orden_id) configCons.ascDes = ordenBD.ascDes;
		}

		// 'OK' para que el fondo sea verde/rojo
		configCons.ascDes ? DOM.ascDes.classList.add("OK") : DOM.ascDes.classList.remove("OK");

		// Muestra/Oculta sectores
		this.muestraOculta(v, DOM);

		// Fin
		if (v.mostrar) this.bhr(v, DOM);
		return;
	},
	muestraOculta: (v, DOM) => {
		// Variables
		v.mostrar = !!configCons.layout_id && !!configCons.orden_id && !!v.ascDes;

		// Muestra/Oculta sectores
		for (let div of DOM.mostrarSiEncabOK) v.mostrar ? div.classList.remove("ocultar") : div.classList.add("ocultar");

		// Muestra/Oculta botones 'Asegurate' y 'Comencemos'
		v.mostrar ? DOM.asegurate.classList.add("ocultar") : DOM.asegurate.classList.remove("ocultar");
		v.mostrar && !v.comencemos ? DOM.comencemos.classList.remove("ocultar") : DOM.comencemos.classList.add("ocultar");

		// Fin
		return;
	},
	// Presencia eventual
	bhr: function (v, DOM) {
		// Impacto en configCons: bhr

		// Si bhr="SI", se oculta
		configCons.bhr ? DOM.bhrSector.classList.add("ocultar") : DOM.bhrSector.classList.remove("ocultar");

		// Actualiza el valor de 'bhr'
		if (!configCons.bhr && DOM.bhr.value) configCons.bhr = DOM.bhrSelect.value;

		this.canonsRolesIglesia(v, DOM);

		// Fin
		return;
	},
	canonsRolesIglesia: function (v, DOM) {
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
	// Presencia simepre
	presenciaSiempre: function (v, DOM) {
		// Impacto en configCons:	layout_id y bhr
		// Impactos en v:			layout_id y entidad
		for (let preferencia of DOM.mostrarSiempre) if (preferencia.value) elegibles[preferencia.name] = preferencia.value;

		apoyo.limpiaLineasConsecutivas(v, DOM);

		// Fin
		return;
	},
	apMar: function (v, DOM) {
		// Impacto en configCons: apMar

		// Sólo se muestra el sector si ocurrió == 'SI'
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
