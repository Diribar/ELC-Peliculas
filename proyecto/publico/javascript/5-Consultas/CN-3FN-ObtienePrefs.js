"use strict";

let actualizaConfigCons = {
	consolidado: function () {
		// Borra la información anterior
		configCons = {};

		// Obtiene configCons y muestra/oculta campos
		this.opcion();

		// Muestra / Oculta filtros dependiendo de si los campos tienen un valor o "botón mostrar filtros"
		actualiza.toggleFiltros();

		// Pule la variable 'configCons'
		for (let prop in configCons) if (configCons[prop] == "sinFiltro") delete configCons[prop];

		// Fin
		return;
	},

	// Encabezado
	opcion: function () {
		// Variables
		v.layout_id = DOM.layout_id.value;

		// Obtiene los valores completos de la opción elegida
		if (v.layout_id) {
			v.layoutBD = v.layoutsBD.find((n) => n.id == v.layout_id);
			if (!v.layoutBD) v.layout_id = null;
		}

		// Actualiza variable
		if (v.layout_id) configCons.layout_id = v.layout_id;

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
		// Impacto en configCons: todos los campos con presencia estable
		for (let campo of DOM.camposPresenciaEstable) if (campo.value) configCons[campo.name] = campo.value;

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
		if (v.entidad) configCons.entidad = v.entidad;

		// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
		//muestraOcultaActualizaPref(seMuestra, "entidad_id");

		// Fin
		this.pppOpciones();
		return;
	},
	pppOpciones: function () {
		// Si el usuario no está logueado o quiere ver sus calificaciones, sigue a la siguiente rutina
		if (!v.userID || v.layoutBD.codigo == "misCalificadas") return this.cfc();

		// Acciones si la opción elegida es "Mis preferencias"
		if (v.layoutBD.codigo == "misPrefs") {
			configCons.pppOpciones = v.pppOpcsObj.misPreferencias.combo.split(",");
			muestraOcultaActualizaPref(false, "pppOpciones"); // oculta el sector
		}
		// Acciones si la opción elegida es otra
		else {
			// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
			muestraOcultaActualizaPref(true, "pppOpciones");

			// Si 'pppOpciones' tiene el valor de un combo, lo convierte en array
			if (configCons.pppOpciones && configCons.pppOpciones != "todos") {
				const id = configCons.pppOpciones;
				const pppOpcion = v.pppOpcsArray.find((n) => n.id == id);
				if (pppOpcion.combo) configCons.pppOpciones = pppOpcion.combo.split(",");
			}
		}

		// Fin
		this.cfc();
		return;
	},
	cfc: function () {
		// Averigua si el campo se debe mostrar
		const seMuestra =
			!configCons.cfc && // 'cfc' no está contestado
			!DOM.apMar.value && // 'apMar' no está contestado
			(!DOM.canons.value || DOM.canons.value == "NN") && // 'canon' no está contestado
			!DOM.rolesIgl.value; // 'rolesIgl' no está contestado

		// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
		muestraOcultaActualizaPref(seMuestra, "cfc");

		// Fin
		this.bhr();
		return;
	},
	bhr: function () {
		// Sólo se muestra si se cumplen ciertas condiciones
		const seMuestra =
			!configCons.bhr && // si no está contestado
			!DOM.canons.value && // el procCanon no está contestado
			!DOM.rolesIgl.value; // el rolIglesia no está contestado

		// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
		muestraOcultaActualizaPref(seMuestra, "bhr");

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
			v.entidad != "temas"; // La entidad es distinta de 'temas'

		// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
		muestraOcultaActualizaPref(seMuestra, "apMar");

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
			["productos", "rclvs", "personajes"].includes(v.entidad) && // la entidad es alguna de esas
			configCons.bhr !== "0" && // no se eligió 'sin bhr'
			configCons.cfc !== "0"; // no se eligió 'sin cfc'

		// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
		muestraOcultaActualizaPref(seMuestra, "canons");

		// Fin
		this.rolesIglesia();
		return;
	},
	rolesIglesia: function () {
		// Sólo se muestra si se cumplen ciertas condiciones
		const seMuestra =
			["productos", "rclvs", "personajes"].includes(v.entidad) && // la entidad es alguna de esas
			configCons.bhr !== "0" && // no se eligió 'sin bhr'
			configCons.cfc !== "0"; // no se eligió 'sin cfc'

		// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
		muestraOcultaActualizaPref(seMuestra, "rolesIgl");

		// Fin
		this.palabrasClave();
		return;
	},
	palabrasClave: function () {
		// Actualiza el valor de 'palabrasClave'
		if (DOM.palClaveAprob.className.includes("inactivo") && DOM.palClave.value) configCons.palabrasClave = DOM.palClave.value;

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

	// Actualiza el valor de 'configCons'
	if (seMuestra && DOM[elemento].value) configCons[elemento] = DOM[elemento].value;

	// Fin
	return;
};
