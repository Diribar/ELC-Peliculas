"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Motivos para borrar
		aprobar: document.querySelectorAll("#contenido .aprobar"),
		rechazar: document.querySelectorAll("#contenido .rechazar"),
		muestraMotivos: document.querySelectorAll("#contenido .muestraMotivos"),
		cartelRechazo: document.querySelectorAll("#contenido #cartelRechazo"),
		motivoRechazos: document.querySelectorAll("#contenido #cartelRechazo select"),
		cancelar: document.querySelector("#cartelRechazo .iconos .fa-circle-left"),
		todoElMain: document.querySelector("#todoElMain"),
		tapaElFondo: document.querySelector("#tapaElFondo"),
		// Bloque Ingresos
		bloqueIngrs: document.querySelector("#contenido #ingrs"),
		filasIngrs: document.querySelectorAll("#contenido #ingrs .fila"),
		// Bloque Reemplazos
		bloqueReemps: document.querySelector("#contenido #reemps"),
		filasReemps: document.querySelectorAll("#contenido #reemps .fila"),
		// Otras variables
		filas: document.querySelectorAll("#contenido .fila"),
		campoNombres: document.querySelectorAll("#contenido .campoNombre"),
	};
	let v = {
		motivoGenerico_id: await fetch("/revision/api/edicion/motivo-generico").then((n) => n.json()),
		campoNombres: Array.from(DOM.campoNombres).map((n) => n.innerHTML),
		sinMotivo: DOM.rechazar.length - DOM.motivoRechazos.length, // Son los reemplazos, donde no se le pregunta un motivo al usuario
		casos: DOM.aprobar.length == DOM.rechazar.length ? DOM.aprobar.length : 0,
		rutaEdicion: rutaEdicion + entidad + "&id=" + entID + "&edicID=" + edicID,
		cola: "?entidad=" + entidad + "&id=" + entID + "&origen=" + (origen ? origen : "TE"),
	};

	// Funciones
	let FN = {
		ocultaBloques: function () {
			// Funciones
			let averiguaSiHayQueOcultarElBloque = (bloque, filas) =>
				bloque &&
				!bloque.className.includes("ocultar") &&
				filas.length &&
				Array.from(filas)
					.map((n) => n.className)
					.every((n) => n.includes("ocultar"));

			// Si corresponde, oculta un bloque
			if (averiguaSiHayQueOcultarElBloque(DOM.bloqueIngrs, DOM.filasIngrs)) DOM.bloqueIngrs.classList.add("ocultar");
			if (averiguaSiHayQueOcultarElBloque(DOM.bloqueReemps, DOM.filasReemps)) DOM.bloqueReemps.classList.add("ocultar");

			// Averigua si está todo procesado
			const bloqueIngrsOculto = !DOM.bloqueIngrs || DOM.bloqueIngrs.className.includes("ocultar");
			const bloqueReempsOculto = !DOM.bloqueReemps || DOM.bloqueReemps.className.includes("ocultar");
			todoProcesado = bloqueIngrsOculto && bloqueReempsOculto;

			// Fin
			if (todoProcesado) this.cartelAveriguandoInconsistencias();
			return;
		},
		cartelAveriguandoInconsistencias: () => {
			// Variables

			// Muestra el cartel

			// Fin
			return;
		},
		averiguaInconsistencias:function ()  {
			// Si corresponde, interrumpe la función
			if (!resultado.OK || !todoProcesado) return;

			// Acciones si quedan campos
			if (resultado.quedanCampos) this.cartelHayInconsistencias()
			 else location.href = (resultado.statusAprob ? "/inactivar-captura/" : "/" + familia + "/edicion/") + v.cola;

			// Fin
			return;
		},
		cartelHayInconsistencias: () => {
			// Variables
			let arrayMensajes = [
				"Se encontró una inconsistencia en el registro de edición.",
				"Figura que está todo procesado, y a la vez quedan campos por procesar",
			];
			let icono = {
				HTML: '<i class="fa-solid fa-thumbs-up" autofocus title="Entendido"></i>',
				link: "/" + familia + "/edicion/" + v.cola,
			};
			let DOM = {
				cartelGenerico: document.querySelector("#cartelGenerico"),
				alerta: document.querySelector("#cartelGenerico #alerta"),
				check: document.querySelector("#cartelGenerico #check"),
				mensajes: document.querySelector("#cartelGenerico ul#mensajes"),
				iconos: document.querySelector("#cartelGenerico #iconosCartel"),
			};

			// Formatos
			cartelGenerico.style.backgroundColor = "var(--rojo-oscuro)";
			alerta.classList.remove("ocultar");
			check.classList.add("ocultar");

			// Cambia el contenido del mensaje y los iconos
			mensajes.innerHTML = "";
			for (let mensaje of arrayMensajes) mensajes.innerHTML += "<li>" + mensaje + "</li>";
			iconos.innerHTML = "";
			iconos.innerHTML += "<a href='" + icono.link + "' tabindex='1' autofocus>" + icono.HTML + "</a>";

			// Muestra el cartel
			DOM.todoElMain.classList.remove("ocultar");
			DOM.tapaElFondo.classList.remove("ocultar");
			cartelGenerico.classList.remove("ocultar");

			// Fin
			return;
		},
	};

	// Listeners
	for (let indice = 0; indice < v.casos; indice++) {
		// Variables
		let indiceMotivo = indice - v.sinMotivo;
		let campo = v.campoNombres[indice];

		// Sólo para los reemplazos
		if (indiceMotivo >= 0) {
			// Muestra cartel de motivos
			DOM.muestraMotivos[indiceMotivo].addEventListener("click", () => {
				DOM.cartelRechazo[indiceMotivo].classList.remove("ocultar");
				return;
			});

			// Activa la opción para rechazar
			DOM.motivoRechazos[indiceMotivo].addEventListener("change", () => {
				if (DOM.motivoRechazos[indiceMotivo].value) DOM.rechazar[indice].classList.remove("inactivo");
				else DOM.rechazar[indice].classList.add("inactivo");
				return;
			});
		}

		// Aprueba el nuevo valor
		DOM.aprobar[indice].addEventListener("click", async () => {
			// Ocultar la fila
			if (DOM.filas.length) DOM.filas[indice].classList.add("ocultar");
			FN.ocultaBloques();

			// Actualiza el valor original y obtiene el resultado
			const ruta = v.rutaEdicion + "&aprob=true&campo=" + campo;
			resultado = await fetch(ruta).then((n) => n.json());

			// Fin
			FN.averiguaInconsistencias();
			return;
		});

		// Rechaza el nuevo valor
		DOM.rechazar[indice].addEventListener("click", async () => {
			// Variables
			let motivo_id = indiceMotivo >= 0 ? DOM.motivoRechazos[indiceMotivo].value : v.motivoGenerico_id;
			if (!motivo_id) return; // Stopper (si el select no tiene ningún valor)

			// Oculta la fila
			if (DOM.filas.length) DOM.filas[indice].classList.add("ocultar");
			FN.ocultaBloques();

			// Descarta el valor editado y obtiene el resultado
			let ruta = v.rutaEdicion + "&campo=" + campo + "&motivo_id=" + motivo_id;
			resultado = await fetch(ruta).then((n) => n.json());

			// Fin
			FN.averiguaInconsistencias();
			return;
		});
	}
});

// Datos del registro
const entidad = new URL(location.href).searchParams.get("entidad");
const entID = new URL(location.href).searchParams.get("id");
const origen = new URL(location.href).searchParams.get("origen");
const edicID = new URL(location.href).searchParams.get("edicID");

// Otras variables
const url = location.pathname.replace("/revision/", "");
const familia = url.slice(0, url.indexOf("/"));
const rutaEdicion = "/revision/api/edicion/aprob-rech/?entidad=";
let resultado, todoProcesado;
