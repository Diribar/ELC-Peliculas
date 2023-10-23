"use strict";

let actualizaConfigCons = {
	consolidado: function () {
		// Borra la información anterior
		configCons = {};

		// Obtiene configCons y muestra/oculta campos
		this.entidad();

		// Muestra / Oculta filtros dependiendo de si los campos tienen un valor o "botón mostrar filtros"
		actualiza.muestraOcultaFiltros();

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
			v.ordenesPorEntBD = v.ordenesPorEntsBD.filter((n) => n.entidad_id == v.entidad_id);
			v.ordenesPorEnt_id = v.ordenesPorEntBD.map((n) => n.id);
			v.ordenes_id = v.ordenesPorEntBD.map((n) => n.orden.id);

			// Continúa la rutina
			this.orden.asignaUno();
		}

		// Redirige a la siguiente instancia
		else this.muestraOcultaBloqueDeFiltros();

		// Fin
		return;
	},
	orden: {
		asignaUno: function () {
			// Averigua si hay un orden elegido
			v.ordenPorEnt_id = DOM.ordenPorEnt_id.value;
			v.ordenEnEntidad = false;

			// Si hay una entidad elegida, se fija si pertenece al orden elegido
			if (v.ordenPorEnt_id) v.ordenEnEntidad = v.ordenesPorEnt_id.includes(Number(v.ordenPorEnt_id));

			// Acciones si el orden no pertenece a la  entidad
			if (!v.ordenEnEntidad) {
				// Si el código existe en el layout, elige su orden correspondiente
				v.ordenCodigo = v.ordenesPorEntsBD.find((n) => n.id == v.ordenPorEnt_id).orden.codigo;
				v.ordenPorEntBD = v.ordenesPorEntBD.find((n) => n.entidad_id == v.entidad_id && n.orden.codigo == v.ordenCodigo);

				// Asigna el nuevo valor
				v.ordenPorEnt_id = v.ordenPorEntBD
					? v.ordenPorEntBD.id // análogo
					: v.ordenesPorEntBD.find((n) => n.entidad_id == v.entidad_id && n.ordenDefault).id; // default
			}

			// Actualiza variables
			DOM.ordenPorEnt_id.value = v.ordenPorEnt_id;
			configCons.ordenPorEnt_id = v.ordenPorEnt_id;
			v.ordenPorEntBD = v.ordenesPorEntsBD.find((n) => n.id == v.ordenPorEnt_id);
			v.ordenBD = v.ordenesBD.find((n) => n.id == v.ordenPorEntBD.orden_id);

			// Redirige a la siguiente instancia
			this.muestraOcultaOpciones();

			// Fin
			return;
		},
		muestraOcultaOpciones: () => {
			// Oculta/Muestra las opciones según la entidad elegida
			for (let opcion of DOM.ordenPorEntOpciones) {
				v.ordenesPorEnt_id.includes(Number(opcion.value))
					? opcion.classList.remove("ocultar") // Muestra las opciones que corresponden al orden
					: opcion.classList.add("ocultar"); // Oculta las opciones que no corresponden al orden
			}

			// Muestra / Oculta el título "Cuatro Pelis" en las opciones
			v.ordenesPorEntBD.filter((n) => n.entidad_id == v.entidad_id && n.boton).length
				? DOM.optgroupCuatroPelis.classList.remove("ocultar")
				: DOM.optgroupCuatroPelis.classList.add("ocultar");

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
		v.obtener = !!configCons.entidad_id && !!configCons.ordenPorEnt_id;

		// Acciones si no hay errores
		if (v.obtener) {
			// Muestra sectores
			DOM.nav.classList.remove("ocultar");
			DOM.mostrarOcultarFiltros.classList.remove("ocultar"); // los botones "mostrar flitros" y "ocultar filtros"

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
			DOM.mostrarOcultarFiltros.classList.add("ocultar"); // los botones "mostrar flitros" y "ocultar filtros"
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
		for (let campo of DOM.camposPresenciaEstable)
			if (campo.value && campo.value != "sinFiltro") configCons[campo.name] = campo.value;

		// Fin
		this.pppOpciones();
		return;
	},

	// Presencia eventual - Checkboxes
	pppOpciones: function () {
		// Si el usuario no está logueado, sigue a la siguiente rutina
		if (!v.userID) return this.idioma();

		// Si el orden elegido es "Mis preferencias", le asigna ese valor a 'pppOpciones'
		if (v.ordenBD.codigo == "pppFecha") configCons.pppOpciones = v.misPreferencias.combo.split(",");
		// Acciones si el orden elegido es otro
		else {
			// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
			muestraOcultaActualizaPref(true, "pppOpciones");

			// Revisa el valor
			if (configCons.pppOpciones == "sinFiltro") delete configCons.pppOpciones;
			// Si 'pppOpciones' tiene el valor de un combo, lo convierte en array
			else {
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
		const seMuestra = !!configCons.calidadImagen; // si no se eligió una calidad, no se muestran

		// Muestra/Oculta el sector y actualiza el valor del campo 'configCons'
		muestraOcultaActualizaPref(seMuestra, "idioma");

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
		? v.mostrarFiltros
			? DOM[elemento].parentNode.classList.remove("ocultar")
			: DOM[elemento].parentNode.classList.replace("ocultar", "ocultaFiltro")
		: DOM[elemento].parentNode.classList.add("ocultar");

	// Actualiza el valor de 'configCons'
	if (seMuestra && DOM[elemento].value) configCons[elemento] = DOM[elemento].value;

	// Fin
	return;
};
