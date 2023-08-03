"use strict";

let actualizaConfigCons = {
	consolidado: function () {
		// Borra la información anterior
		configCons = {};

		// Obtiene configCons y muestra/oculta campos
		this.layout();

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
			v.layoutBD = v.layoutsBD.find((n) => n.id == v.layout_id);
			entidad = v.layoutBD.entidad;

			// Muestra/Oculta los mensajes de ayuda
			for (let icono of DOM.iconosAyuda)
				icono.className.includes("layout" + v.layout_id)
					? icono.classList.remove("ocultar")
					: icono.classList.add("ocultar");
		}

		// Redirige a la siguiente instancia
		if (v.layout_id) this.orden.asignaUno();
		else this.muestraOcultaPrefs();

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

			// Actualiza variables
			configCons.orden_id = v.orden_id;
			v.ordenBD = v.ordenesBD.find((n) => n.id == v.orden_id);

			// Redirige a la siguiente instancia
			this.muestraOcultaOpciones();

			// Fin
			return;
		},
		muestraOcultaOpciones: () => {
			// Oculta/Muestra las opciones según el layout elegido
			v.ordenesBD.forEach((ordenBD, i) => {
				ordenBD.layout_id != configCons.layout_id
					? DOM.orden_idOpciones[i].classList.add("ocultar") // Oculta las opciones que no corresponden al layout
					: DOM.orden_idOpciones[i].classList.remove("ocultar"); // Muestra las opciones que corresponden al layout
			});

			// Si corresponde, actualiza 'bhr'
			if (v.ordenBD.bhrSeguro) configCons.bhr = "1";

			// Si el orden es 'rolIglesia', entonces 'cfc' es 1
			if (v.ordenBD.valor == "rolIglesia") configCons.cfc = 1;

			// Redirige a la siguiente instancia
			actualizaConfigCons.ascDes.asignaUno();

			// Fin
			return;
		},
	},
	ascDes: {
		asignaUno: function () {
			// Averigua si hay un orden elegido
			const checked = DOM.ascDes.querySelector("input:checked");
			v.ascDes = checked ? checked.value : null;

			// Se fija si el valor es aceptable
			let ascDesEnDOM_OK =
				v.ascDes && // Tiene un valor
				["ASC", "DESC"].includes(v.ascDes) && // Está entre los aceptables
				(v.ascDes == v.ordenBD.ascDesDefault || v.ordenBD.ascDesElegible); // Coincide con el default o es elegible

			// Si el valor no es 'aceptable', actualiza el valor con el default
			if (!ascDesEnDOM_OK) {
				// Actualiza el valor con el default
				v.ascDes = v.ordenBD.ascDesDefault;

				// Si el sector es elegible, actualiza el input
				if (v.ordenBD.ascDesElegible)
					for (let inputAscDes of DOM.inputsAscDes) if (inputAscDes.value == v.ascDes) inputAscDes.checked = true;
			}

			// Actualiza la variable 'configCons'
			configCons.ascDes = v.ascDes;

			// Redirige a la siguiente instancia
			this.muestraOcultaOpciones();

			// Fin
			return;
		},
		muestraOcultaOpciones: () => {
			// Muestra/Oculta el sector
			v.ordenBD.ascDesElegible
				? DOM.ascDes.classList.replace("ocultar", "flexCol") // Muestra ascDes
				: DOM.ascDes.classList.replace("flexCol", "ocultar"); // Oculta ascDes

			// 'OK' para que el fondo sea verde/rojo
			if (v.ordenBD.ascDesElegible) configCons.ascDes ? DOM.ascDes.classList.add("OK") : DOM.ascDes.classList.remove("OK");

			// Muestra/Oculta sectores
			actualizaConfigCons.muestraOcultaPrefs();

			// Redirige a la siguiente instancia
			if (v.mostrar) actualizaConfigCons.presenciaEstable();

			// Fin
			return;
		},
	},
	muestraOcultaPrefs: () => {
		// Variables
		v.mostrar = !!configCons.layout_id && !!configCons.orden_id && !!configCons.ascDes;

		// Muestra/Oculta sectores
		v.mostrar ? DOM.configCampos.classList.remove("ocultar") : DOM.configCampos.classList.add("ocultar");

		// Acciones si no hay errores
		if (v.mostrar) {
			// Oculta sectores
			DOM.asegurate.classList.add("ocultar");

			// Si corresponde, muestra el cartel de quieroVer
			if (v.mostrarCartelQuieroVer) DOM.quieroVer.classList.remove("ocultar");
		}
		// Acciones si hay algún error que se necesita resolver
		else {
			// Variables
			v.mostrarCartelQuieroVer = true;

			// Oculta sectores
			DOM.botones.innerHTML = "";
			DOM.listados.innerHTML = "";
			DOM.quieroVer.classList.add("ocultar");

			// Muestra un mensaje de error
			DOM.asegurate.classList.remove("ocultar");
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
		// Averigua si el campo se debe mostrar
		const seMuestra =
			!configCons.cfc && // 'cfc' no está contestado
			!DOM.apMar.value && // 'apMar' no está contestado
			(!DOM.canons.value || DOM.canons.value == "NN") && // 'canon' no está contestado
			!DOM.rolesIgl.value; // 'rolesIgl' no está contestado

		seMuestra ? DOM.cfc.parentNode.classList.remove("ocultar") : DOM.cfc.parentNode.classList.add("ocultar");

		// Actualiza el valor de 'cfc'
		if (seMuestra && DOM.cfc.value) configCons.cfc = DOM.cfc.value;

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

		// Sólo se muestra el sector si se cumplen ciertas condiciones
		const seMuestra =
			configCons.bhr !== "0" && // No es ficticio
			configCons.cfc !== "0" && // No es ajeno a la Iglesia
			(!configCons.epocasOcurrencia || configCons.epocasOcurrencia == "pst") && // No es del viejo ni nuevo testamento
			entidad != "temas"; // La entidad es distinta de 'temas'

		// Muestra/Oculta el sector
		seMuestra ? DOM.apMar.parentNode.classList.remove("ocultar") : DOM.apMar.parentNode.classList.add("ocultar");

		// Actualiza el valor de 'apMar'
		if (seMuestra && DOM.apMar.value) configCons.apMar = DOM.apMar.value;

		// Si se elige una 'Aparición Mariana', oculta el sector de 'Época de Ocurrencia'
		if (configCons.apMar == "SI") {
			delete configCons.epocasOcurrencia;
			DOM.epocasOcurrencia.parentNode.classList.add("ocultar");
		} else DOM.epocasOcurrencia.parentNode.classList.remove("ocultar");

		// Fin
		this.canons();
		return;
	},
	canons: function () {
		// Sólo se muestra si se cumplen ciertas condiciones
		const seMuestra =
			["productos", "personajes"].includes(entidad) && // la entidad es 'productos' o 'personajes'
			configCons.bhr !== "0" && // no se eligió 'sin bhr'
			configCons.cfc !== "0"; // no se eligió 'sin cfc'

		// Oculta/Muestra sectores
		seMuestra ? DOM.canons.parentNode.classList.remove("ocultar") : DOM.canons.parentNode.classList.add("ocultar");

		// Actualiza el valor de 'canons' y 'rolesIgl'
		if (seMuestra && DOM.canons.value) configCons.canons = DOM.canons.value;

		// Fin
		this.rolesIglesia();
		return;
	},
	rolesIglesia: function () {
		// Sólo se muestra si se cumplen ciertas condiciones
		const seMuestra =
			["productos", "personajes"].includes(entidad) && // la entidad es 'productos' o 'personajes'
			configCons.bhr !== "0" && // no se eligió 'sin bhr'
			configCons.cfc !== "0"; // no se eligió 'sin cfc'

		// Oculta/Muestra sectores
		seMuestra ? DOM.rolesIgl.parentNode.classList.remove("ocultar") : DOM.rolesIgl.parentNode.classList.add("ocultar");

		// Actualiza el valor de 'canons' y 'rolesIgl'
		if (seMuestra && DOM.rolesIgl.value) configCons.rolesIgl = DOM.rolesIgl.value;

		// Fin
		this.palabrasClave();
		return;
	},
	palabrasClave: function () {
		// Impacto en: palabrasClave

		// Actualiza el valor de 'palabrasClave'
		if (DOM.palClaveAprob.className.includes("inactivo") && DOM.palClave.value) configCons.palabrasClave = DOM.palClave.value;

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
