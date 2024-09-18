"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Generales
		todoElMain: document.querySelector("main #todoElMain"),
		tapaElFondo: document.querySelector("#todoElMain #tapaElFondo"),
		datos: document.querySelector("#cuerpo #datos"),

		// Motivos para borrar
		aprobar: document.querySelectorAll("#contenido .aprobar"),
		rechazar: document.querySelectorAll("#contenido .rechazar"),
		muestraMotivos: document.querySelectorAll("#contenido .muestraMotivos"),
		cartelRechazo: document.querySelectorAll("#contenido #cartelRechazo"),
		motivoRechazos: document.querySelectorAll("#contenido #cartelRechazo select"),
		cancelar: document.querySelector("#cartelRechazo .iconos .fa-circle-left"),

		// Bloque Ingresos
		bloqueIngrs: document.querySelector("#contenido #ingrs"),
		filasIngrs: document.querySelectorAll("#contenido #ingrs .fila"),

		// Bloque Reemplazos
		bloqueReemps: document.querySelector("#contenido #reemps"),
		filasReemps: document.querySelectorAll("#contenido #reemps .fila"),

		// Cartel genérico
		cartelGenerico: document.querySelector("#cartelGenerico"),
		alerta: document.querySelector("#cartelGenerico #alerta"),
		check: document.querySelector("#cartelGenerico #check"),
		contenedorMensajes: document.querySelector("#cartelGenerico #contenedorMensajes"),

		// Otras variables
		filas: document.querySelectorAll("#contenido .fila"),
		campoNombres: document.querySelectorAll("#contenido .campoNombre"),
	};
	let v = {
		motivoGenerico_id: await fetch("/revision/api/edicion/motivo-generico").then((n) => n.json()),
		campoNombres: Array.from(DOM.campoNombres).map((n) => n.innerHTML),
		sinMotivo: DOM.rechazar.length - DOM.motivoRechazos.length, // Son los reemplazos, donde no se le pregunta un motivo al usuario
		casos: DOM.aprobar.length == DOM.rechazar.length ? DOM.aprobar.length : 0,
	};

	// Funciones
	let FN = {
		averiguaSiHayQueOcultarElBloque: (bloque, filas) => {
			return (
				bloque &&
				!bloque.className.includes("ocultar") &&
				filas.length &&
				Array.from(filas)
					.map((n) => n.className)
					.every((n) => n.includes("ocultar"))
			);
		},
		ocultaBloques: function () {
			// Si corresponde, oculta un bloque
			if (this.averiguaSiHayQueOcultarElBloque(DOM.bloqueIngrs, DOM.filasIngrs)) DOM.bloqueIngrs.classList.add("ocultar");
			if (this.averiguaSiHayQueOcultarElBloque(DOM.bloqueReemps, DOM.filasReemps)) DOM.bloqueReemps.classList.add("ocultar");

			// Averigua si está todo procesado
			const bloqueIngrsOculto = !DOM.bloqueIngrs || DOM.bloqueIngrs.className.includes("ocultar");
			const bloqueReempsOculto = !DOM.bloqueReemps || DOM.bloqueReemps.className.includes("ocultar");
			todoProcesado = bloqueIngrsOculto && bloqueReempsOculto;

			// Acciones si está todo procesado
			if (todoProcesado) this.todoProcesado();

			// Fin
			return;
		},
		todoProcesado: () => {
			// Oculta el cartel de datos
			DOM.datos.classList.add("ocultar");

			// Se asegura de tener vacío el 'contenedorMensajes'
			DOM.contenedorMensajes.innerHTML = "";

			// Formatos
			DOM.cartelGenerico.classList.add("check");
			DOM.check.classList.remove("ocultar");
			DOM.alerta.classList.add("ocultar");

			// Muestra el cartel
			DOM.todoElMain.classList.remove("ocultar");
			DOM.tapaElFondo.classList.remove("ocultar");
			DOM.cartelGenerico.classList.remove("ocultar");

			// Fin
			return;
		},
		averiguaInconsistencias: function () {
			// Si corresponde, interrumpe la función
			if (!resultado.OK || !todoProcesado) return;

			// Acciones si quedan campos
			if (resultado.quedanCampos) this.cartelHayInconsistencias();
			else location.href = (resultado.statusAprob ? "/inactivar-captura/" : "/" + familia + "/edicion/") + cola;

			// Fin
			return;
		},
		cartelHayInconsistencias: () => {
			// Crea el mensaje
			const mensajes = [
				"Se encontró una inconsistencia en el registro de edición.",
				"Figura que está todo procesado, y a la vez quedan campos por procesar",
			];
			const link = "/" + familia + "/edicion/" + cola;
			const vistaEntendido = variables.vistaEntendido(link);
			contenidoDelCartelGenerico({DOM, mensajes, ...vistaEntendido});

			// Formatos
			DOM.cartelGenerico.classList.remove("check");
			DOM.alerta.classList.remove("ocultar");
			DOM.check.classList.add("ocultar");

			// Muestra el cartel
			DOM.todoElMain.classList.remove("ocultar");
			DOM.tapaElFondo.classList.remove("ocultar");
			DOM.cartelGenerico.classList.remove("ocultar");

			// Fin
			return;
		},
	};

	// Listeners
	for (let indice = 0; indice < v.casos; indice++) {
		// Variables
		let indiceMotivo = indice - v.sinMotivo;
		let campo = v.campoNombres[indice];

		// Aprueba el nuevo valor
		DOM.aprobar[indice].addEventListener("click", async () => {
			// Ocultar la fila
			if (DOM.filas.length) DOM.filas[indice].classList.add("ocultar");
			FN.ocultaBloques();

			// Actualiza el valor original y obtiene el resultado
			const ruta = rutaEdicion + "&aprob=true&campo=" + campo;
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
			const ruta = rutaEdicion + "&campo=" + campo + "&motivo_id=" + motivo_id;
			resultado = await fetch(ruta).then((n) => n.json());

			// Fin
			FN.averiguaInconsistencias();
			return;
		});

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
	}
});

// Datos del registro
const edicID = new URL(location.href).searchParams.get("edicID");
const origen = new URL(location.href).searchParams.get("origen");

// Rutas
const rutaEdicion = "/revision/api/edicion/aprob-rech/?entidad=" + entidad + "&id=" + id + "&edicID=" + edicID;
const cola = "?entidad=" + entidad + "&id=" + id + "&origen=" + (origen ? origen : "TE");

// Otras variables
const url = location.pathname.replace("/revision/", "");
const familia = url.slice(0, url.indexOf("/"));
let resultado, todoProcesado;
