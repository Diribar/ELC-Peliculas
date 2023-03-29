"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Todo el formulario
		cuerpo: document.querySelector("#cuerpo"),

		// Layout y Orden
		layoutSelect: document.querySelector("#encabezado select[name='layout']"),
		ordenSelect: document.querySelector("#encabezado select[name='orden']"),
		opcionesOrdenVista: document.querySelectorAll("#encabezado select[name='orden'] option:not(option[value=''])"),
		ordenam: document.querySelector("#encabezado #ascDes"),

		// Filtros
		nav: document.querySelector("#filtros #campos nav"),
		cfcSelect: document.querySelector("#filtros #campos nav #cfc select"),
		ocurrioSector: document.querySelector("#filtros #campos #ocurrio"),
		ocurrioSelect: document.querySelector("#filtros #campos #ocurrio select"),
		ocurrioSISectores: document.querySelectorAll("#filtros #campos .ocurrioSI"),
		epocaSelect:document.querySelector("#filtros #campos #epoca select"),
		apMarSector: document.querySelector("#filtros #campos #apMar"),
		apMarSelect: document.querySelector("#filtros #campos #apMar select"),

		// Rutas
		rutaLayoutsOrdenes: "/consultas/api/layouts-y-ordenes",

		// Variables directrices
		notNull: "",
		cfc: "",
		epoca_id: "",
		ocurrio: "",
	};
	// Obtiene tabla de layouts y ordenes
	const [layouts, opcionesOrdenBD] = await fetch(v.rutaLayoutsOrdenes).then((n) => n.json());

	// Funciones
	let FN = {
		// Impactos de layout
		impactosDeLayout: function () {
			if (v.layoutSelect.value) {
				// Asigna valor a las variables
				v.layoutBD = layouts.find((n) => n.id == v.layoutSelect.value);
				v.notNull = v.layoutBD.not_null_out;
				v.ocurrio = v.layoutBD.ocurrio;
				v.nav.classList.remove("ocultarLayout");
				this.impactosEnDeOrden();
			} else {
				v.notNull = "";
				v.ocurrio = "";
				v.nav.classList.add("ocultarLayout");
			}

			// Fin
			return;
		},
		// Impactos en/de orden
		impactosEnDeOrden: function () {
			// IMPACTOS EN
			// 1. Oculta/Muestra las opciones que corresponden
			let checked = document.querySelector("#encabezado select[name='orden'] option:checked");
			opcionesOrdenBD.forEach((opcion, i) => {
				if (!v.layoutBD || (opcion.not_null_in && opcion.not_null_in != v.layoutBD.not_null_out)) {
					v.opcionesOrdenVista[i].classList.add("ocultar");
					// Si la opción estaba elegida, la 'des-elige'
					if (v.opcionesOrdenVista[i] == checked) v.ordenSelect.value = "";
				} else v.opcionesOrdenVista[i].classList.remove("ocultar");
			});

			// IMPACTOS DE
			if (v.ordenSelect.value) {
				const orden = opcionesOrdenBD.find((n) => n.id == v.ordenSelect.value);
				if (orden) {
					if (v.notNull == "-" && orden.not_null_out != "-") v.notNull = orden.not_null_out;
					if (v.ocurrio == "-" && orden.ocurrio != "-") v.ocurrio = orden.ocurrio;
				}
				// Ordenamiento
				if (orden && orden.ordenam == "ascDes") {
					v.ordenam.classList.add("flexCol");
					v.ordenam.classList.remove("ocultar");
				} else {
					v.ordenam.classList.add("ocultar");
					v.ordenam.classList.remove("flexCol");
				}
				// Des-oculta 'nav'
				v.nav.classList.remove("ocultarOrden");
			} else {
				v.nav.classList.add("ocultarOrden");
			}

			this.impactosDeCFC();

			// Fin
			return;
		},
		// Impactos de cfc
		impactosDeCFC: function () {
			// IMPACTOS DE
			v.cfc = v.cfcSelect.value ? v.cfcSelect.value : "";

			this.impactosEnDeOcurrio();

			// Fin
			return;
		},
		// Impactos en/de ocurrio
		impactosEnDeOcurrio: () => {
			// IMPACTOS EN
			v.ocurrio == "-" ? v.ocurrioSector.classList.remove("ocultar") : v.ocurrioSector.classList.add("ocultar");

			// IMPACTOS DE
			if (v.ocurrio == "-" && v.ocurrioSelect.value) v.ocurrio = v.ocurrioSelect.value;
			for (let sector of v.ocurrioSISectores)
				v.ocurrio == "SI" ? sector.classList.remove("ocultar") : sector.classList.add("ocultar");

			this.impactosEnDeEpoca()

			// Fin
			return;
		},
		// Impactos en/de epoca
		impactosEnDeEpoca:()=>{
			// IMPACTOS EN
			// Sólo se muestra el sector si ocurrió='SI' - resuelto en impactosEnDeOcurrio

			// IMPACTOS DE
			if (v.epocaSelect.value) v.epoca = v.epocaSelect.value;
			
			this.impactosEnDeApMar()

			// Fin
			return;
		},
		// Impactos en/de apMar
		impactosEnDeApMar:()=>{
			// IMPACTOS EN
			// Sólo se muestra el sector si ocurrió='SI' - resuelto en impactosEnDeOcurrio
			// Sólo se muestra el sector si CFC='SI' y epoca='pst'
			if (v.cfc=="SI"&&v.epoca=="pst") v.apMarSector.classList.remove("ocultarApMar")
			else v.apMarSector.classList.add("ocultarApMar")

			// IMPACTOS DE
			if (v.epocaSelect.value) v.epoca = v.epocaSelect.value;
			
			this.impactosEnDeApMar()

			// Fin
			return;
		}


		// Impactos en/de canons

		// Impactos en/de rolesIglesia
	};

	// Eventos
	v.cuerpo.addEventListener("change", async (e) => {
		// Variables
		let nombre = e.target.name;

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
