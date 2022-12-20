"use strict";
window.addEventListener("load", () => {
	// Variables
	let v = {
		// Datos del registro
		entidad: new URL(window.location.href).searchParams.get("entidad"),
		entID: new URL(window.location.href).searchParams.get("id"),
		edicID: new URL(window.location.href).searchParams.get("edicion_id"),
		// Motivos para borrar
		aprobar: document.querySelectorAll(".contenido .fa-circle-check"),
		muestraCartelMotivos: document.querySelectorAll(".contenido .fa-circle-xmark.mostrarMotivos"),
		cartelMotivosRechazo: document.querySelectorAll(".contenido #cartelMotivosRechazo"),
		motivoRechazos: document.querySelectorAll(".contenido #cartelMotivosRechazo select"),
		cancelar: document.querySelector("#cartelMotivosRechazo .flechas .fa-circle-left"),
		rechazar: document.querySelectorAll(".contenido .rechazar"),
		tapaElFondo: document.querySelector("#tapar-el-fondo"),
		versionActual: document.querySelector("#versionActual"),
		motivoGenerico_id: "",
		// Bloque Ingresos
		bloqueIngrs: document.querySelector(".contenido #ingrs"),
		filasIngrs: document.querySelectorAll(".contenido #ingrs .fila"),
		// Bloque Reemplazos
		bloqueReemps: document.querySelector(".contenido #reemps"),
		filasReemps: document.querySelectorAll(".contenido #reemps .fila"),
		// Otras variables
		filas: document.querySelectorAll(".contenido .fila"),
		campoNombres: document.querySelectorAll(".contenido .campoNombre"),
		avatarActual: document.querySelector("#derecha img"),
		rutaEdicion: "",
		familia: location.pathname.slice(1),
	};

	// Ruta edición
	(() => {
		v.familia = v.familia.slice(v.familia.indexOf("/") + 1);
		v.familia = v.familia.slice(0, v.familia.indexOf("/"));
		v.rutaEdicion = "/revision/api/" + v.familia + "-edicion-aprob-rech/?entidad=";
		v.rutaEdicion += v.entidad + "&id=" + v.entID + "&edicion_id=" + v.edicID;
	})();

	// Motivos para borrar
	let sinMotivo = v.rechazar.length - v.motivoRechazos.length;
	if (v.versionActual) v.motivoGenerico_id = v.versionActual.innerHTML;

	// Otras variables
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
		let mensajeAvatar = () => {
			// Mensajes
			let arrayMensajes = [
				"Gracias por responder sobre la imagen",
				"A continuación te pedimos que valides otros campos",
			];
			// Flechas
			let icono = {
				HTML: '<i class="fa-solid fa-circle-right" title="Continuar"></i>',
				link: location.href,
			};
			// Fin
			return {arrayMensajes, icono};
		};
		let mensajeFin = () => {
			// Mensajes
			let arrayMensajes = ["Se completó la revisión", "Muchas gracias"];
			// Flechas
			let icono = {
				HTML: '<i class="fa-solid fa-thumbs-up" title="Entendido"></i>',
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
			let error = document.querySelector("#error");
			let gracias = document.querySelector("#gracias");
			let mensajes = document.querySelector("ul#mensajes");
			let flechas = document.querySelector("#cartel #flechasCartel");

			// Formatos
			cartel.style.backgroundColor = "var(--verde-oscuro)";
			error.classList.add("ocultar");
			gracias.classList.remove("ocultar");

			// Cambia el contenido del mensaje y las flechas
			mensajes.innerHTML = "";
			for (let mensaje of arrayMensajes) mensajes.innerHTML += "<li>" + mensaje + "</li>";
			flechas.innerHTML = "";
			flechas.innerHTML += "<a href='" + icono.link + "' autofocus>" + icono.HTML + "</a>";

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
		if (todoProcesado == resultado.quedanCampos) {
			// Publica el cartel de avatar
			if (campo == "avatar") cartel(mensajeAvatar());
			// Mensaje de error
			else console.log(todoProcesado, resultado.quedanCampos);
		}
		// Si está todo procesado, publica el cartel de fin
		else if (todoProcesado) cartel(mensajeFin());
		// Fin
		return;
	};
	let convierteUrlEnArchivo = async () => {
		// Obtiene la ruta
		let rutaConvertirEnArchivo = "/revision/api/producto-guarda-avatar/?entidad=";
		rutaConvertirEnArchivo += v.entidad + "&id=" + v.entID + "&url=";
		// Obtiene el url
		let url = encodeURIComponent(v.avatarActual.src);
		// Gestiona la descarga y obtiene el resultado
		let [resultado, rutaYnombre] = await fetch(rutaConvertirEnArchivo + url).then((n) => n.json());
		// Cambia el 'src' de la imagen
		if (resultado == "OK") v.avatarActual.src = rutaYnombre;
	};

	// LISTENERS --------------------------------------------------------------------
	for (let indice = 0; indice < casos; indice++) {
		// Variables
		let indiceMotivo = indice - sinMotivo;
		let campo = v.campoNombres[indice];

		// Aprobar el nuevo valor
		v.aprobar[indice].addEventListener("click", async () => {
			// Stopper
			if (campo == "avatar") v.tapaElFondo.classList.remove("ocultar");
			// Ocultar la fila
			if (v.filas.length) v.filas[indice].classList.add("ocultar");
			// Actualiza el valor original y obtiene el resultado
			let ruta = v.rutaEdicion + "&aprob=true&campo=" + campo;
			let resultado = await fetch(ruta).then((n) => n.json());
			// Consecuencias
			consecuencias(resultado, campo);
		});

		// En EdicDemas, los primeros casos son 'sin motivo', por eso es que recién después de superarlos, se los muestra
		if (indiceMotivo >= 0) {
			// Muestra cartel de motivos
			v.muestraCartelMotivos[indiceMotivo].addEventListener("click", () => {
				if (campo == "avatar") v.tapaElFondo.classList.remove("ocultar");
				v.cartelMotivosRechazo[indiceMotivo].classList.remove("ocultar");
			});
			// Activa la opción para rechazar
			v.motivoRechazos[indiceMotivo].addEventListener("change", () => {
				if (v.motivoRechazos[indiceMotivo].value) v.rechazar[indice].classList.remove("inactivo");
				else v.rechazar[indice].classList.add("inactivo");
			});
		}

		// Cancelar menú motivos para borrar
		if (campo == "avatar")
			v.cancelar.addEventListener("click", () => {
				v.cartelMotivosRechazo[indiceMotivo].classList.add("ocultar");
				v.tapaElFondo.classList.add("ocultar");
			});

		// Rechaza el nuevo valor
		v.rechazar[indice].addEventListener("click", async () => {
			// Variables
			let motivo_id = indiceMotivo >= 0 ? v.motivoRechazos[indiceMotivo].value : v.motivoGenerico_id;
			// Stopper
			if (!motivo_id) return;
			if (campo == "avatar") v.cartelMotivosRechazo[indiceMotivo].classList.add("ocultar");
			// Oculta la fila
			if (v.filas.length) v.filas[indice].classList.add("ocultar");
			// Si el campo es avatar y la imagen actual es un 'url', lo descarga
			if (campo == "avatar" && v.avatarActual.src.startsWith("http")) convierteUrlEnArchivo();
			// Descarta el valor editado y obtiene el resultado
			let ruta = v.rutaEdicion + "&campo=" + campo + "&motivo_id=" + motivo_id;
			let resultado = await fetch(ruta).then((n) => n.json());
			// Consecuencias
			consecuencias(resultado, campo);
		});
	}
});
