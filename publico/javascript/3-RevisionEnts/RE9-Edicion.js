"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Datos del registro
		entidad: new URL(location.href).searchParams.get("entidad"),
		entID: new URL(location.href).searchParams.get("id"),
		edicID: new URL(location.href).searchParams.get("edicion_id"),
		// Motivos para borrar
		aprobar: document.querySelectorAll("#contenido .fa-circle-check"),
		muestraCartelMotivos: document.querySelectorAll("#contenido .fa-circle-xmark.mostrarMotivos"),
		cartelRechazo: document.querySelectorAll("#contenido #cartelRechazo"),
		motivoRechazos: document.querySelectorAll("#contenido #cartelRechazo select"),
		cancelar: document.querySelector("#cartelRechazo .flechas .fa-circle-left"),
		rechazar: document.querySelectorAll("#contenido .rechazar"),
		tapaElFondo: document.querySelector("#tapar-el-fondo"),
		motivoGenerico_id: await fetch("/revision/api/edicion/motivo-generico").then((n) => n.json()),
		// Bloque Ingresos
		bloqueIngrs: document.querySelector("#contenido #ingrs"),
		filasIngrs: document.querySelectorAll("#contenido #ingrs .fila"),
		// Bloque Reemplazos
		bloqueReemps: document.querySelector("#contenido #reemps"),
		filasReemps: document.querySelectorAll("#contenido #reemps .fila"),
		// Otras variables
		filas: document.querySelectorAll("#contenido .fila"),
		campoNombres: document.querySelectorAll("#contenido .campoNombre"),
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
	let consecuencias = (resultado) => {
		// Fórmulas
		let ocultaBloque = (bloque, filas) => {
			return (
				bloque &&
				!bloque.className.includes("ocultar") &&
				filas.length &&
				Array.from(filas)
					.map((n) => n.className)
					.every((n) => n.includes("ocultar"))
			);
		};

		// Interrumpe si los resultados fueron insatisfactorios
		if (!resultado.OK) return;
		// Verifica si debe ocultar algún bloque
		if (ocultaBloque(v.bloqueIngrs, v.filasIngrs)) v.bloqueIngrs.classList.add("ocultar");
		if (ocultaBloque(v.bloqueReemps, v.filasReemps)) v.bloqueReemps.classList.add("ocultar");

		// Averigua si está todo procesado
		let bloqueIngrsOculto = !v.bloqueIngrs || v.bloqueIngrs.className.includes("ocultar");
		let bloqueReempsOculto = !v.bloqueReemps || v.bloqueReemps.className.includes("ocultar");
		let todoProcesado = bloqueIngrsOculto && bloqueReempsOculto;

		// Si está todo procesado y quedan campos,
		if (todoProcesado == resultado.quedanCampos) console.log("Error", todoProcesado, resultado.quedanCampos);
		// Acciones si está todo procesado
		else if (todoProcesado && !resultado.quedanCampos) {
			// 1. Si el registro pasó al status 'aprobado', publica el cartel
			if (resultado.statusAprob) {
				// Mensajes
				let arrayMensajes = ["Se completó la revisión, muchas gracias."];
				// Flechas
				let icono = {
					HTML: '<i class="fa-solid fa-thumbs-up" autofocus title="Entendido"></i>',
					link: "/inactivar-captura/?entidad=" + v.entidad + "&id=" + v.entID + "&origen=TE",
				};
				// Partes del cartel
				let cartel = document.querySelector("#cartel");
				let alerta = document.querySelector("#cartel #alerta");
				let check = document.querySelector("#cartel #check");
				let mensajes = document.querySelector("#cartel ul#mensajes");
				mensajes.style.listStyle ="none"
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

				// Muestra el cartel
				v.tapaElFondo.classList.remove("ocultar");
				cartel.classList.remove("ocultar");
			}
			// 2. Si el registro no pasó al status 'aprobado', redirige a edicion
			else location.href = "/producto/edicion/?entidad=" + v.entidad + "&id=" + v.entID + "&origen=TE";
		}

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

			// Fin
			return;
		});

		// En EdicDemas, los primeros casos son 'sin motivo', por eso es que recién después de terminarlos, se muestra el motivo
		if (indiceMotivo >= 0) {
			// Muestra cartel de motivos
			v.muestraCartelMotivos[indiceMotivo].addEventListener("click", () => {
				v.cartelRechazo[indiceMotivo].classList.remove("ocultar");
				return;
			});
			// Activa la opción para rechazar
			v.motivoRechazos[indiceMotivo].addEventListener("change", () => {
				if (v.motivoRechazos[indiceMotivo].value) v.rechazar[indice].classList.remove("inactivo");
				else v.rechazar[indice].classList.add("inactivo");
				return;
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

			// Fin
			return;
		});
	}
});
