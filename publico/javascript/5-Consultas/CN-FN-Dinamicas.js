"use strict";

let actualizaConfigCons = {
	consolidado: function () {
		// Borra la información anterior
		configCons = {};

		// Obtiene configCons y muestra/oculta campos
		this.orden();

		// Muestra / Oculta filtros
		actualiza.muestraOcultaFiltros();

		// Fin
		return;
	},

	// Encabezado
	orden: function () {
		// Acciones si existe un valor de orden
		v.orden_id = DOM.orden_id.value;
		if (v.orden_id) {
			// Actualiza 'configCons.orden_id' y 'entidad'
			configCons.orden_id = v.orden_id;
			v.ordenBD = v.ordenesBD.find((n) => n.id == v.orden_id);
			v.entsPorOrdenBD = v.entsPorOrdenesBD.filter((n) => n.orden_id == v.orden_id);
			v.entidades_id = v.entsPorOrdenBD.map((n) => n.entidad.id);
		}

		// Redirige a la siguiente instancia
		if (v.orden_id) this.entidad.asignaUna();
		else this.muestraOcultaPrefs();

		// Fin
		return;
	},
	entidad: {
		asignaUna: function () {
			// Averigua si hay una entidad elegida
			v.entidad_id = DOM.entidad_id.value;
			v.entidadEnOrden = false;

			// Si hay una entidad elegida, se fija si pertenece al orden elegido
			if (v.entidad_id) v.entidadEnOrden = v.entidades_id.includes(v.entidad_id);

			// Si la entidad no pertenece al orden, asigna el valor default
			if (!v.entidadEnOrden)
				DOM.entidad_id.value = v.entsPorOrdenBD.find((n) => n.orden_id == v.orden_id && n.entDefault).entidad_id;

			// Actualiza variables
			v.entidad_id = DOM.entidad_id.value;
			configCons.entidad_id = v.entidad_id;
			v.entidad = v.entidadesBD.find((n) => n.id == v.entidad_id).codigo;
			v.entPorOrdenBD = v.entsPorOrdenesBD.find((n) => n.orden_id == v.orden_id && n.entidad_id == v.entidad_id);

			// Redirige a la siguiente instancia
			this.muestraOcultaOpciones();

			// Fin
			return;
		},
		muestraOcultaOpciones: () => {
			// Oculta/Muestra las opciones según el orden elegido
			for (let opcion of DOM.entidad_idOpciones) {
				v.entidades_id.includes(Number(opcion.value))
					? opcion.classList.remove("ocultar") // Muestra las opciones que corresponden al orden
					: opcion.classList.add("ocultar"); // Oculta las opciones que no corresponden al orden
			}

			// Si corresponde, actualiza 'bhr'
			if (v.entPorOrdenBD.bhrSeguro) configCons.bhr = "1";

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
		v.mostrar = !!configCons.orden_id && !!configCons.entidad_id;

		// Acciones si no hay errores
		if (v.mostrar) {
			// Muestra sectores
			DOM.nav.classList.remove("ocultar");
			DOM.mostrarOcultarFiltros.classList.remove("ocultar");

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
			DOM.mostrarOcultarFiltros.classList.add("ocultar");
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

	// Presencia eventual - Checkboxes
	pppOpciones: function () {
		// Averigua si el campo se debe mostrar
		const seMuestra = !DOM.noLaVi.checked && DOM.pppOpciones.value != v.noLaVi;

		// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
		muestraOcultaActualizaPref(seMuestra, "pppOpciones");

		if (!seMuestra) {
			configCons.pppOpciones = v.noLaVi;
			if (!DOM.noLaVi.checked) DOM.noLaVi.checked = true;
		}

		// Fin
		this.tiposLink();
		return;
	},
	tiposLink: function () {
		// Averigua si el campo se debe mostrar
		const seMuestra = !DOM.conLinks.checked && DOM.tiposLink.value != v.conLinks;

		// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
		muestraOcultaActualizaPref(seMuestra, "tiposLink");

		if (!seMuestra) {
			configCons.tiposLink = v.conLinks;
			if (!DOM.conLinks.checked) DOM.conLinks.checked = true;
		}

		// Fin
		this.castellano();
		return;
	},
	castellano: function () {
		// Averigua si el campo se debe mostrar
		const seMuestra = !DOM.enCast.checked && DOM.castellano.value != v.enCast;

		// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
		muestraOcultaActualizaPref(seMuestra, "castellano");

		if (!seMuestra) {
			configCons.castellano = v.enCast;
			if (!DOM.enCast.checked) DOM.enCast.checked = true;
		}

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
	seMuestra ? DOM[elemento].parentNode.classList.remove("ocultar") : DOM[elemento].parentNode.classList.add("ocultar");

	// Actualiza el valor de 'configCons'
	if (seMuestra && DOM[elemento].value) configCons[elemento] = DOM[elemento].value;

	// Fin
	return;
};
