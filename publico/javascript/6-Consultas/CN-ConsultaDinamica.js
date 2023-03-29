"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Todo el formulario
		cuerpo: document.querySelector("#cuerpo"),
		asegurate: document.querySelector("#cuerpo #comencemos button#rojo"),
		comencemos: document.querySelector("#cuerpo #comencemos button#verde"),

		// Layout y Orden
		layoutSelect: document.querySelector("#encabezado select[name='layout']"),
		ordenSelect: document.querySelector("#encabezado select[name='orden']"),
		opcionesOrdenVista: document.querySelectorAll("#encabezado select[name='orden'] option:not(option[value=''])"),
		ordenamSector: document.querySelector("#encabezado #ascDes"),
		ordenamInputs: document.querySelectorAll("#encabezado #ascDes input"),

		// Filtros
		nav: document.querySelector("#filtros #campos nav"),
		cfcSelect: document.querySelector("#filtros #campos nav #cfc select"),
		ocurrioSector: document.querySelector("#filtros #campos #ocurrio"),
		ocurrioSelect: document.querySelector("#filtros #campos #ocurrio select"),
		ocurrioSISectores: document.querySelectorAll("#filtros #campos .ocurrioSI"),
		epocaSelect: document.querySelector("#filtros #campos #epoca select"),
		apMarSector: document.querySelector("#filtros #campos #apMar"),
		apMarSelect: document.querySelector("#filtros #campos #apMar select"),
		canonsSector: document.querySelector("#filtros #campos #canons"),
		canonsSelect: document.querySelector("#filtros #campos #canons select"),
		rolesIglesiaSector: document.querySelector("#filtros #campos #rolesIglesia"),
		rolesIglesiaSelect: document.querySelector("#filtros #campos #rolesIglesia select"),
		demasElegibles: document.querySelectorAll("#filtros #campos .demasElegibles select"),

		// Rutas
		rutaLayoutsOrdenes: "/consultas/api/layouts-y-ordenes",

		// Variables directrices
		notNull: "",
		cfc: "",
		epoca_id: "",
		ocurrio: "",
		elegibles: {},
	};
	// Obtiene tabla de layouts y ordenes
	const [layouts, opcionesOrdenBD] = await fetch(v.rutaLayoutsOrdenes).then((n) => n.json());

	// Funciones
	let FN = {
		// Impactos de layout
		impactosDeLayout: function () {
			// Asigna valor a las variables
			const SI = !!v.layoutSelect.value;
			v.layout = SI ? layouts.find((n) => n.id == v.layoutSelect.value) : null;
			v.notNull = SI ? v.layout.not_null_out : null;
			v.ocurrio = SI ? v.layout.ocurrio : null;
			if (SI) v.elegibles.layout = v.layoutSelect.value;

			// Siguiente rutina
			this.impactosEnDeOrden();

			// Fin
			return;
		},
		// Impactos en/de orden
		impactosEnDeOrden: function () {
			// IMPACTOS EN - Oculta/Muestra las opciones que corresponden
			const checked = document.querySelector("#encabezado select[name='orden'] option:checked");
			opcionesOrdenBD.forEach((opcion, i) => {
				if (!v.layout || (opcion.not_null_in && opcion.not_null_in != v.layout.not_null_out)) {
					v.opcionesOrdenVista[i].classList.add("ocultar");
					// Si la opción estaba elegida, la 'des-elige'
					if (v.opcionesOrdenVista[i] == checked) v.ordenSelect.value = "";
				} else {
					v.opcionesOrdenVista[i].classList.remove("ocultar");
				}
			});

			// IMPACTOS DE
			const SI = !!v.ordenSelect.value;
			if (SI) {
				const orden = opcionesOrdenBD.find((n) => n.id == v.ordenSelect.value);
				if (v.notNull == "-" && orden.not_null_out != "-") v.notNull = orden.not_null_out;
				if (v.ocurrio == "-" && orden.ocurrio != "-") v.ocurrio = orden.ocurrio;
				v.elegibles.orden = v.ordenSelect.value;
			}

			this.impactosEnDeOrdenam();

			// Fin
			return;
		},
		impactosEnDeOrdenam: function () {
			// Variables
			const orden = v.ordenSelect.value ? opcionesOrdenBD.find((n) => n.id == v.ordenSelect.value) : null;

			// IMPACTOS EN
			if (!v.ordenSelect.value || orden.ordenam != "ascDes") {
				// Ocultar el sector
				v.ordenamSector.classList.add("ocultar");
				v.ordenamSector.classList.remove("flexCol");
				if (v.ordenSelect.value) v.elegibles.ordenam = orden.ordenam;
			} else {
				// Muestra el sector
				v.ordenamSector.classList.add("flexCol");
				v.ordenamSector.classList.remove("ocultar");
				for (let ordenam of v.ordenamInputs) if (ordenam.checked) v.elegibles.ordenam = ordenam.value;
			}

			// IMPACTOS DE
			// Sector 'OK'
			v.elegibles.ordenam ? v.ordenamSector.classList.add("OK") : v.ordenamSector.classList.remove("OK");

			this.impactosEnBotonesZP();
			this.impactosDeCFC();

			// Fin
			return;
		},
		impactosEnBotonesZP: () => {
			const SI_layout = !!v.layoutSelect.value;
			const SI_orden = !!v.ordenSelect.value;
			const SI_ordenam = !!v.elegibles.ordenam;
			const SI = SI_layout && SI_orden && SI_ordenam;

			// Muestra/Oculta sectores
			SI ? v.nav.classList.remove("ocultar") : v.nav.classList.add("ocultar");
			SI ? v.asegurate.classList.add("ocultar") : v.asegurate.classList.remove("ocultar");
			SI ? v.comencemos.classList.remove("ocultar") : v.comencemos.classList.add("ocultar");
		},
		impactosDeCFC: function () {
			// IMPACTOS DE
			v.cfc = v.cfcSelect.value ? v.cfcSelect.value : "";
			if (v.cfc) v.elegibles.cfc = v.cfc;

			this.impactosEnDeOcurrio();

			// Fin
			return;
		},
		// Impactos en/de ocurrio
		impactosEnDeOcurrio: function () {
			// IMPACTOS EN
			v.ocurrio == "-" ? v.ocurrioSector.classList.remove("ocultar") : v.ocurrioSector.classList.add("ocultar");

			// IMPACTOS DE
			// 1. Actualiza el valor de 'ocurrio'
			if (v.ocurrio == "-" && v.ocurrioSelect.value) v.ocurrio = v.ocurrioSelect.value;
			// 2. Muestra/Oculta los sectores dependientes
			for (let sector of v.ocurrioSISectores)
				v.ocurrio == "SI" ? sector.classList.remove("ocultar") : sector.classList.add("ocultar");
			// 3. Asigna el valor para 'ocurrio'
			if (v.ocurrio == "SI" || v.ocurrio == "NO") v.elegibles.ocurrio = v.ocurrio;

			this.impactosEnDeEpoca();

			// Fin
			return;
		},
		// Impactos en/de epoca
		impactosEnDeEpoca: function () {
			if (v.ocurrio != "SI") return;
			// IMPACTOS EN - Sólo se muestra el sector si ocurrió='SI' - resuelto en impactosEnDeOcurrio

			// IMPACTOS DE
			if (v.epocaSelect.value) v.epoca = v.epocaSelect.value;

			this.impactosEnDeApMar();

			// Fin
			return;
		},
		// Impactos en/de apMar
		impactosEnDeApMar: function () {
			if (v.ocurrio != "SI") return;
			// IMPACTOS EN
			// Sólo se muestra el sector si ocurrió='SI' - resuelto en impactosEnDeOcurrio
			// Sólo se muestra el sector si CFC='SI' y epoca='pst'
			if (v.cfc == "SI" && v.epoca == "pst") v.apMarSector.classList.remove("ocultarApMar");
			else v.apMarSector.classList.add("ocultarApMar");

			// IMPACTOS DE
			if (v.apMarSelect.value) v.elegibles.apMar = v.apMarSelect.value;

			this.impactosEnDeCanonsMasRolesIglesia();

			// Fin
			return;
		},
		// Impactos en/de canons y rolesIglesia
		impactosEnDeCanonsMasRolesIglesia: function () {
			if (v.ocurrio != "SI") return;
			// IMPACTOS EN
			// Sólo se muestra el sector si ocurrió='SI' - resuelto en impactosEnDeOcurrio
			// Sólo se muestra el sector si notNull='personaje' y CFC='SI'
			if (v.notNull == "personaje" && v.cfc == "SI") {
				v.canonsSector.classList.remove("ocultarCanons");
				v.rolesIglesiaSector.classList.remove("ocultarRolesIglesia");
			} else {
				v.canonsSector.classList.add("ocultarCanons");
				v.rolesIglesiaSector.classList.add("ocultarRolesIglesia");
			}

			// IMPACTOS DE
			if (v.canonsSelect.value) v.elegibles.canons = v.canonsSelect.value;
			if (v.rolesIglesiaSelect.value) v.elegibles.rolesIglesia = v.rolesIglesiaSelect.value;

			this.impactosDeDemasElegibles();

			// Fin
			return;
		},
		// Impactos de Demás Elegibles
		impactosDeDemasElegibles: function () {},
	};

	// Eventos
	v.cuerpo.addEventListener("change", async (e) => {
		// Variables
		let nombre = e.target.name;
		v.elegibles = {};

		// Novedades en el Filtro Personalizado
		if (nombre == "filtrosPers") {
		} else {
			FN.impactosDeLayout();

			// Botones en Filtros Personalizados
			// if (botones.condicionesMinimas()) botones.impactosDeElegibles();
			// else return;
		}
	});

	// Start-up
	FN.impactosDeLayout();
});
