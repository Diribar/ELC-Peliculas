"use strict";

let actualizaConfigCons = {
	consolidado: function () {
		// Borra la información anterior
		configCons = {};

		// Obtiene configCons y muestra/oculta campos
		this.entidad();

		// Muestra / Oculta filtros dependiendo de si los campos tienen un valor o "botón mostrar filtros"
		actualiza.toggleFiltrosIndivs();

		// Fin
		return;
	},

	// Encabezado
	entidad: function () {
		// Variables
		v.entidad_id = DOM.entidad_id.value;

		// Acciones si existe un valor de entidad
		if (v.entidad_id) {
			// Actualiza 'configCons.entidad_id'
			configCons.entidad_id = v.entidad_id;
			v.entidad = v.entidadesBD.find((n) => n.id == v.entidad_id).codigo;

			// Obtiene los órdenes posibles
			v.opcsPorEstaEntBD = v.opcionesPorEntBD.filter((n) => n.entidad_id == v.entidad_id);
			v.opcionesPorEstaEnt_id = v.opcsPorEstaEntBD.map((n) => n.id);

			// Actualiza los ayudas
			for (let ayuda of DOM.ayudas)
				ayuda.className.includes("ent" + DOM.entidad_id.value)
					? ayuda.classList.remove("ocultar")
					: ayuda.classList.add("ocultar");

			// Continúa la rutina
			this.opcion.asignaUno();
		}

		// Acciones si no existe la entidad
		else {
			for (let ayuda of DOM.ayudas) ayuda.classList.add("ocultar");
			this.muestraOcultaBloqueDeFiltros();
		}

		// Fin
		return;
	},
	opcion: {
		asignaUno: function () {
			// Averigua si hay una opción elegida
			v.opcionPorEnt_id = DOM.opcionPorEnt_id.value;
			v.opcionEnEntidad = false;

			// Si hay una entidad elegida, se fija si la opción está vinculada a ella
			if (v.opcionPorEnt_id) v.opcionEnEntidad = v.opcionesPorEstaEnt_id.includes(Number(v.opcionPorEnt_id));

			// Acciones si la opción no pertenece a la  entidad
			if (!v.opcionEnEntidad) {
				// Si el código existe en el layout, elige su opción correspondiente
				v.opcionPorEntBD = v.opcsPorEstaEntBD.find((n) => n.id == v.opcionPorEnt_id);

				// Asigna el nuevo valor
				v.opcionPorEnt_id = v.opcionPorEntBD
					? v.opcionPorEntBD.id // análogo
					: v.opcsPorEstaEntBD.find((n) => n.opcionDefault).id; // default
			}

			// Actualiza variables
			DOM.opcionPorEnt_id.value = v.opcionPorEnt_id;
			configCons.opcionPorEnt_id = v.opcionPorEnt_id;
			v.opcionPorEntBD = v.opcionesPorEntBD.find((n) => n.id == v.opcionPorEnt_id);
			v.opcionBD = v.opcionesBD.find((n) => n.id == v.opcionPorEntBD.opcion_id);

			// Redirige a la siguiente instancia
			this.muestraOcultaOpciones();

			// Fin
			return;
		},
		muestraOcultaOpciones: () => {
			// Oculta/Muestra las opciones según la entidad elegida
			for (let opcion of DOM.opcionesPorEnt) {
				v.opcionesPorEstaEnt_id.includes(Number(opcion.value))
					? opcion.classList.remove("ocultar") // Muestra las opciones que corresponden a la entidad
					: opcion.classList.add("ocultar"); // Oculta las opciones que no corresponden a la entidad
			}

			// Si corresponde, actualiza 'bhr'
			if (v.entidad.bhrSeguro) configCons.bhr = "1";

			// Muestra/Oculta sectores
			actualizaConfigCons.muestraOcultaBloqueDeFiltros();

			// Redirige a la siguiente instancia
			if (v.obtener) actualizaConfigCons.presenciaEstable();

			// Fin
			return;
		},
	},
	muestraOcultaBloqueDeFiltros: () => {
		// Variables
		v.obtener = !!configCons.entidad_id && !!configCons.opcionPorEnt_id;

		// Acciones si no hay errores
		if (v.obtener) {
			// Muestra sectores
			DOM.nav.classList.remove("ocultar");
			DOM.toggleFiltrosIndivs.classList.remove("ocultar"); // los botones "mostrar flitros" y "ocultar filtros"

			// Oculta el mensaje de error
			DOM.asegurate.classList.add("ocultar");

			// Si corresponde, muestra el cartel de quieroVer
			if (v.mostrarCartelQuieroVer) DOM.quieroVer.classList.remove("ocultar");
		}
		// Acciones si hay algún error que se necesita resolver
		else {
			// Variables
			v.mostrarCartelQuieroVer = true;
			DOM.botones.innerHTML = "";
			DOM.listados.innerHTML = "";

			// Oculta sectores
			DOM.nav.classList.add("ocultar");
			DOM.toggleFiltrosIndivs.classList.add("ocultar"); // los botones "mostrar flitros" y "ocultar filtros"
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
		this.pppOpciones();
		return;
	},

	// Presencia eventual
	pppOpciones: function () {
		// Si el usuario no está logueado o quiere ver sus calificaciones, sigue a la siguiente rutina
		if (!v.userID || v.opcionBD.codigo == "misCalificadas") return this.idioma();

		// Si la opción elegida es "Mis preferencias", le asigna ese valor a 'pppOpciones'
		if (v.opcionBD.codigo == "misPrefs") configCons.pppOpciones = v.misPreferencias.combo.split(",");
		// Acciones si la opción elegida es otra
		else {
			// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
			muestraOcultaActualizaPref(true, "pppOpciones");

			// Si 'pppOpciones' no tiene un filtro, si corresponde le pone las opciones de "Me interesan"
			if (configCons.pppOpciones == "sinFiltro") {
				if (v.opcionBD.quitaNoMeInteresa) configCons.pppOpciones = v.meInteresan.combo.split(",");
			}

			// Si 'pppOpciones' tiene el valor de un combo, lo convierte en array
			else if (configCons.pppOpciones != "sinFiltro") {
				const id = configCons.pppOpciones;
				const pppOpcion = v.pppOpciones.find((n) => n.id == id);
				if (pppOpcion.combo) configCons.pppOpciones = pppOpcion.combo.split(",");
			}
		}

		// Fin
		this.idioma();
		return;
	},
	idioma: function () {
		// Averigua si el campo se debe mostrar
		const seMuestra = !!configCons.tipoLink; // si no se eligió una calidad, no se muestran

		// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
		muestraOcultaActualizaPref(seMuestra, "idioma");
		if (configCons.idioma == "sinFiltro") delete configCons.idioma;

		// Fin
		this.cfc();
		return;
	},
	// Presencia eventual - Resto
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
			["productos", "personajes"].includes(v.entidad) && // la entidad es 'productos' o 'personajes'
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
			["productos", "personajes"].includes(v.entidad) && // la entidad es 'productos' o 'personajes'
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
