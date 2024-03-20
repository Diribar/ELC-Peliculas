"use strict";
window.addEventListener("load", async () => {
	// Variables
	const id = new URL(location.href).searchParams.get("id");
	let DOM = {
		// Variables generales
		form: document.querySelector("form"),
		botonSubmit: document.querySelector(".iconos button[type='submit']"),
		nombre: document.querySelector("form #sectorNombre #nombre"),

		// Variables de errores
		iconosOK: document.querySelectorAll("form .OK .fa-circle-check"),
		iconosError: document.querySelectorAll("form .OK .fa-circle-xmark"),
		mensajesError: document.querySelectorAll("form .OK .mensajeError"),

		// Primera columna - Fecha
		camposFecha: document.querySelectorAll("form #sectorFecha .input"),
		tipoFecha: document.querySelector("form .input[name='tipoFecha']"),
		mesDia: document.querySelector("form #sectorFecha #mesDia"),
		mes_id: document.querySelector("form .input[name='mes_id']"),
		dia: document.querySelector("form .input[name='dia']"),
		linksClick: document.querySelectorAll("form #sectorFecha .links"),
		diasDeDuracion: document.querySelector("form .input[name='diasDeDuracion']"),
		// Primera columna - Fecha comentarios móvil
		sectorContadorMovil: document.querySelector("form #dataEntry #sectorFecha .caracteres"),
		contadorMovil: document.querySelector("form #dataEntry #sectorFecha .caracteres span"),
		comentarioMovil: document.querySelector("form .input[name='comentarioMovil']"),
		// Primera columna - Fecha comentarios duración
		contadorDuracion: document.querySelector("form #dataEntry #diasDeDuracion .caracteres span"),
		comentarioDuracion: document.querySelector("form .input[name='comentarioDuracion']"),

		// Segunda columna
		// Días del año
		dias_del_ano_Fila: document.querySelectorAll("form #calendario tr"),
		dias_del_ano_Dia: document.querySelectorAll("form #calendario tr td:first-child"),
		dias_del_ano_RCLV: document.querySelectorAll("form #calendario tr td:nth-child(2)"),
		marcoCalendario: document.querySelector("form #calendario"),
		tablaCalendario: document.querySelector("form #calendario table"),
	};
	let varios = {
		// Campos por sector
		camposFecha: Array.from(DOM.camposFecha).map((n) => n.name),

		// Errores
		camposError: Array.from(DOM.iconosError).map((n) => n.parentElement.id),
		OK: {},
		errores: {},

		// Temas de fecha
		meses: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
		fechasDelAno: Array.from(DOM.dias_del_ano_Dia).map((n) => n.innerHTML),

		// Otros
		linksUrl: ["https://es.wikipedia.org/wiki/", "https://www.santopedia.com/buscar?q="],
		avatarInicial: document.querySelector("#imgDerecha #imgAvatar").src,
	};
	let rutas = {validacion: "/rclv/api/valida-sector/?funcion="};

	// -------------------------------------------------------
	// Funciones
	let impactos = {
		fecha: {
			muestraLosDiasDelMes: () => {
				// Aplica cambios en los días 30 y 31
				// Variables
				let dia30 = document.querySelector("select[name='dia'] option[value='30']");
				let dia31 = document.querySelector("select[name='dia'] option[value='31']");
				let mes = DOM.mes_id.value;

				// Revisar para febrero
				if (mes == 2) {
					dia30.classList.add("ocultar");
					dia31.classList.add("ocultar");
					if (DOM.dia.value > 29) DOM.dia.value = "";
				} else {
					// Revisar para los demás meses de 30 días
					dia30.classList.remove("ocultar");
					if (mes == 4 || mes == 6 || mes == 9 || mes == 11) {
						dia31.classList.add("ocultar");
						if (DOM.dia.value > 30) DOM.dia.value = "";
					} else dia31.classList.remove("ocultar");
				}

				// Fin
				return;
			},
			muestraPosiblesRepetidos: async () => {
				// Variables
				let casos = [];

				if (DOM.tipoFecha.value != "SF") {
					// Obtiene los casos con esa fecha
					// 1. Obtiene los parámetros
					let params = "?entidad=epocasDelAno";
					if (id) params += "&id=" + id;
					params += "&mes_id=" + DOM.mes_id.value + "&dia=" + DOM.dia.value;
					// 2. Busca otros casos con esa fecha
					casos = await fetch(rutas.registrosConEsaFecha + params).then((n) => n.json());
				}

				// Si no hay otros casos, mensaje de "No hay otros casos"
				if (!casos.length) {
					DOM.posiblesRepetidos.innerHTML = "¡No hay otros casos!";
					DOM.posiblesRepetidos.classList.add("sinCasos");
				}
				// Si hay otros casos, los muestra
				else {
					DOM.posiblesRepetidos.innerHTML = "";
					DOM.posiblesRepetidos.classList.remove("sinCasos");
					casos.forEach((caso, i) => {
						// Crear el input
						let input = document.createElement("input");
						input.id = "caso" + i;
						input.type = "checkbox";
						input.name = "repetido";
						input.checked = true;
						// Crear la label
						let texto = document.createTextNode(caso);
						let label = document.createElement("label");
						label.appendChild(texto);
						label.htmlFor = "caso" + i;
						// Crear el 'li'
						let li = document.createElement("li");
						li.appendChild(input);
						li.appendChild(label);
						DOM.posiblesRepetidos.appendChild(li);
					});
				}

				// Fin
				return;
			},
			muestraOcultaCamposFecha: () => {
				const tipoFecha = DOM.tipoFecha.value;

				// Sin fecha
				tipoFecha == "SF" ? DOM.mesDia.classList.add("ocultar") : DOM.mesDia.classList.remove("ocultar");

				// Fecha móvil
				if (tipoFecha == "FM") {
					DOM.sectorContadorMovil.classList.remove("ocultar");
					DOM.comentarioMovil.classList.remove("ocultar");
				} else {
					DOM.sectorContadorMovil.classList.add("ocultar");
					DOM.comentarioMovil.classList.add("ocultar");
				}

				// Fin
				return;
			},
			epocasDelAno: (campo) => {
				// Variables
				const dia = DOM.dia.value;
				const mes_id = DOM.mes_id.value;
				const diasDeDuracion = parseInt(DOM.diasDeDuracion.value);

				// Si la información está incompleta/incorrecta, sale de la función
				if (!mes_id || !dia) return;
				if (mes_id < 1 || mes_id > 12) return;
				if (!diasDeDuracion || diasDeDuracion < 2 || diasDeDuracion > 366) return;

				// Obtiene la fecha de inicio
				const mes = varios.meses[mes_id - 1];
				const fechaInicio = dia + "/" + mes;

				// Obtiene los ID de inicio y de fin
				const idInicio = varios.fechasDelAno.indexOf(fechaInicio);
				if (idInicio < 0) return;
				let idFin = idInicio + diasDeDuracion - 1;
				if (idFin > 365) idFin -= 366;

				// Actualiza el color de todos los días del año
				for (let i = 0; i < DOM.dias_del_ano_Fila.length; i++) {
					let ninguno = DOM.dias_del_ano_RCLV[i].innerHTML == "Ninguno";
					let siMismo = DOM.dias_del_ano_RCLV[i].innerHTML == DOM.nombre.innerHTML;
					let color =
						(idInicio < idFin && (i < idInicio || i > idFin)) || (idFin < i && i < idInicio)
							? "white"
							: "var(--" + (ninguno || siMismo ? "verde" : "rojo") + "-claro)";
					DOM.dias_del_ano_Fila[i].style = "background:" + color;
				}

				// Centra el día 'desde'
				if (campo != "diasDeDuracion") {
					const porcentajeCalendario = idInicio / 365;
					const alturaMarco = DOM.marcoCalendario.offsetHeight;
					const alturaCalendario = DOM.tablaCalendario.offsetHeight;
					const traslado = alturaCalendario * porcentajeCalendario - alturaMarco / 2;
					DOM.marcoCalendario.scrollTop = traslado + DOM.dias_del_ano_Fila[0].offsetHeight * 1.5;
				}

				// Fin
				return;
			},
		},
	};
	let validacs = {
		fecha: async () => {
			// Si se conoce la fecha...
			if (DOM.tipoFecha.value != "SF") {
				// Obtiene los datos de los campos
				let params = "&entidad=epocasDelAno";
				for (let campoFecha of DOM.camposFecha) params += "&" + campoFecha.name + "=" + campoFecha.value;

				// Averigua si hay un error con la fecha
				varios.errores.fecha = await fetch(rutas.validacion + "fecha" + params).then((n) => n.json());
			} else varios.errores.fecha = "";

			// OK vigencia
			varios.OK.fecha = !varios.errores.fecha;

			// Fin
			return;
		},
		muestraErroresOK: () => {
			for (let i = 0; i < varios.camposError.length; i++) {
				// Íconos de OK
				varios.OK[varios.camposError[i]]
					? DOM.iconosOK[i].classList.remove("ocultar")
					: DOM.iconosOK[i].classList.add("ocultar");

				// Íconos de error
				varios.errores[varios.camposError[i]]
					? DOM.iconosError[i].classList.remove("ocultar")
					: DOM.iconosError[i].classList.add("ocultar");

				// Mensaje de error
				DOM.mensajesError[i].innerHTML = varios.errores[varios.camposError[i]]
					? varios.errores[varios.camposError[i]]
					: "";
			}
		},
		botonSubmit: () => {
			// Variables
			let resultado = Object.values(varios.OK);
			let resultadosTrue = resultado.length ? resultado.every((n) => !!n) : false;

			// Activa/Inactiva
			resultadosTrue && resultado.length == varios.camposError.length
				? DOM.botonSubmit.classList.remove("inactivo")
				: DOM.botonSubmit.classList.add("inactivo");

			// Fin
			return;
		},
	};
	let startUp = async (forzar) => {
		// Fechas
		impactos.fecha.muestraOcultaCamposFecha(); // El tipo de fecha siempre tiene un valor
		if (DOM.tipoFecha.value && DOM.tipoFecha.value != "SF" && DOM.mes_id.value) impactos.fecha.muestraLosDiasDelMes();
		if (DOM.tipoFecha.value == "SF" || (DOM.mes_id.value && DOM.dia.value) || (forzar && varios.errores.fecha == undefined)) {
			// Valida el sector Fechas
			await validacs.fecha();
			// Si la fecha está OK, revisa los Repetidos
			if (varios.OK.fecha) impactos.fecha.epocasDelAno();
		}

		// Fin
		validacs.muestraErroresOK();
		validacs.botonSubmit();
	};

	// Correcciones mientras se escribe
	DOM.form.addEventListener("input", async (e) => {
		// Validaciones estándar
		amplio.restringeCaracteres(e);

		// Variables
		let campo = e.target.name;

		// Acciones si existe el campo
		if (DOM[campo]) {
			// Variables
			let valor = e.target.value;

			// Acciones si se cambia un texto
			if (campo.startsWith("comentario")) {
				// Variables
				const largoMaximo = campo.startsWith("comentario") ? 70 : false;

				// Quita los caracteres que exceden el largo permitido
				if (largoMaximo && valor.length > largoMaximo) valor = valor.slice(0, largoMaximo);

				// Si se cambia un 'textarea', actualiza el contador
				if (campo == "comentarioMovil") DOM.contadorMovil.innerHTML = largoMaximo - valor.length;
				if (campo == "comentarioDuracion") DOM.contadorDuracion.innerHTML = largoMaximo - valor.length;

				// Limpia el ícono de error/OK
				DOM.mensajesError[0].innerHTML = "";
				DOM.iconosError[0].classList.add("ocultar");
				DOM.iconosOK[0].classList.add("ocultar");

				// Reemplaza el valor del DOM
				const posicCursor = e.target.selectionStart;
				e.target.value = valor;
				e.target.selectionEnd = posicCursor;
			}
		}

		// Fin
		return;
	});
	// Acciones cuando se  confirma el input
	DOM.form.addEventListener("change", async (e) => {
		// Variables
		let campo = e.target.name;

		// Impactos
		if (campo == "diasDeDuracion") e.target.value = Math.max(2, Math.min(e.target.value, 366));
		if (campo == "mes_id") impactos.fecha.muestraLosDiasDelMes();
		if (campo == "tipoFecha") impactos.fecha.muestraOcultaCamposFecha();
		if (campo == "mes_id" || campo == "dia" || campo == "diasDeDuracion") impactos.fecha.epocasDelAno(campo);

		// Valida las fechas
		await validacs.fecha();

		// Final de la rutina
		validacs.muestraErroresOK();
		validacs.botonSubmit();
	});
	// Botón submit
	DOM.botonSubmit.addEventListener("click", async (e) => {
		// Acciones si el botón está inactivo
		if (DOM.botonSubmit.classList.contains("inactivo")) {
			e.preventDefault();
			await startUp(true);
		}
	});

	// Status inicial
	await startUp();
});
