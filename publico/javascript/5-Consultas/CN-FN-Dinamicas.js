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
		v.layout_id = DOM.layout_id.value;
		if (v.layout_id) {
			// Actualiza 'configCons.layout_id' y 'entidad'
			configCons.layout_id = v.layout_id;
			entidad = v.layoutsBD.find((n) => n.id == v.layout_id).entidad;

			// Muestra/Oculta los mensajes de ayuda
			for (let icono of DOM.iconosAyuda)
				icono.className.includes("layout" + v.layout_id)
					? icono.classList.remove("ocultar")
					: icono.classList.add("ocultar");
		}

		// Redirige a la siguiente instancia
		if (v.layout_id) this.orden.asignaUno();

		// Fin
		return;
	},
	orden: {
		asignaUno: function () {
			// Averigua si hay un orden elegido
			v.orden_id = DOM.orden_id.value;
			let ordenEnDOM_OK;

			// Acciones si hay un orden elegido
			if (v.orden_id) {
				// Se fija si el orden pertenece al layout elegido
				v.ordenBD = v.ordenesBD.find((n) => n.id == v.orden_id);
				ordenEnDOM_OK = v.ordenBD.layout_id == v.layout_id;

				// Acciones si no pertenece al layout elegido
				if (!ordenEnDOM_OK) {
					// Se fija si el valor del orden actual existe para el layout elegido
					const valor = v.ordenBD.valor;
					const ordenConMismoValor = v.ordenesBD.find((n) => n.layout_id == v.layout_id && n.valor == valor);

					// Actualiza el valor de 'orden_id', en función del resultado anterior
					v.orden_id = ordenConMismoValor
						? ordenConMismoValor.id // La configuración adopta el orden del layout que tenga ese valor
						: null;
				}
			}

			// Acciones si no hay un orden 'aceptable' elegido
			if (!ordenEnDOM_OK && !v.orden_id) {
				// Obtiene el orden 'default' a partir del layout
				let ordenDefault = v.ordenesBD.find((n) => n.layout_id == v.layout_id && n.ordenDefault);

				// Actualiza el valor de 'orden_id', con el del default
				v.orden_id = ordenDefault.id;
			}

			// Asigna el id al valor del select
			if (!ordenEnDOM_OK) DOM.orden_id.value = v.orden_id;

			// Redirige a la siguiente instancia
			if (v.orden_id) this.muestraOcultaOpciones();

			// Fin
			return;
		},
		muestraOcultaOpciones: () => {
			// Oculta/Muestra las opciones según el layout elegido
			v.ordenesBD.forEach((ordenBD, i) => {
				!configCons.layout_id || ordenBD.layout_id != configCons.layout_id
					? DOM.orden_idOpciones[i].classList.add("ocultar") // Oculta las opciones que no corresponden al layout
					: DOM.orden_idOpciones[i].classList.remove("ocultar"); // Muestra las opciones que corresponden al layout
			});

			// Variables
			configCons.orden_id = v.orden_id; // Actualiza 'orden_id'
			v.ordenBD = v.ordenesBD.find((n) => n.id == v.orden_id);

			// Si corresponde, actualiza 'bhr'
			if (v.ordenBD.bhrSeguro) configCons.bhr = "1";

			// Si el orden es 'rolIglesia', entonces 'cfc' es 1
			if (v.ordenBD.valor == "rolIglesia") configCons.cfc = 1;

			// Fin
			actualizaConfigCons.ascDes();
			return;
		},
	},
	ascDes: function () {
		// Impacto en configCons: ascDes

		// Actualiza la variable 'configCons' y muestra/oculta el sector
		if (v.orden_id && v.ordenBD.ascDes == "ascDes") {
			// Muestra ascDes
			DOM.ascDes.classList.replace("ocultar", "flexCol");

			// Actualiza la variable 'configCons'
			const checked = DOM.ascDes.querySelector("input:checked");
			if (v.orden_id && checked) configCons.ascDes = checked.value;
		} else {
			// Oculta ascDes
			DOM.ascDes.classList.replace("flexCol", "ocultar");

			// Actualiza la variable 'configCons'
			if (v.orden_id) configCons.ascDes = v.ordenBD.ascDes;
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
