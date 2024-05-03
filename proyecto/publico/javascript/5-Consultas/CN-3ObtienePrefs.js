"use strict";

let actualizaConfigCons = {
	// General
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

	// Presencia estable
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
		if (v.layout_id) {
			const metodos = Object.keys(this).slice(3);
			for (let metodo of metodos) this[metodo]();
		}

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
	presenciaEstable: () => {
		// Impacto en prefs: todos los campos con presencia estable y que tengan un valor, impactan en el resultado
		for (let filtro of DOM.filtrosPresenciaEstable) if (filtro.value) prefs[filtro.name] = filtro.value;

		// Actualiza el valor de 'palabrasClave'
		if (DOM.palClaveAprob.className.includes("inactivo") && DOM.palClave.value) prefs.palabrasClave = DOM.palClave.value;

		// Fin
		return;
	},

	// Presencia eventual
	entidad: () => {
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
		return;
	},
	pppOpciones: () => {
		// Si el usuario no está logueado o quiere ver sus calificaciones, sigue a la siguiente rutina
		if (!v.userID || v.layoutBD.codigo == "misCalificadas") return this.idiomas();

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
		return;
	},
	idiomas: () => {
		// Averigua si el campo se debe mostrar
		const seMuestra = DOM.tiposLink.value != "todos"; // 'tiposLink' está contestado

		// Muestra/Oculta el sector y actualiza el valor del filtro
		muestraOcultaActualizaPref(seMuestra, "idiomas");

		// Fin
		return;
	},
	cfc: () => {
		// Averigua si el campo se debe mostrar
		const seMuestra = !DOM.canons.value && !DOM.rolesIgl.value && !DOM.apMar.value; // no está contestado ninguno

		// Si no se muestra, es porque se eligió 'cfc'
		if (!seMuestra) prefs.cfc = "1";

		// Muestra/Oculta el sector y actualiza el valor del filtro
		muestraOcultaActualizaPref(seMuestra, "cfc");

		// Fin
		return;
	},
	canons: () => {
		// Sólo se muestra si se cumplen ciertas condiciones
		const seMuestra =
			DOM.cfc.value == "1" && // se eligió 'con relación con la Iglesia Católica'
			["productos", "rclvs", "personajes"].includes(v.entidad) && // la entidad es alguna de esas
			DOM.bhr.value !== "0"; // no hay certeza de que sea ficticio

		// Muestra/Oculta el sector y actualiza el valor del filtro
		muestraOcultaActualizaPref(seMuestra, "canons");

		// Fin
		return;
	},
	rolesIgl: () => {
		// Sólo se muestra si se cumplen ciertas condiciones
		const seMuestra =
			prefs.cfc == "1" && // se eligió 'con relación con la Iglesia Católica'
			["productos", "rclvs", "personajes"].includes(v.entidad) && // la entidad es alguna de esas
			DOM.bhr.value !== "0"; // no hay certeza de que sea ficticio

		// Muestra/Oculta el sector y actualiza el valor del filtro
		muestraOcultaActualizaPref(seMuestra, "rolesIgl");

		// Fin
		return;
	},
	apMar: () => {
		// Sólo se muestra el sector si se cumplen ciertas condiciones
		const seMuestra =
			prefs.cfc == "1" && // se eligió 'con relación con la Iglesia Católica'
			["productos", "rclvs", "personajes"].includes(v.entidad) && // la entidad es alguna de esas
			DOM.bhr.value !== "0" && // no hay certeza de que sea ficticio
			(!DOM.epocasOcurrencia.value || DOM.epocasOcurrencia.value == "pst") && // la época no es 'bíblica'
			v.entidad != "temas"; // La entidad es distinta de 'temas'

		// Muestra/Oculta el sector y actualiza el valor del filtro
		muestraOcultaActualizaPref(seMuestra, "apMar");

		// Si se elige una 'Aparición Mariana', oculta el sector de 'Época de Ocurrencia'
		if (prefs.apMar == "SI") {
			delete prefs.epocasOcurrencia;
			DOM.epocasOcurrencia.parentNode.classList.add("ocultar");
		} else DOM.epocasOcurrencia.parentNode.classList.remove("ocultar");

		// Fin
		return;
	},
	bhr: () => {
		// Sólo se muestra si se cumplen ciertas condiciones
		const seMuestra =
			!DOM.canons.value && // el 'procCanon' no está contestado
			!DOM.rolesIgl.value && // el 'rolIglesia' no está contestado
			!DOM.apMar.value; // la 'apMar' no está contestado

		// Muestra/Oculta el sector y actualiza el valor del filtro
		muestraOcultaActualizaPref(seMuestra, "bhr");

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
