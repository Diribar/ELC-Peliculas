"use strict";

let actualizaConfigCons = {
	consolidado: function () {
		// Fecha actual
		const ahora = new Date();
		const dia = ahora.getDate();
		const mes = ahora.getMonth() + 1;

		// Borra la información anterior
		configCons = {dia, mes};

		// Obtiene configCons y muestra/oculta campos
		this.layout(v, DOM);

		// Muestra/Oculta líneas de separación
		if (v.mostrar) this.ocultaLineasConsecs(v, DOM);

		// Fin
		return;
	},
	// Encabezado
	layout: function (v, DOM) {
		// Impacto en configCons: layout_id, entidad

		// Actualiza 'configCons.layout_id' y 'configCons.entidad'
		const layout_id = DOM.layout_id.value;
		if (layout_id) {
			configCons.layout_id = layout_id;
			configCons.entidad = v.layoutsBD.find((n) => n.id == layout_id).entidad;
		}

		// Fin
		this.orden(v, DOM);
		return;
	},
	orden: function (v, DOM) {
		// Impacto en configCons: orden_id y eventualmente bhr

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

		// Actualiza 'orden_id' y eventualmente 'bhr'
		const orden_id = DOM.orden_id.value;
		if (orden_id) {
			configCons.orden_id = orden_id;
			const bhrSeguro = v.ordenesBD.find((n) => n.id == orden_id).bhrSeguro;
			if (bhrSeguro) configCons.bhr = "SI";
		}

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
		if (v.mostrar) this.presenciaEstable(v, DOM);
		return;
	},
	muestraOculta: (v, DOM) => {
		// Variables
		v.mostrar = !!configCons.layout_id && !!configCons.orden_id && !!configCons.ascDes;
		// console.log(!!configCons.layout_id, !!configCons.orden_id, !!configCons.ascDes);

		// Muestra/Oculta sectores
		v.mostrar ? DOM.configCampos.classList.remove("ocultar") : DOM.configCampos.classList.add("ocultar");

		// Muestra/Oculta botones 'Asegurate' y 'Comencemos'
		v.mostrar ? DOM.asegurate.classList.add("ocultar") : DOM.asegurate.classList.remove("ocultar");
		v.mostrar && mostrarComencemos ? DOM.comencemos.classList.remove("ocultar") : DOM.comencemos.classList.add("ocultar");

		// Fin
		return;
	},
	// Presencia estable
	presenciaEstable: function (v, DOM) {
		// Impacto en configCons: todos los campos con presencia estable
		for (let campo of DOM.camposPresenciaEstable) if (campo.value) configCons[campo.name] = campo.value;

		// Fin
		this.bhr(v, DOM);
		return;
	},
	// Presencia eventual
	bhr: function (v, DOM) {
		// Impacto en configCons: bhr

		// Si bhr ya está contestado, se oculta
		configCons.bhr ? DOM.bhr.parentNode.classList.add("ocultar") : DOM.bhr.parentNode.classList.remove("ocultar");

		// Actualiza el valor de 'bhr'
		if (!configCons.bhr && DOM.bhr.value) configCons.bhr = DOM.bhr.value;

		// Fin
		this.apMar(v, DOM);
		return;
	},
	apMar: function (v, DOM) {
		// Impacto en configCons: apMar

		// Sólo se muestra el sector si bhr='SI', cfc='CFC' y (!epocasOcurrencia || epocasOcurrencia='pst')
		const seMuestra =
			configCons.bhr == "SI" &&
			configCons.cfc == "CFC" &&
			(!configCons.epocasOcurrencia || configCons.epocasOcurrencia == "pst");

		// Muestra/Oculta el sector
		seMuestra ? DOM.apMar.parentNode.classList.remove("ocultar") : DOM.apMar.parentNode.classList.add("ocultar");

		// Actualiza el valor de 'apMar'
		if (seMuestra && DOM.apMar.value) configCons.apMar = DOM.apMar.value;

		// Fin
		this.canonsRolesIglesia(v, DOM);
		return;
	},
	canonsRolesIglesia: function (v, DOM) {
		// Impacto en configCons: canons y rolesIgl

		// Sólo se muestra el sector si bhr='SI', cfc='CFC'
		const seMuestra = configCons.bhr == "SI" && configCons.cfc == "CFC";

		// Oculta/Muestra sectores
		seMuestra ? DOM.canons.parentNode.classList.remove("ocultar") : DOM.canons.parentNode.classList.add("ocultar");
		seMuestra ? DOM.rolesIgl.parentNode.classList.remove("ocultar") : DOM.rolesIgl.parentNode.classList.add("ocultar");

		// Actualiza el valor de 'canons' y 'rolesIgl'
		if (seMuestra && DOM.canons.value) configCons.canons = DOM.canons.value;
		if (seMuestra && DOM.rolesIgl.value) configCons.rolesIgl = DOM.rolesIgl.value;

		// Fin
		this.palabrasClave(v, DOM);
		return;
	},
	palabrasClave: function (v, DOM) {
		// Impacto en: palabrasClave

		// Actualiza el valor de 'palabrasClave'
		if (!DOM.palClaveAprob.className.includes("inactivo")) configCons.palabrasClave = DOM.palClave.value;

		// Fin
		return;
	},
	// Apoyo
	ocultaLineasConsecs: (v, DOM) => {
		// Variables
		let hijos = DOM.configCampos.parentNode.querySelectorAll("nav > *");
		let tags = [];

		hijos.forEach((hijo, orden) => {
			// Muestra todos los HR
			if (hijo.tagName == "HR") hijo.classList.remove("ocultar");

			// Crea un array de todos los tags con orden 2 y visibles
			if (
				window.getComputedStyle(hijo).getPropertyValue("order") == 2 &&
				window.getComputedStyle(hijo).getPropertyValue("display") != "none"
			)
				tags.push({nombre: hijo.tagName, orden});
		});

		// Si hay dos líneas consecutivas en orden 2, oculta la última
		for (let i = 1; i < tags.length; i++)
			if (tags[i - 1].nombre == "HR" && tags[i].nombre == "HR") hijos[tags[i].orden].classList.add("ocultar");

		// Fin
		return;
	},
};
