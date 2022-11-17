"use strict";
window.addEventListener("load", () => {
	// Variables
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let edicID = new URL(window.location.href).searchParams.get("edicion_id");
	let aprobar = document.querySelectorAll(".contenido .fa-circle-check");
	let rutaEdicion = "/revision/api/producto-edicion-aprob-rech/?entidad=";
	rutaEdicion += entidad + "&id=" + prodID + "&edicion_id=" + edicID;

	// Motivos para borrar
	let muestraCartelMotivos = document.querySelectorAll(".contenido .fa-circle-xmark.mostrarMotivos");
	let cartelMotivosRechazo = document.querySelectorAll(".contenido #cartelMotivosRechazo");
	let motivoRechazos = document.querySelectorAll(".contenido #cartelMotivosRechazo select");
	let cancelar = document.querySelector("#comandosRechazar .fa-circle-left");
	let rechazar = document.querySelectorAll(".contenido .rechazar");
	let sinMotivo = rechazar.length - motivoRechazos.length;
	let tapaElFondo = document.querySelector("#tapar-el-fondo");

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
	let avatarActual = document.querySelector("#derecha img");

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
				filasIngrs.length &&
				!bloqueIngrs.className.includes("ocultar") &&
				todasLasFilasOcultas(filasIngrs)
			)
				bloqueIngrs.classList.add("ocultar");
			// Oculta bloque de Reemplazos

			if (
				filasReemps.length &&
				!bloqueReemps.className.includes("ocultar") &&
				todasLasFilasOcultas(filasReemps)
			)
				bloqueReemps.classList.add("ocultar");
			// Fin
			return;
		};
		let FN_todoProcesado = () => {
			// Averigua cada bloque
			let bloqueIngrsOculto = !bloqueIngrs || bloqueIngrs.className.includes("ocultar");
			let bloqueReempsOculto = !bloqueReemps || bloqueReemps.className.includes("ocultar");
			// Averigua si está todo oculto
			return bloqueIngrsOculto && bloqueReempsOculto;
		};
		let mensajeAvatar = () => {
			// Mensajes
			let arrayMensajes = ["Gracias por responder sobre la imagen"];
			// Flechas
			let icono = {
				HTML: '<i class="fa-solid fa-thumbs-up" title="Entendido"></i>',
				link: location.href,
			};
			// Fin
			return arrayMensajes, icono;
		};
		let mensajeFin = () => {
			// Mensajes
			let arrayMensajes = ["Gracias por completar la revisión."];
			// Flechas
			let icono = {
				HTML: '<i class="fa-solid fa-thumbs-up" title="Entendido"></i>',
				link: "/inactivar-captura/?entidad=" + entidad + "&id=" + prodID + "origen=tableroEnts",
			};
			// Fin
			return arrayMensajes, icono;
		};
		let cartel = (arrayMensajes, icono) => {
			// Partes del cartel
			let cartel = document.querySelector("#cartel");
			let error = document.querySelector("#error");
			let mensajes = document.querySelector("ul#mensajes");
			let flechas = document.querySelector("#cartel #flechasCartel");

			// Formatos
			cartel.style.backgroundColor = "var(--verde-oscuro)";
			error.classList.add("ocultar");

			// Cambia el contenido del mensaje y las flechas
			mensajes.innerHTML = "";
			for (let mensaje of arrayMensajes) mensajes.innerHTML += "<li>" + mensaje + "</li>";
			flechas.innerHTML = "";
			flechas.innerHTML += "<a href='" + icono.link + "' autofocus>" + icono.HTML + "</a>";

			// Mostrar el cartel
			tapaElFondo.classList.remove("ocultar");
			cartel.classList.remove("ocultar");

			// Fin
			return;
		};

		// Interrumpe si los resultados fueron insatisfactorios
		if (!resultados.OK) return;
		// Verifica si debe ocultar algún bloque
		if (bloqueIngrs || bloqueReemps) ocultaBloques();
		// Averigua si está todo procesado
		let todoProcesado = FN_todoProcesado();
		// Si está todo procesado y quedan campos, 
		if (todoProcesado == resultado.quedanCampos) {
			// Publica el cartl de avatar
			if (campo == "avatar") cartel(mensajeAvatar());
			// Recarga la vista
			else location.reload();
		} 
		// Si está todo procesado, publica el cartel de fin
		else if (todoProcesado) cartel(mensajeFin());
		// Fin
		return;
	};
	let convierteUrlEnArchivo = async () => {
		// Obtiene la ruta
		let rutaConvertirEnArchivo = "/revision/api/producto-guarda-avatar/?entidad=";
		rutaConvertirEnArchivo += entidad + "&id=" + prodID + "&url=";
		// Obtiene el url
		let url = encodeURIComponent(avatarActual.src);
		// Gestiona la descarga y obtiene el resultado
		let [resultado, rutaYnombre] = await fetch(rutaConvertirEnArchivo + url).then((n) => n.json());
		// Cambia el 'src' de la imagen
		if (resultado == "OK") avatarActual.src = rutaYnombre;
	};

	// LISTENERS --------------------------------------------------------------------
	for (let indice = 0; indice < casos; indice++) {
		// Variables
		let indiceMotivo = indice - sinMotivo;
		let campo = campoNombres[indice];

		// Aprobar el nuevo valor
		aprobar[indice].addEventListener("click", async () => {
			// Stopper
			if (campo == "avatar") tapaElFondo.classList.remove("ocultar");
			// Ocultar la fila
			if (filas.length) filas[indice].classList.add("ocultar");
			// Actualiza el valor original y obtiene el resultado
			let ruta = rutaEdicion + "&aprob=true&campo=" + campo;
			let resultado = await fetch(ruta).then((n) => n.json());
			// Consecuencias
			consecuencias(resultado, campo);
		});

		// En EdicDemas, los primeros casos son 'sin motivo', por eso es que recién después de superarlos, se los muestra
		if (indiceMotivo >= 0) {
			// Muestra cartel de motivos
			muestraCartelMotivos[indiceMotivo].addEventListener("click", () => {
				if (campo == "avatar") tapaElFondo.classList.remove("ocultar");
				cartelMotivosRechazo[indiceMotivo].classList.remove("ocultar");
			});
			// Activa la opción para rechazar
			motivoRechazos[indiceMotivo].addEventListener("change", () => {
				if (motivoRechazos[indiceMotivo].value) rechazar[indice].classList.remove("inactivo");
				else rechazar[indice].classList.add("inactivo");
			});
		}

		// Cancelar menú motivos para borrar
		if (campo == "avatar")
			cancelar.addEventListener("click", () => {
				cartelMotivosRechazo[indiceMotivo].classList.add("ocultar");
				tapaElFondo.classList.add("ocultar");
			});

		// Rechaza el nuevo valor
		rechazar[indice].addEventListener("click", async () => {
			// Variables
			let motivo = indiceMotivo >= 0 ? motivoRechazos[indiceMotivo].value : "";
			// Stopper
			if (!motivo) return;
			if (campo == "avatar") cartelMotivosRechazo[indiceMotivo].classList.add("ocultar");
			// Oculta la fila
			if (filas.length) filas[indice].classList.add("ocultar");
			// Si el campo es avatar y la imagen actual es un 'url', lo descarga
			if (campo == "avatar" && avatarActual.src.startsWith("http")) convierteUrlEnArchivo();
			// Descarta el valor editado y obtiene el resultado
			let ruta = rutaEdicion + "&campo=" + campo + "&motivo_id=" + motivo;
			let resultado = await fetch(ruta).then((n) => n.json());
			// Consecuencias
			consecuencias(resultado, campo);
		});
	}
});
