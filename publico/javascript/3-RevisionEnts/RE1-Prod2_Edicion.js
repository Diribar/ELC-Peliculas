"use strict";
window.addEventListener("load", () => {
	// Variables
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let edicID = new URL(window.location.href).searchParams.get("edicion_id");

	// Opciones
	let aprobar = document.querySelectorAll(".contenido .fa-circle-check");
	let mostrarMotivos = document.querySelectorAll(".contenido .fa-circle-xmark.mostrarMotivos");

	// Motivos para borrar
	let rechazar = document.querySelectorAll(".contenido .rechazar");
	let cartelMotivosRechazo = document.querySelectorAll(".contenido #cartelMotivosRechazo");
	let motivoRechazos = document.querySelectorAll(".contenido #cartelMotivosRechazo select");
	let sinMotivo = rechazar.length - motivoRechazos.length;

	// Bloque Ingresos
	let bloqueIngrs = document.querySelector(".contenido #ingrs");
	let filasIngrs = document.querySelectorAll(".contenido #ingrs .fila");

	// Bloque Reemplazos
	let bloqueReemps = document.querySelector(".contenido #reemps");
	let filasReemps = document.querySelectorAll(".contenido #reemps .fila");

	// Otras variables
	let casos = aprobar.length == rechazar.length ? aprobar.length : 0;
	let filas = document.querySelectorAll(".contenido .fila");
	let campoNombres = document.querySelectorAll(".contenido .campoNombre");
	campoNombres = Array.from(campoNombres).map((n) => n.innerHTML);
	let rutaEdicion =
		"/revision/api/producto-edicion/?entidad=" + entidad + "&id=" + prodID + "&edicion_id=" + edicID;

	// FUNCIONES ----------------------------------------------------------------
	let consecuencias = (quedanCampos, statusAprob) => {
		// Verificar si ocultar algún bloque
		let ingrsOculto = filasIngrs.length ? verificarBloques(filasIngrs, bloqueIngrs) : true;
		let reempsOculto = filasReemps.length ? verificarBloques(filasReemps, bloqueReemps) : true;
		// Averigua si está todo oculto
		let todoOculto = ingrsOculto && reempsOculto;
		// 1. Si hay inconsistencias, recargar la página
		if (todoOculto == quedanCampos) window.location.reload();
		// 2. Acciones si no quedan más campos en la edición
		if (!quedanCampos) cartelFin(statusAprob);
		// Fin
		return;
	};
	let verificarBloques = (filas, bloque) => {
		// Averigua el status
		let ocultarBloque = Array.from(filas)
			.map((n) => n.className)
			.every((n) => n.includes("ocultar"));
		// Ocultar el bloque si corresponde
		if (ocultarBloque) bloque.classList.add("ocultar");
		// Fin
		return ocultarBloque;
	};
	let cartelFin = (statusAprob) => {
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
		if (statusAprob) {
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
			link: "/inactivar-captura/?entidad=" + entidad + "&id=" + prodID + "origen=tableroEnts",
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
	for (let indice = 0; indice < casos; indice++) {
		// Variables
		let indiceMotivo = indice - sinMotivo;
		// Aprobar el nuevo valor
		aprobar[indice].addEventListener("click", async () => {
			// Ocultar la fila
			if (filas.length) filas[indice].classList.add("ocultar");
			// Actualizar el campo del producto
			let ruta = rutaEdicion + "&aprob=true&campo=" + campoNombres[indice];
			let [quedanCampos, statusAprob] = await fetch(ruta).then((n) => n.json());
			// Revisar el status
			consecuencias(quedanCampos, statusAprob);
		});

		// Menú inactivar
		// En EdicDemas, los primeros casos son 'sin motivo', por eso es que recién después de superarlos, se los muestra
		if (indiceMotivo >= 0) {
			mostrarMotivos[indiceMotivo].addEventListener("click", () => {
				cartelMotivosRechazo[indiceMotivo].classList.remove("ocultar");
			});
		}

		// Rechazar el nuevo valor
		rechazar[indice].addEventListener("click", async () => {
			let motivo = indiceMotivo >= 0 ? motivoRechazos[indiceMotivo].value : "";
			// Ocultar la fila
			if (filas.length) filas[indice].classList.add("ocultar");
			// Actualizar el campo del producto
			let ruta = rutaEdicion + "&campo=" + campoNombres[indice] + "&motivo_id=" + motivo
			let [quedanCampos, statusAprob] = await fetch(ruta).then((n) => n.json());
			// Revisar el status
			consecuencias(quedanCampos, statusAprob);
		});
	}
});
