"use strict";
window.addEventListener("load", async () => {
	// Variables
	const entidad = new URL(location.href).searchParams.get("entidad");
	const id = new URL(location.href).searchParams.get("id");
	let DOM = {
		// Variables generales
		form: document.querySelector("form"),
		botonSubmit: document.querySelector(".flechas button[type='submit']"),

		// Variables de errores
		iconosOK: document.querySelectorAll("form .OK .fa-circle-check"),
		iconosError: document.querySelectorAll("form .OK .fa-circle-xmark"),
		mensajesError: document.querySelectorAll("form .OK .mensajeError"),

		// Avatar
		avatarImg: document.querySelector("form #imgDerecha img#imgAvatar"),
		avatarInput: document.querySelector("form #imgDerecha .input[name='avatar']"),
		googleIMG: document.querySelector("form #imgDerecha .agregados a"),

		// Primera columna - Nombre
		camposNombre: document.querySelectorAll("form #sectorNombre .input"),
		nombre: document.querySelector("form .input[name='nombre']"),
		apodo: document.querySelector("form input[name='apodo']"),
		// Primera columna - Fecha
		camposFecha: document.querySelectorAll("form #sectorFecha .input"),
		tipoFecha: document.querySelector("form .input[name='tipoFecha']"),
		mesDia: document.querySelector("form #sectorFecha #mesDia"),
		mes_id: document.querySelector("form .input[name='mes_id']"),
		dia: document.querySelector("form .input[name='dia']"),
		linksClick: document.querySelectorAll("form #sectorFecha .links"),
		dias_de_duracion: document.querySelector("form .input[name='dias_de_duracion']"),
		// Primera columna - Fecha comentarios móvil
		sectorContadorMovil: document.querySelector("form #dataEntry #mesDia .caracteres"),
		contadorMovil: document.querySelector("form #dataEntry #mesDia .caracteres span"),
		comentario_movil: document.querySelector("form .input[name='comentario_movil']"),
		// Primera columna - Fecha comentarios duración
		contadorDuracion: document.querySelector("form #dataEntry #dias_de_duracion .caracteres span"),
		comentario_duracion: document.querySelector("form .input[name='comentario_duracion']"),

		// Segunda columna
		posiblesRepetidos: document.querySelector("form #posiblesRepetidos"),
		sexos_id: document.querySelectorAll("form input[name='sexo_id']"),
		carpeta_avatars: document.querySelector("form .input[name='carpeta_avatars']"),
		prioridad_id: document.querySelector("form .input[name='prioridad_id']"),
		// Días del año
		dias_del_ano_Fila: document.querySelectorAll("form #calendario tr"),
		dias_del_ano_Dia: document.querySelectorAll("form #calendario tr td:first-child"),
		dias_del_ano_RCLV: document.querySelectorAll("form #calendario tr td:nth-child(2)"),
		marcoCalendario: document.querySelector("form #calendario"),
		tablaCalendario: document.querySelector("form #calendario table"),

		// Abajo
		camposEpoca: document.querySelectorAll("form #sectorEpoca .input"),
		epocas_id: document.querySelectorAll("form input[name='epoca_id']"),
		ano: document.querySelector("form input[name='ano']"),
		// Personajes
		camposRCLIC: document.querySelectorAll("form #sectorRCLIC .input"),
		preguntasRCLIC: document.querySelectorAll("form #sectorRCLIC #preguntasRCLIC .input"),
		categorias_id: document.querySelectorAll("form input[name='categoria_id']"),
		rol_iglesia_id: document.querySelector("form select[name='rol_iglesia_id']"),
		opcionesRolIglesia: document.querySelectorAll("form select[name='rol_iglesia_id'] option"),
		canon_id: document.querySelector("form select[name='canon_id']"),
		opcionesProceso: document.querySelectorAll("form select[name='canon_id'] option"),
		sectorApMar: document.querySelector("form #sectorApMar"),
		ap_mar_id: document.querySelector("form select[name='ap_mar_id']"),
		// Hechos
		solo_cfc: document.querySelectorAll("form input[name='solo_cfc']"),
		ama: document.querySelectorAll("form input[name='ama']"),
	};
	let rutas = {
		// Rutas
		validacion: "/rclv/api/valida-sector/?funcion=",
		registrosConEsaFecha: "/rclv/api/registros-con-esa-fecha/",
	};
	let varios = {
		// Variables de entidad
		personajes: entidad == "personajes",
		hechos: entidad == "hechos",
		epocas_del_ano: entidad == "epocas_del_ano",

		// Campos por sector
		camposNombre: Array.from(DOM.camposNombre).map((n) => n.name),
		camposFecha: Array.from(DOM.camposFecha).map((n) => n.name),
		camposEpoca: Array.from(DOM.camposEpoca).map((n) => n.name),
		camposRCLIC: Array.from(DOM.camposRCLIC).map((n) => n.name),

		// Errores
		camposError: Array.from(DOM.iconosError).map((n) => n.parentElement.id),
		OK: {},
		errores: {},

		// Temas de fecha
		meses: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
		dias_del_ano: Array.from(DOM.dias_del_ano_Dia).map((n) => n.innerHTML),

		// Otros
		linksUrl: ["https://es.wikipedia.org/wiki/", "https://www.google.com/search?q="],
		googleIMG: {pre: "//google.com/search?q=", post: "&tbm=isch&tbs=isz:l&hl=es-419"},
		avatarInicial: document.querySelector("#imgDerecha #imgAvatar").src,
		esImagen: "",
		tamano: "",
	};
	if (varios.personajes) varios.prefijos = await fetch("/rclv/api/prefijos").then((n) => n.json());

	// -------------------------------------------------------
	// Funciones
	let impactos = {
		avatar: async () => {
			// Si hubo alguna novedad en el avatar, muestra los resultados
			DOM.iconosOK[0].classList.remove("ocultaAvatar");

			// 1. Acciones si se omitió ingresar un archivo
			if (!DOM.avatarInput.value) {
				// Vuelve a la imagen original
				DOM.avatarImg.src = varios.avatarInicial;

				// Actualiza los errores
				varios.esImagen = "";
				varios.tamano = 0;
				await validacs.avatar();

				// Fin
				validacs.muestraErroresOK();
				validacs.botonSubmit();
				return;
			}
			// 2. Acciones si se ingresó un archivo
			let reader = new FileReader();
			reader.readAsDataURL(DOM.avatarInput.files[0]);
			reader.onload = () => {
				let image = new Image();
				image.src = reader.result;

				// Acciones si es realmente una imagen
				image.onload = async () => {
					// Actualiza la imagen del avatar en la vista
					DOM.avatarImg.src = reader.result;

					// Actualiza los errores
					varios.esImagen = "SI";
					varios.tamano = DOM.avatarInput.files[0].size;
					await validacs.avatar();

					// Fin
					validacs.muestraErroresOK();
					validacs.botonSubmit();
					return;
				};

				// Acciones si no es una imagen
				image.onerror = async () => {
					// Limpia el avatar
					DOM.avatarImg.src = "/imagenes/0-Base/Avatar/Sin-Avatar.jpg";

					// Actualiza los errores
					varios.esImagen = "NO";
					varios.tamano = 0;
					await validacs.avatar();

					// Limpia el input - debe estar después de la validación de errores debido al valor del input
					DOM.avatarInput.value = "";

					// Fin
					validacs.muestraErroresOK();
					validacs.botonSubmit();
					return;
				};
			};
		},
		nombre: {
			logos: () => {
				// Les asigna el url a los 'href'
				if (varios.OK.nombre) {
					DOM.linksClick.forEach((link, i) => (link.href = varios.linksUrl[i] + DOM.nombre.value));
					DOM.googleIMG.href = varios.googleIMG.pre + DOM.nombre.value + varios.googleIMG.post;
				}
				// Les quita el url a los 'href'
				else {
					for (let link of DOM.linksClick) link.href = "";
					DOM.googleIMG.href = "";
				}
				// Fin
				return;
			},
		},
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
					let params = "?entidad=" + entidad;
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
					DOM.comentario_movil.classList.remove("ocultar");
				} else {
					DOM.sectorContadorMovil.classList.add("ocultar");
					DOM.comentario_movil.classList.add("ocultar");
				}

				// Fin
				return;
			},
			epocas_del_ano: (campo) => {
				// Variables
				const dia = DOM.dia.value;
				const mes_id = DOM.mes_id.value;
				const dias_de_duracion = parseInt(DOM.dias_de_duracion.value);

				// Si la información está incompleta/incorrecta, sale de la función
				if (!mes_id || !dia) return;
				if (mes_id < 1 || mes_id > 12) return;
				if (!dias_de_duracion || dias_de_duracion < 2 || dias_de_duracion > 366) return;

				// Obtiene la fecha de inicio
				const mes = varios.meses[mes_id - 1];
				const fechaInicio = dia + "/" + mes;

				// Obtiene los ID de inicio y de fin
				const idInicio = varios.dias_del_ano.indexOf(fechaInicio);
				if (idInicio < 0) return;
				let idFin = idInicio + dias_de_duracion - 1;
				if (idFin > 365) idFin -= 366;

				// Actualiza el color de todos los días del año
				for (let i = 0; i < DOM.dias_del_ano_Fila.length; i++) {
					let ninguno = DOM.dias_del_ano_RCLV[i].innerHTML == "Ninguno";
					let siMismo = DOM.dias_del_ano_RCLV[i].innerHTML == DOM.nombre.value;
					let color =
						(idInicio < idFin && (i < idInicio || i > idFin)) || (idFin < i && i < idInicio)
							? "white"
							: "var(--" + (ninguno || siMismo ? "verde" : "rojo") + "-claro)";
					DOM.dias_del_ano_Fila[i].style = "background:" + color;
				}

				// Centra el día 'desde'
				if (campo != "dias_de_duracion") {
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
		sexo: async () => {
			// Obtiene la opción elegida
			let sexo_id = opcionElegida(DOM.sexos_id);

			// Función para dejar solamente las opciones con ese sexo
			let FN = (select, opciones) => {
				select.innerHTML = "";
				for (let opcion of opciones)
					if (opcion.value.slice(-1) == sexo_id.value || opcion.value <= 2) select.appendChild(opcion);
			};
			// Opciones de 'Rol en la Iglesia'
			FN(DOM.rol_iglesia_id, DOM.opcionesRolIglesia);
			// Opciones de 'Proceso de Canonización'
			FN(DOM.canon_id, DOM.opcionesProceso);

			// Fin
			return;
		},
		epoca: {
			personajes: async () => {
				// Obtiene la opción elegida
				let epoca_id = opcionElegida(DOM.epocas_id);
				// Obtiene el año
				let ano = FN_ano(DOM.ano.value);

				// Si 'pst' y Año > 1100, muestra sectorApMar. Si no, lo oculta
				// Es necesario dejar la condición 'pst', para que oculte  si el usuario cambia
				if (epoca_id.value == "pst" && ano > 1100) DOM.sectorApMar.style.visibility = "inherit";
				else DOM.sectorApMar.style.visibility = "hidden";

				// Fin
				return;
			},
			hechos: async () => {
				// Obtiene la opción elegida
				let epoca_id = opcionElegida(DOM.epocas_id);

				// Obtiene el año
				let ano = FN_ano(DOM.ano.value);

				// Si 'pst' y Año > 1100, muestra sectorApMar. Si no, lo oculta
				// Es necesario dejar la condición 'pst', para que lo oculte si el usuario lo combina con otra opción
				if (epoca_id.value == "pst" && ano > 1100) DOM.sectorApMar.classList.remove("invisible");
				else DOM.sectorApMar.classList.add("invisible");

				// Fin
				return;
			},
		},
	};
	let validacs = {
		avatar: async () => {
			// Variables
			let params = "&avatar=" + encodeURIComponent(DOM.avatarInput.value);
			params += "&opcional=SI";
			params += "&esImagen=" + varios.esImagen;
			params += "&tamano=" + varios.tamano;

			// Averigua los errores
			varios.errores.avatar = await fetch(rutas.validacion + "avatar" + params).then((n) => n.json());
			varios.OK.avatar = !varios.errores.avatar;

			// Fin
			return;
		},
		nombre: {
			personajes: async () => {
				// Variables
				let params = "&nombre=" + encodeURIComponent(DOM.nombre.value);
				params += "&apodo=" + encodeURIComponent(DOM.apodo.value);
				params += "&entidad=" + entidad;
				if (id) params += "&id=" + id;

				// Averigua los errores
				varios.errores.nombre = await fetch(rutas.validacion + "nombre" + params).then((n) => n.json());
				varios.OK.nombre = !varios.errores.nombre;
				// Fin
				return;
			},
			demas: async () => {
				// Variables
				let params = "&nombre=" + encodeURIComponent(DOM.nombre.value);
				params += "&entidad=" + entidad;
				if (id) params += "&id=" + id;

				// Lo agrega lo referido a la aparición mariana
				if (varios.hechos) {
					let solo_cfc = opcionElegida(DOM.solo_cfc);
					let epoca_id = opcionElegida(DOM.epocas_id);
					let ano = FN_ano(DOM.ano.value);
					let ama = opcionElegida(DOM.ama).value;
					if (solo_cfc.value == 1 && epoca_id.value == "pst" && ano > 1100 && ama == 1) params += "&ama=1";
				}

				// Averigua los errores
				varios.errores.nombre = await fetch(rutas.validacion + "nombre" + params).then((n) => n.json());
				varios.OK.nombre = !varios.errores.nombre;

				// Fin
				return;
			},
		},
		fecha: async () => {
			// Si se conoce la fecha...
			if (DOM.tipoFecha.value != "SF") {
				// Obtiene los datos de los campos
				let params = "&entidad=" + entidad;
				for (let campoFecha of DOM.camposFecha) params += "&" + campoFecha.name + "=" + campoFecha.value;

				// Averigua si hay un error con la fecha
				varios.errores.fecha = await fetch(rutas.validacion + "fecha" + params).then((n) => n.json());
			} else varios.errores.fecha = "";

			// OK vigencia
			varios.OK.fecha = !varios.errores.fecha;

			// Fin
			return;
		},
		repetido: () => {
			// Variables
			let casos = document.querySelectorAll("#posiblesRepetidos li input");
			let cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";

			// Errores y OK
			varios.errores.repetidos = casos && Array.from(casos).some((n) => n.checked) ? cartelDuplicado : "";
			varios.OK.repetidos = !varios.errores.repetidos;

			// Fin
			return;
		},
		sexo: async () => {
			// Obtiene la opción elegida
			let sexo_id = opcionElegida(DOM.sexos_id);

			// Genera la variable de parámetros
			let params = "sexo&sexo_id=" + sexo_id.value;

			// OK y Errores
			varios.errores.sexo_id = await fetch(rutas.validacion + params).then((n) => n.json());
			varios.OK.sexo_id = !varios.errores.sexo_id;

			// Fin
			return;
		},
		carpetaAvatars: async () => {
			// Variables
			let params = "carpeta_avatars";

			// Agrega los demás parámetros
			params += "&carpeta_avatars=" + DOM.carpeta_avatars.value;

			// OK y Errores
			varios.errores.carpeta_avatars = await fetch(rutas.validacion + params).then((n) => n.json());
			varios.OK.carpeta_avatars = !varios.errores.carpeta_avatars;

			// Fin
			return;
		},
		prioridad: async () => {
			// Variables
			let params = "prioridad";
			params += "&prioridad_id=" + DOM.prioridad_id.value;

			// OK y Errores
			varios.errores.prioridad_id = await fetch(rutas.validacion + params).then((n) => n.json());
			varios.OK.prioridad_id = !varios.errores.prioridad_id;

			// Fin
			return;
		},
		epoca: async () => {
			// Variables
			let params = "epoca&entidad=" + entidad;

			// Agrega los demás parámetros
			let epoca_id = opcionElegida(DOM.epocas_id);
			params += "&epoca_id=" + epoca_id.value;
			if (epoca_id.value == "pst") params += "&ano=" + FN_ano(DOM.ano.value);

			// OK y Errores
			varios.errores.epoca = await fetch(rutas.validacion + params).then((n) => n.json());
			varios.OK.epoca = !varios.errores.epoca;

			// Fin
			return;
		},
		RCLIC: {
			personajes: async () => {
				// Variables
				let params = "RCLIC_personajes";
				let sexo_id;

				// Obtiene la categoría
				let categoria_id = opcionElegida(DOM.categorias_id);
				params += "&categoria_id=" + categoria_id.value;

				if (categoria_id.value == "CFC") {
					// Obtiene el sexo_id
					if (categoria_id) sexo_id = opcionElegida(DOM.sexos_id);
					params += "&sexo_id=" + (sexo_id.value ? "on" : "");

					// Obtiene los valores de los preguntasRCLIC
					if (sexo_id.value) {
						// Agrega los datos de CFC
						for (let campo of DOM.preguntasRCLIC) if (campo.value) params += "&" + campo.name + "=" + campo.value;
						// Agrega los datos de epoca_id y año
						let epoca_id = opcionElegida(DOM.epocas_id);
						params += "&epoca_id=" + epoca_id.value;
						let ano = FN_ano(DOM.ano.value);
						if (epoca_id.value == "pst") {
							// Agrega el año
							params += "&ano=" + ano;
							// Agrega lo referido a la aparición mariana
							if (ano > 1100) params += "&ap_mar_id=" + opcionElegida(DOM.ap_mar_id).value;
						}
					}
				}

				// OK y Errores
				varios.errores.RCLIC = await fetch(rutas.validacion + params).then((n) => n.json());
				varios.OK.RCLIC = !varios.errores.RCLIC;

				// Fin
				return;
			},
			hechos: async () => {
				// Variables
				let params = "RCLIC_hechos";

				// Obtiene el 'solo_cfc'
				let solo_cfc = opcionElegida(DOM.solo_cfc);
				params += "&solo_cfc=" + solo_cfc.value;

				if (solo_cfc.value == 1) {
					// Agrega los datos de epoca_id y año
					let epoca_id = opcionElegida(DOM.epocas_id);
					params += "&epoca_id=" + epoca_id.value;

					if (epoca_id.value == "pst") {
						let ano = FN_ano(DOM.ano.value);
						// Agrega el año
						params += "&ano=" + ano;
						// Agrega lo referido a la aparición mariana
						if (ano > 1100) params += "&ama=" + opcionElegida(DOM.ama).value;
					}
				}

				// OK y Errores
				varios.errores.RCLIC = await fetch(rutas.validacion + params).then((n) => n.json());
				varios.OK.RCLIC = !varios.errores.RCLIC;

				// Fin
				return;
			},
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
		// Avatar
		varios.errores.avatar = varios.errores.avatar ? varios.errores.avatar : false;
		varios.OK.avatar = !varios.errores.avatar;
		if (forzar) DOM.iconosOK[0].classList.remove("ocultaAvatar");

		// Nombre
		if (DOM.nombre.value || (forzar && varios.errores.nombre == undefined))
			varios.personajes ? await validacs.nombre.personajes() : await validacs.nombre.demas();
		if (DOM.nombre.value && varios.OK.nombre) impactos.nombre.logos();

		// Fechas
		impactos.fecha.muestraOcultaCamposFecha(); // El tipo de fecha siempre tiene un valor
		if (DOM.tipoFecha.value && DOM.tipoFecha.value != "SF" && DOM.mes_id.value) impactos.fecha.muestraLosDiasDelMes();
		if (DOM.tipoFecha.value == "SF" || (DOM.mes_id.value && DOM.dia.value) || (forzar && varios.errores.fecha == undefined)) {
			// Valida el sector Fechas
			await validacs.fecha();
			// Si la fecha está OK, revisa los Repetidos
			if (varios.OK.fecha)
				if (entidad != "epocas_del_ano") {
					await impactos.fecha.muestraPosiblesRepetidos();
					validacs.repetido();
				} else impactos.fecha.epocas_del_ano();
		}

		// Sexo
		if (DOM.sexos_id.length) {
			if (opcionElegida(DOM.sexos_id).value) await impactos.sexo();
			if (opcionElegida(DOM.sexos_id).value || (forzar && varios.errores.sexo_id == undefined)) await validacs.sexo();
		}

		// Carpeta Avatars
		if (DOM.carpeta_avatars && (DOM.carpeta_avatars.value || (forzar && varios.errores.carpeta_avatars == undefined)))
			await validacs.carpetaAvatars();

		// Prioridad
		if (DOM.prioridad_id && (DOM.prioridad_id.value || (forzar && varios.errores.prioridad_id == undefined)))
			await validacs.prioridad();

		// Época
		if (DOM.epocas_id.length) {
			if (opcionElegida(DOM.epocas_id).value) await impactos.epoca[entidad]();
			if (opcionElegida(DOM.epocas_id).value || (forzar && varios.errores.epoca == undefined)) await validacs.epoca();
		}

		// RCLIC
		if (
			(varios.personajes && opcionElegida(DOM.categorias_id).value) ||
			(varios.hechos && opcionElegida(DOM.solo_cfc).value) ||
			(forzar && (varios.personajes || varios.hechos) && varios.errores.RCLIC == undefined)
		)
			await validacs.RCLIC[entidad]();

		// Fin
		validacs.muestraErroresOK();
		validacs.botonSubmit();
	};

	// Correcciones mientras se escribe
	DOM.form.addEventListener("input", async (e) => {
		// Validaciones estándar
		input(e);

		// Variables
		let campo = e.target.name;

		// Acciones si existe el campo
		if (DOM[campo]) {
			// Variables
			let valor = e.target.value;

			// Acciones si se cambia un texto
			if (campo == "nombre" || campo == "apodo" || campo.startsWith("comentario")) {
				// Variables
				const largoMaximo = campo == "nombre" || campo == "apodo" ? 35 : campo.startsWith("comentario") ? 70 : false;

				// Si se cambia el nombre, quita el prefijo 'San'
				if (campo == "nombre" && varios.personajes)
					for (let prefijo of varios.prefijos)
						if (valor.startsWith(prefijo + " ")) {
							valor = valor.slice(prefijo.length + 1);
							break;
						}

				// Quita los caracteres que exceden el largo permitido
				if (largoMaximo && valor.length > largoMaximo) valor = valor.slice(0, largoMaximo);

				// Si se cambia un 'textarea', actualiza el contador
				if (campo == "comentario_movil") DOM.contadorMovil.innerHTML = largoMaximo - valor.length;
				if (campo == "comentario_duracion") DOM.contadorDuracion.innerHTML = largoMaximo - valor.length;

				// Limpia el ícono de error/OK
				const indice = campo.startsWith("comentario") ? 2 : 1; // 2 para fecha, 1 para nombre
				DOM.mensajesError[indice].innerHTML = "";
				DOM.iconosError[indice].classList.add("ocultar");
				DOM.iconosOK[indice].classList.add("ocultar");
			}

			// Acciones si se cambia el año
			if (campo == "ano") {
				// Sólo números en el año
				valor = valor.replace(/[^\d]/g, "");

				// Menor o igual que el año actual
				if (valor) {
					let anoIngresado = parseInt(valor);
					let anoActual = new Date().getFullYear();
					valor = Math.min(anoIngresado, anoActual);
				}

				// Limpia el ícono de error/OK
				const indice = varios.camposError.indexOf("epoca");
				DOM.mensajesError[indice].innerHTML = "";
				DOM.iconosError[indice].classList.add("ocultar");
				DOM.iconosOK[indice].classList.add("ocultar");
			}

			// Reemplaza el valor del DOM
			const posicCursor = e.target.selectionStart;
			e.target.value = valor;
			e.target.selectionEnd = posicCursor;
		}

		// Fin
		return;
	});
	// Acciones cuando se  confirma el input
	DOM.form.addEventListener("change", async (e) => {
		// Variables
		let campo = e.target.name;

		// Acciones si se cambia el avatar
		if (campo == "avatar") {
			await impactos.avatar();
			return;
		}

		// Acciones si se cambia el sector Nombre
		if (varios.camposNombre.includes(campo)) {
			await validacs.nombre[varios.personajes ? "personajes" : "demas"]();
			impactos.nombre.logos();
		}

		// Acciones si se cambia el sector Fecha
		if (varios.camposFecha.includes(campo)) {
			// Impactos
			if (campo == "dias_de_duracion") e.target.value = Math.max(2, Math.min(e.target.value, 366));
			if (campo == "mes_id") impactos.fecha.muestraLosDiasDelMes();
			if (campo == "tipoFecha") impactos.fecha.muestraOcultaCamposFecha();
			if (varios.epocas_del_ano && (campo == "mes_id" || campo == "dia" || campo == "dias_de_duracion"))
				impactos.fecha.epocas_del_ano(campo);

			// Valida las fechas
			await validacs.fecha();

			// Impactos en repetidos
			if (varios.OK.fecha) {
				await impactos.fecha.muestraPosiblesRepetidos();
				validacs.repetido();
			}
		}

		// Acciones si se cambia el sector Repetido
		if (campo == "repetido") validacs.repetido();

		// Acciones si se cambia el sector Sexo
		if (campo == "sexo_id") {
			await impactos.sexo();
			await validacs.sexo();
			// Si corresponde, valida RCLIC
			if (varios.OK.sexo_id && opcionElegida(DOM.categorias_id).value == "CFC") await validacs.RCLIC.personajes();
		}

		// Acciones si se cambia el sector Carpeta Avatars
		if (campo == "carpeta_avatars") await validacs.carpetaAvatars();

		// Acciones si se cambia el sector Prioridad
		if (campo == "prioridad_id") await validacs.prioridad();

		// Acciones si se cambia el sector Época
		if (varios.camposEpoca.includes(campo)) {
			// Impacto y Validaciones
			await impactos.epoca[entidad]();
			await validacs.epoca();
			// Si se eligió el checkbox "pst", pone el cursor en 'Año'
			if (e.target.value == "pst") DOM.ano.focus();
			// Si corresponde, valida RCLIC
			if (varios.OK.epoca) {
				if (varios.personajes && opcionElegida(DOM.categorias_id).value == "CFC") await validacs.RCLIC.personajes();
				if (varios.hechos && opcionElegida(DOM.solo_cfc).value == 1) await validacs.RCLIC.hechos();
			}
		}

		// Acciones si se cambia el sector RCLIC
		if (varios.camposRCLIC.includes(campo)) {
			// Nota: sus impactos se resuelven con CSS
			await validacs.RCLIC[entidad]();
			if (varios.hechos) await validacs.nombre.demas();
		}

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
	DOM.iconosOK[0].classList.add("ocultaAvatar");
	await startUp();
});

// Funciones
let opcionElegida = (opciones) => {
	// Detecta la opción elegida
	for (var opcion of opciones) if (opcion.checked) break;
	if (!opcion.checked) opcion = {value: "", name: ""};

	// Fin
	return opcion;
};
let FN_ano = (ano) => {
	// Si está vacío, lo considera cero
	ano = ano ? parseInt(ano) : 0;
	// Envía el valor
	return ano;
};
