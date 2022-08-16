"use strict";
window.addEventListener("load", () => {
	// Variables
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let edicID = new URL(window.location.href).searchParams.get("edicion_id");

	// Opciones
	let aprobar = document.querySelectorAll("#contenido .fa-circle-check");
	let mostrarMotivos = document.querySelectorAll("#contenido .fa-circle-xmark.mostrarMotivos");

	// Motivos para borrar
	let rechazar = document.querySelectorAll("#contenido .rechazar");
	let menuMotivos = document.querySelectorAll("#contenido .motivos");
	let motivoRechazos = document.querySelectorAll("#contenido .motivos select");
	let sinMotivo = rechazar.length - motivoRechazos.length;

	// Bloque Ingresos
	let bloqueIngrs = document.querySelector("#contenido #ingrs");
	let filasIngrs = document.querySelectorAll("#contenido #ingrs .fila");

	// Bloque Reemplazos
	let bloqueReemps = document.querySelector("#contenido #reemps");
	let filasReemps = document.querySelectorAll("#contenido #reemps .fila");

	// Otras variables
	let casos = aprobar.length == rechazar.length ? aprobar.length : 0;
	let filas = document.querySelectorAll("#contenido .fila");
	let campoNombres = Array.from(document.querySelectorAll("#contenido .campoNombre")).map(
		(n) => n.innerHTML
	);
	let ruta =
		"/revision/api/producto-edicion/?entidad=" + entidad + "&id=" + prodID + "&edicion_id=" + edicID;

	// FUNCIONES ----------------------------------------------------------------
	let consecuenciasQC = (quedanCampos, statusAprobado) => {
		// Verificar si ocultar algún bloque
		let ingrsOculto = filasIngrs.length ? verificarBloques(filasIngrs, bloqueIngrs) : true;
		let reempsOculto = filasReemps.length ? verificarBloques(filasReemps, bloqueReemps) : true;
		// Averiguar si está todo oculto
		let todoOculto = ingrsOculto && reempsOculto;
		console.log(todoOculto);
		console.log(quedanCampos,statusAprobado);
		// 1. Si hay inconsistencias, recargar la página
		if (todoOculto == quedanCampos) window.location.reload();
		// 2. Acciones si no quedan más campos en la edición
		if (!quedanCampos) cartelFin(statusAprobado);
		// Fin
		return;
	};
	let verificarBloques = (filas, bloque) => {
		// Averiguar el status
		let ocultarBloque = Array.from(filas)
			.map((n) => n.classList)
			.map((n) => n.value)
			.every((n) => n.includes("ocultar"));
		// Ocultar el bloque si corresponde
		if (ocultarBloque) bloque.classList.add("ocultar");
		// Fin
		return ocultarBloque;
	};
	let cartelFin = (statusAprobado) => {
		// Partes del cartel
		let taparElFondo = document.querySelector("#tapar-el-fondo");
		let cartel = document.querySelector("#cartel");
		let error = document.querySelector("#error");
		let mensajes = document.querySelector("ul#mensajes");
		let flechas = document.querySelector("#cartel #flechasCartel");

		// Formatos
		cartel.style.backgroundColor = "var(--verde-oscuro)";
		error.classList.add("ocultar");

		// Mensajes
		let arrayMensajes = ["Gracias por completar la revisión."];
		// Si el status se cambió a 'aprobado', comunicarlo
		if (statusAprobado) {
			// Texto en función de la entidad
			let producto =
				entidad == "peliculas"
					? " la película"
					: entidad == "colecciones"
					? " la colección"
					: "l capítulo";
			let texto = "El status de" + producto + " fue cambiado a <strong>aprobado</strong>.";
			arrayMensajes.push(texto);
			// Texto sobre los capítulos
			if (entidad == "colecciones")
				arrayMensajes.push("Los capítulos también fueron cambiados a ese estado.");
		}
		// Cambiar el contenido del mensaje
		mensajes.innerHTML = "";
		for (let mensaje of arrayMensajes) mensajes.innerHTML += "<li>" + mensaje + "</li>";

		// Flechas
		let icono = {
			HTML: '<i class="fa-solid fa-thumbs-up" title="Entendido"></i>',
			link: "/inactivar-captura/?entidad=" + entidad + "&id=" + prodID + "destino=tablero",
		};
		flechas.innerHTML = "";
		flechas.innerHTML += "<a href='" + icono.link + "' autofocus>" + icono.HTML + "</a>";

		// Mostrar el cartel
		taparElFondo.classList.remove("ocultar");
		cartel.classList.remove("ocultar");

		// Fin
		return;
	};

	// LISTENERS --------------------------------------------------------------------
	for (let i = 0; i < casos; i++) {
		// Aprobar el nuevo valor
		aprobar[i].addEventListener("click", async () => {
			// Ocultar la fila
			filas[i].classList.add("ocultar");
			// Actualizar el campo del producto
			let [quedanCampos, statusAprobado] = await fetch(
				ruta + "&aprob=true&campo=" + campoNombres[i]
			).then((n) => n.json());
			// Revisar el status
			consecuenciasQC(quedanCampos, statusAprobado);
		});

		// Menú inactivar
		if (i >= sinMotivo) {
			mostrarMotivos[i - sinMotivo].addEventListener("click", () => {
				menuMotivos[i - sinMotivo].classList.remove("ocultar");
			});
		}

		// Rechazar el nuevo valor
		rechazar[i].addEventListener("click", async () => {
			let motivo = i >= sinMotivo ? motivoRechazos[i - sinMotivo].value : "";
			// Ocultar la fila
			filas[i].classList.add("ocultar");
			// Actualizar el campo del producto
			let [quedanCampos, statusAprobado] = await fetch(
				ruta + "&campo=" + campoNombres[i] + "&motivo_id=" + motivo
			).then((n) => n.json());
			// Revisar el status
			consecuenciasQC(quedanCampos, statusAprobado);
		});
	}
});
