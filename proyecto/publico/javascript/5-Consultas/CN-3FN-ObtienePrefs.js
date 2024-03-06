"use strict";

let actualizaConfigCons = {
	consolidado: function () {
		// Borra la información anterior
		prefs = {};

		// Obtiene el layout y muestra/oculta campos
		this.layout();

		// Muestra filtros dependiendo de si tienen un valor o si está oculto el botón "mostrar filtros"
		actualiza.toggleBotonFiltros();

		// Pule la variable 'prefs'
		for (let prop in prefs) if (prefs[prop] == "sinFiltro") delete prefs[prop];

		// Fin
		return;
	},

	// Encabezado
	layout: function () {
		// Variables
		v.layout_id = DOM.layout_id.value;

		// Obtiene los valores completos de la opción elegida
		if (v.layout_id) {
			v.layoutBD = v.layoutsBD.find((n) => n.id == v.layout_id);
			if (!v.layoutBD) v.layout_id = null;
		}

		// Actualiza variable
		if (v.layout_id) prefs.layout_id = v.layout_id;

		// Muestra/Oculta los bloques de filtros
		this.muestraOcultaBloques();

		// Redirige a la siguiente instancia
		if (v.layout_id) this.presenciaEstable();

		// Fin
		return;
	},
	muestraOcultaBloques: () => {
		// Acciones si no hay errores
		if (v.layout_id) {
			// Muestra sectores
			DOM.nav.classList.remove("ocultar");
			DOM.toggleFiltros.classList.remove("ocultar"); // muestra el botón "mostrar/ocultar filtros"
			if (v.mostrarCartelQuieroVer) DOM.quieroVer.classList.remove("ocultar");

			// Oculta sectores
			DOM.asegurate.classList.add("ocultar");
		}
		// Acciones si hay algún error que se necesita resolver
		else {
			// Variables
			v.mostrarCartelQuieroVer = true;
			DOM.botones.innerHTML = "";
			DOM.listados.innerHTML = "";

			// Oculta sectores
			DOM.nav.classList.add("ocultar");
			DOM.toggleFiltros.classList.add("ocultar"); // oculta el botón "mostrar/ocultar filtros"
			DOM.quieroVer.classList.add("ocultar");

			// Muestra un mensaje de error
			DOM.asegurate.classList.remove("ocultar");
		}

		// Fin
		return;
	},

	// Presencia estable
	presenciaEstable: function () {
		// Impacto en prefs: todos los campos con presencia estable
		for (let filtro of DOM.camposPresenciaEstable) if (filtro.value) prefs[filtro.name] = filtro.value;

		// Fin
		this.entidad();
		return;
	},

	// Presencia eventual
	entidad: function () {
		// Averigua si el campo se debe mostrar
		const seMuestra = !!v.layoutBD.entidades.length; // sólo si la opción acepta más de una entidad

		// Obtiene la entidad
		const asignaEnt = !seMuestra || !DOM.entidades || !DOM.entidades.value;
		v.entidadBD = asignaEnt
			? v.entidadesBD.find((n) => n.id == v.layoutBD.entDefault_id)
			: v.entidadesBD.find((n) => n.id == DOM.entidades.value);
		v.entidad = v.entidadBD.codigo;
		if (v.entidad) prefs.entidad = v.entidad;

		// Fin
		this.pppOpciones();
		return;
	},
	pppOpciones: function () {
		// Si el usuario no está logueado o quiere ver sus calificaciones, sigue a la siguiente rutina
		if (!v.userID || v.layoutBD.codigo == "misCalificadas") return this.cfc();

		// Acciones si la opción elegida es "Mis preferencias"
		if (v.layoutBD.codigo == "misPrefs") {
			prefs.pppOpciones = v.pppOpcsObj.misPreferencias.combo.split(",");
			muestraOcultaActualizaPref(false, "pppOpciones"); // oculta el sector
		}
		// Acciones si la opción elegida es otra
		else {
			// Muestra/Oculta el sector y actualiza el valor del filtro
			muestraOcultaActualizaPref(true, "pppOpciones");

			// Si 'pppOpciones' tiene el valor de un combo, lo convierte en array
			if (prefs.pppOpciones && prefs.pppOpciones != "todos") {
				const id = prefs.pppOpciones;
				const pppOpcion = v.pppOpcsArray.find((n) => n.id == id);
				if (pppOpcion.combo) prefs.pppOpciones = pppOpcion.combo.split(",");
			}
		}

		// Fin
		this.cfc();
		return;
	},
	cfc: function () {
		// Averigua si el campo se debe mostrar
		const seMuestra =
			!prefs.cfc && // 'cfc' no está contestado
			!DOM.apMar.value && // 'apMar' no está contestado
			(!DOM.canons.value || DOM.canons.value == "NN") && // 'canon' no está contestado
			!DOM.rolesIgl.value; // 'rolesIgl' no está contestado

		// Muestra/Oculta el sector y actualiza el valor del filtro
		muestraOcultaActualizaPref(seMuestra, "cfc");

		// Fin
		this.bhr();
		return;
	},
	bhr: function () {
		// Sólo se muestra si se cumplen ciertas condiciones
		const seMuestra =
			!prefs.bhr && // si no está contestado
			!DOM.canons.value && // el procCanon no está contestado
			!DOM.rolesIgl.value; // el rolIglesia no está contestado

		// Muestra/Oculta el sector y actualiza el valor del filtro
		muestraOcultaActualizaPref(seMuestra, "bhr");

		// Fin
		this.apMar();
		return;
	},
	apMar: function () {
		// Sólo se muestra el sector si se cumplen ciertas condiciones
		const seMuestra =
			prefs.bhr !== "0" && // No es ficticio
			prefs.cfc !== "0" && // No es ajeno a la Iglesia
			(!prefs.epocasOcurrencia || prefs.epocasOcurrencia == "pst") && // No es del viejo ni nuevo testamento
			v.entidad != "temas"; // La entidad es distinta de 'temas'

		// Muestra/Oculta el sector y actualiza el valor del filtro
		muestraOcultaActualizaPref(seMuestra, "apMar");

		// Si se elige una 'Aparición Mariana', oculta el sector de 'Época de Ocurrencia'
		if (prefs.apMar == "SI") {
			delete prefs.epocasOcurrencia;
			DOM.epocasOcurrencia.parentNode.classList.add("ocultar");
		} else DOM.epocasOcurrencia.parentNode.classList.remove("ocultar");

		// Fin
		this.canons();
		return;
	},
	canons: function () {
		// Sólo se muestra si se cumplen ciertas condiciones
		const seMuestra =
			["productos", "rclvs", "personajes"].includes(v.entidad) && // la entidad es alguna de esas
			prefs.bhr !== "0" && // no se eligió 'sin bhr'
			prefs.cfc !== "0"; // no se eligió 'sin cfc'

		// Muestra/Oculta el sector y actualiza el valor del filtro
		muestraOcultaActualizaPref(seMuestra, "canons");

		// Fin
		this.rolesIglesia();
		return;
	},
	rolesIglesia: function () {
		// Sólo se muestra si se cumplen ciertas condiciones
		const seMuestra =
			["productos", "rclvs", "personajes"].includes(v.entidad) && // la entidad es alguna de esas
			prefs.bhr !== "0" && // no se eligió 'sin bhr'
			prefs.cfc !== "0"; // no se eligió 'sin cfc'

		// Muestra/Oculta el sector y actualiza el valor del filtro
		muestraOcultaActualizaPref(seMuestra, "rolesIgl");

		// Fin
		this.palabrasClave();
		return;
	},
	palabrasClave: function () {
		// Actualiza el valor de 'palabrasClave'
		if (DOM.palClaveAprob.className.includes("inactivo") && DOM.palClave.value) prefs.palabrasClave = DOM.palClave.value;

		// Fin
		return;
	},
};

let muestraOcultaActualizaPref = (seMuestra, elemento) => {
	// Muestra
	seMuestra
		? v.muestraFiltros
			? DOM[elemento].parentNode.classList.remove("ocultar")
			: DOM[elemento].parentNode.classList.replace("ocultar", "ocultaFiltro")
		: DOM[elemento].parentNode.classList.add("ocultar");

	// Actualiza el valor de 'prefs'
	if (seMuestra && DOM[elemento].value) prefs[elemento] = DOM[elemento].value;

	// Fin
	return;
};
