"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Datos del registro
		entidad: new URL(window.location.href).searchParams.get("entidad"),
		entID: new URL(window.location.href).searchParams.get("id"),
		edicID: new URL(window.location.href).searchParams.get("edicion_id"),
		// Motivos para borrar
		aprobar: document.querySelectorAll(".contenido .fa-circle-check"),
		muestraCartelMotivos: document.querySelectorAll(".contenido .fa-circle-xmark.mostrarMotivos"),
		cartelRechazo: document.querySelectorAll(".contenido #cartelRechazo"),
		motivoRechazos: document.querySelectorAll(".contenido #cartelRechazo select"),
		cancelar: document.querySelector("#cartelRechazo .flechas .fa-circle-left"),
		rechazar: document.querySelectorAll(".contenido .rechazar"),
		tapaElFondo: document.querySelector("#tapar-el-fondo"),
		motivoGenerico_id: await fetch("/revision/api/edicion/motivo-generico").then((n) => n.json()),
		// Bloque Ingresos
		bloqueIngrs: document.querySelector(".contenido #ingrs"),
		filasIngrs: document.querySelectorAll(".contenido #ingrs .fila"),
		// Bloque Reemplazos
		bloqueReemps: document.querySelector(".contenido #reemps"),
		filasReemps: document.querySelectorAll(".contenido #reemps .fila"),
		// Otras variables
		filas: document.querySelectorAll(".contenido .fila"),
		campoNombres: document.querySelectorAll(".contenido .campoNombre"),
		rutaEdicion: "",
		familia: location.pathname.slice(1),
		rutaEdicion: "/revision/api/edicion/aprob-rech/?entidad=",
	};

	// Otras variables
	v.rutaEdicion += v.entidad + "&id=" + v.entID + "&edicion_id=" + v.edicID;
	let sinMotivo = v.rechazar.length - v.motivoRechazos.length; // Son los reemplazos, donde no se le pregunta un motivo al usuario
	let casos = v.aprobar.length == v.rechazar.length ? v.aprobar.length : 0;
	v.campoNombres = Array.from(v.campoNombres).map((n) => n.innerHTML);

	// FUNCIONES ----------------------------------------------------------------
	let consecuencias = (resultado, campo) => {
		// Fórmulas
		let ocultaBloques = () => {
			// Fórmulas
			let todasLasFilasOcultas = (filas) => {
				let todasLasFilasOcultas = Array.from(filas)
					.map((n) => n.className)
					.every((n) => n.includes("ocultar"));
				// Fin
				return todasLasFilasOcultas;
			};
			// Oculta bloque de Ingresos
			if (
				v.filasIngrs.length &&
				v.bloqueIngrs &&
				!v.bloqueIngrs.className.includes("ocultar") &&
				todasLasFilasOcultas(v.filasIngrs)
			)
				v.bloqueIngrs.classList.add("ocultar");
			// Oculta bloque de Reemplazos
			if (
				v.filasReemps.length &&
				v.bloqueReemps &&
				!v.bloqueReemps.className.includes("ocultar") &&
				todasLasFilasOcultas(v.filasReemps)
			)
				v.bloqueReemps.classList.add("ocultar");
			// Fin
			return;
		};
		let FN_todoProcesado = () => {
			// Averigua cada bloque
			let bloqueIngrsOculto = !v.bloqueIngrs || v.bloqueIngrs.className.includes("ocultar");
			let bloqueReempsOculto = !v.bloqueReemps || v.bloqueReemps.className.includes("ocultar");
			// Averigua si está todo oculto
			return bloqueIngrsOculto && bloqueReempsOculto;
		};
		let mensajeFin = () => {
			// Mensajes
			let arrayMensajes = ["Se completó la revisión", "Muchas gracias"];
			// Flechas
			let icono = {
				HTML: '<i class="fa-solid fa-thumbs-up" autofocus title="Entendido"></i>',
				link: "/inactivar-captura/?entidad=" + v.entidad + "&id=" + v.entID + "&origen=tableroEnts",
			};
			// Fin
			return {arrayMensajes, icono};
		};
		let cartel = (datos) => {
			// Variables
			let {arrayMensajes, icono} = datos;
			// Partes del cartel
			let cartel = document.querySelector("#cartel");
			let alerta = document.querySelector("#cartel #alerta");
			let check = document.querySelector("#cartel #check");
			let mensajes = document.querySelector("#cartel ul#mensajes");
			let flechas = document.querySelector("#cartel #flechasCartel");

			// Formatos
			cartel.style.backgroundColor = "var(--verde-oscuro)";
			alerta.classList.add("ocultar");
			check.classList.remove("ocultar");

			// Cambia el contenido del mensaje y las flechas
			mensajes.innerHTML = "";
			for (let mensaje of arrayMensajes) mensajes.innerHTML += "<li>" + mensaje + "</li>";
			flechas.innerHTML = "";
			flechas.innerHTML += "<a href='" + icono.link + "' tabindex='-1'>" + icono.HTML + "</a>";

			// Mostrar el cartel
			v.tapaElFondo.classList.remove("ocultar");
			cartel.classList.remove("ocultar");

			// Fin
			return;
		};

		// Interrumpe si los resultados fueron insatisfactorios
		if (!resultado.OK) return;
		// Verifica si debe ocultar algún bloque
		if (v.bloqueIngrs || v.bloqueReemps) ocultaBloques();
		// Averigua si está todo procesado
		let todoProcesado = FN_todoProcesado();
		// Si está todo procesado y quedan campos,
		if (todoProcesado == resultado.quedanCampos) console.log(todoProcesado, resultado.quedanCampos);
		// Si está todo procesado, publica el cartel de fin
		else if (todoProcesado) cartel(mensajeFin());
		// Fin
		return;
	};

	// LISTENERS --------------------------------------------------------------------
	for (let indice = 0; indice < casos; indice++) {
		// Variables
		let indiceMotivo = indice - sinMotivo;
		let campo = v.campoNombres[indice];

		// Aprobar el nuevo valor
		v.aprobar[indice].addEventListener("click", async () => {
			// Ocultar la fila
			if (v.filas.length) v.filas[indice].classList.add("ocultar");
			// Actualiza el valor original y obtiene el resultado
			let ruta = v.rutaEdicion + "&aprob=true&campo=" + campo;
			let resultado = await fetch(ruta).then((n) => n.json());
			// Consecuencias
			consecuencias(resultado, campo);
		});

		// En EdicDemas, los primeros casos son 'sin motivo', por eso es que recién después de terminarlos, se muestra el motivo
		if (indiceMotivo >= 0) {
			// Muestra cartel de motivos
			v.muestraCartelMotivos[indiceMotivo].addEventListener("click", () => {
				v.cartelRechazo[indiceMotivo].classList.remove("ocultar");
			});
			// Activa la opción para rechazar
			v.motivoRechazos[indiceMotivo].addEventListener("change", () => {
				if (v.motivoRechazos[indiceMotivo].value) v.rechazar[indice].classList.remove("inactivo");
				else v.rechazar[indice].classList.add("inactivo");
			});
		}

		// Rechaza el nuevo valor
		v.rechazar[indice].addEventListener("click", async () => {
			// Variables
			let motivo_id = indiceMotivo >= 0 ? v.motivoRechazos[indiceMotivo].value : v.motivoGenerico_id;
			// Stopper
			if (!motivo_id) return;
			// Oculta la fila
			if (v.filas.length) v.filas[indice].classList.add("ocultar");
			// Descarta el valor editado y obtiene el resultado
			let ruta = v.rutaEdicion + "&campo=" + campo + "&motivo_id=" + motivo_id;
			let resultado = await fetch(ruta).then((n) => n.json());
			// Consecuencias
			consecuencias(resultado, campo);
		});
	}
});
