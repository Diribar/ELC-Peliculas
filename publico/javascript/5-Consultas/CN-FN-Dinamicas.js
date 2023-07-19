"use strict";

let actualizaConfigCons = {
	consolidado: function () {
		// Borra la información anterior
		configCons = {};

		// Obtiene configCons y muestra/oculta campos
		this.layout();

		// Muestra/Oculta líneas de separación
		if (v.mostrar) this.ocultaLineasConsecs();

		// Fin
		return;
	},
	// Encabezado
	layout: function () {
		// Impacto en configCons: layout_id, entidad

		// Acciones si existe un valor de layout
		const layout_id = DOM.layout_id.value;
		if (layout_id) {
			// Actualiza 'configCons.layout_id' y 'entidad'
			configCons.layout_id = layout_id;
			entidad = v.layoutsBD.find((n) => n.id == layout_id).entidad;

			// Muestra/Oculta los mensajes de ayuda
			for (let icono of DOM.iconosAyuda)
				icono.className.includes("layout" + layout_id)
					? icono.classList.remove("ocultar")
					: icono.classList.add("ocultar");
		}

		// Fin
		this.orden();
		return;
	},
	orden: function () {
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

		// Acciones si se eligió un orden
		const orden_id = DOM.orden_id.value;
		if (orden_id) {
			// Variables
			configCons.orden_id = orden_id; // Actualiza 'orden_id'
			v.orden = v.ordenesBD.find((n) => n.id == orden_id);

			// Si corresponde, actualiza 'bhr'
			if (v.orden.bhrSeguro) configCons.bhr = "1";

			// Si el orden es 'rolIglesia', entonces 'cfc' es 1
			if (v.orden.valor == "rolIglesia") configCons.cfc = 1;
		} else v.orden = null;

		// Fin
		this.ascDes();
		return;
	},
	ascDes: function () {
		// Impacto en configCons: ascDes

		// Actualiza la variable 'configCons' y muestra/oculta el sector
		if (configCons.orden_id && v.orden.ascDes == "ascDes") {
			// Muestra ascDes
			DOM.ascDes.classList.replace("ocultar", "flexCol");

			// Actualiza la variable 'configCons'
			const checked = DOM.ascDes.querySelector("input:checked");
			if (configCons.orden_id && checked) configCons.ascDes = checked.value;
		} else {
			// Oculta ascDes
			DOM.ascDes.classList.replace("flexCol", "ocultar");

			// Actualiza la variable 'configCons'
			if (configCons.orden_id) configCons.ascDes = v.orden.ascDes;
		}

		// 'OK' para que el fondo sea verde/rojo
		configCons.ascDes ? DOM.ascDes.classList.add("OK") : DOM.ascDes.classList.remove("OK");

		// Muestra/Oculta sectores
		this.muestraOculta();

		// Fin
		if (v.mostrar) this.presenciaEstable();
		return;
	},
	muestraOculta: () => {
		// Variables
		v.mostrar = !!configCons.layout_id && !!configCons.orden_id && !!configCons.ascDes;

		// Muestra/Oculta sectores
		v.mostrar ? DOM.configCampos.classList.remove("ocultar") : DOM.configCampos.classList.add("ocultar");

		// Muestra/Oculta botones 'Asegurate' y 'Comencemos'
		v.mostrar ? DOM.asegurate.classList.add("ocultar") : DOM.asegurate.classList.remove("ocultar");
		v.mostrar && v.mostrarComencemos ? DOM.comencemos.classList.remove("ocultar") : DOM.comencemos.classList.add("ocultar");

		// Si hay algún error que impide mostrar, borra los resultados anteriores
		if (!v.mostrar) {
			for (let resultado of DOM.resultados) resultado.innerHTML = "";
			v.mostrarComencemos = true;
		}

		// Fin
		return;
	},
	// Presencia estable
	presenciaEstable: function () {
		// Impacto en configCons: todos los campos con presencia estable
		for (let campo of DOM.camposPresenciaEstable) if (campo.value) configCons[campo.name] = campo.value;

		// Fin
		this.cfc();
		return;
	},
	// Presencia eventual
	cfc: function () {
		// Impacto en configCons: cfc

		// Si cfc ya está contestado, se oculta
		configCons.cfc ? DOM.cfc.parentNode.classList.add("ocultar") : DOM.cfc.parentNode.classList.remove("ocultar");

		// Actualiza el valor de 'cfc'
		if (!configCons.cfc && DOM.cfc.value) configCons.cfc = DOM.cfc.value;

		// Fin
		this.bhr();
		return;
	},
	bhr: function () {
		// Impacto en configCons: bhr

		// Si bhr ya está contestado, se oculta
		configCons.bhr ? DOM.bhr.parentNode.classList.add("ocultar") : DOM.bhr.parentNode.classList.remove("ocultar");

		// Actualiza el valor de 'bhr'
		if (!configCons.bhr && DOM.bhr.value) configCons.bhr = DOM.bhr.value;

		// Fin
		this.apMar();
		return;
	},
	apMar: function () {
		// Impacto en configCons: apMar

		// Sólo se muestra el sector si bhr='1', cfc='1' y epocasOcurrencia='pst', o no están respondidas
		const seMuestra =
			(!configCons.bhr || configCons.bhr == "1") &&
			(!configCons.cfc || configCons.cfc == "1") &&
			(!configCons.epocasOcurrencia || configCons.epocasOcurrencia == "pst");

		// Muestra/Oculta el sector
		seMuestra ? DOM.apMar.parentNode.classList.remove("ocultar") : DOM.apMar.parentNode.classList.add("ocultar");

		// Actualiza el valor de 'apMar'
		if (seMuestra && DOM.apMar.value) configCons.apMar = DOM.apMar.value;

		// Si se elige una 'Aparición Mariana', ocultar el sector de 'Época de Ocurrencia'
		if (configCons.apMar == "SI") {
			delete configCons.epocasOcurrencia;
			DOM.epocasOcurrencia.parentNode.classList.add("ocultar");
		} else DOM.epocasOcurrencia.parentNode.classList.remove("ocultar");

		// Fin
		this.canonsRolesIglesia();
		return;
	},
	canonsRolesIglesia: function () {
		// Impacto en configCons: canons y rolesIgl

		// Sólo se muestra el sector si bhr='SI', cfc='1'
		const seMuestra = configCons.bhr == "1" && configCons.cfc == "1";

		// Oculta/Muestra sectores
		seMuestra ? DOM.canons.parentNode.classList.remove("ocultar") : DOM.canons.parentNode.classList.add("ocultar");
		seMuestra ? DOM.rolesIgl.parentNode.classList.remove("ocultar") : DOM.rolesIgl.parentNode.classList.add("ocultar");

		// Actualiza el valor de 'canons' y 'rolesIgl'
		if (seMuestra && DOM.canons.value) configCons.canons = DOM.canons.value;
		if (seMuestra && DOM.rolesIgl.value) configCons.rolesIgl = DOM.rolesIgl.value;

		// Fin
		this.palabrasClave();
		return;
	},
	palabrasClave: function () {
		// Impacto en: palabrasClave

		// Actualiza el valor de 'palabrasClave'
		if (!DOM.palClaveAprob.className.includes("inactivo") && DOM.palClave.value)
			configCons.palabrasClave = DOM.palClave.value;

		// Fin
		return;
	},
	// Apoyo
	ocultaLineasConsecs: () => {
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
