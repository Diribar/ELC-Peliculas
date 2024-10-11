"use strict";
window.addEventListener("load", async () => {
	// Campos en común
	let DOM = {
		// Variables generales
		form: document.querySelector("form"),
		botonSubmit: document.querySelector(".iconos button[type=submit]"),

		// Variables de errores
		iconosOK: document.querySelectorAll("form .OK .fa-circle-check"),
		iconosError: document.querySelectorAll("form .OK .fa-circle-xmark"),
		mensajesError: document.querySelectorAll("form .OK .mensajeError"),

		// Avatar
		imgAvatar: document.querySelector("form #imgDerecha img#imgAvatar"),
		inputAvatar: document.querySelector("form #imgDerecha .input[name=avatar]"),
		googleIMG: document.querySelector("form #imgDerecha .agregados a"),

		// Primera columna - Nombre
		camposNombre: document.querySelectorAll("form #sectorNombre .input"),
		nombre: document.querySelector("form .input[name=nombre]"),
		nombreAltern: document.querySelector("form input[name=nombreAltern]"),

		// Primera columna - Fecha
		camposFecha: document.querySelectorAll("form #sectorFecha .input"),
		tipoFecha: document.querySelector("form .input[name=tipoFecha]"),
		mesDia: document.querySelector("form #sectorFecha #mesDia"),
		mes_id: document.querySelector("form .input[name=mes_id]"),
		dia: document.querySelector("form .input[name=dia]"),
		anoFM: document.querySelector("form .input[name=anoFM]"),
		linksClick: document.querySelectorAll("form #sectorFecha .links"),
		diasDeDuracion: document.querySelector("form .input[name=diasDeDuracion]"),

		// Primera columna - Fecha comentarios móvil
		sectorContadorMovil: document.querySelector("form #dataEntry #sectorFecha .caracteres"),
		contadorMovil: document.querySelector("form #dataEntry #sectorFecha .caracteres span"),
		comentarioMovil: document.querySelector("form .input[name=comentarioMovil]"),

		// Primera columna - Fecha comentarios duración
		contadorDuracion: document.querySelector("form #dataEntry #diasDeDuracion .caracteres span"),
		comentarioDuracion: document.querySelector("form .input[name=comentarioDuracion]"),

		// Segunda columna
		posiblesRepetidos: document.querySelector("form #posiblesRepetidos"),
		generos_id: document.querySelectorAll("form input[name=genero_id]"),
		plural_id: document.querySelector("form input[name=plural_id]"),
		carpetaAvatars: document.querySelector("form .input[name=carpetaAvatars]"),
		prioridad_id: document.querySelector("form .input[name=prioridad_id]"),
	};
	// Época de ocurrencia
	DOM = {
		...DOM,
		camposEpoca: document.querySelectorAll("form #sectorEpoca .input"),
		epocasOcurrencia_id: document.querySelectorAll("form input[name=epocaOcurrencia_id]"),
		ano: document.querySelector("form input[name=" + ano + "]"),
	};
	// Sector Leyenda
	DOM = {
		...DOM,

		// hoyEstamos_id
		hoyEstamos_id: document.querySelector("form select.input[name=hoyEstamos_id]"),
		hoyEstamos_idDefault: document.querySelector("form select.input[name=hoyEstamos_id] option"),

		// leyNombre
		leyNombre: document.querySelector("form select.input[name=leyNombre]"),
		leyNombreDefault: document.querySelector("form select.input[name=leyNombre] option"),
		leyNombreFijo: document.querySelector("form #leyNombre:not(:has(select))"),
	};
	v = {
		// Campos por sector
		camposNombre: Array.from(DOM.camposNombre).map((n) => n.name),
		camposFecha: Array.from(DOM.camposFecha).map((n) => n.name),
		camposEpoca: Array.from(DOM.camposEpoca).map((n) => n.name),

		// Otros
		camposError: Array.from(DOM.iconosError).map((n) => n.parentElement.id),
		avatarInicial: document.querySelector("#imgDerecha #imgAvatar").src,
		...(await fetch(rutas.obtieneVariables).then((n) => n.json())),
	};
	v.hoyEstamos = v.hoyEstamos.filter((n) => !n.entidad || n.entidad == entidad);

	// Por entidad
	if (personajes || hechos) {
		// sectorRCLIC
		DOM = {
			...DOM,
			inputsRCLIC: document.querySelectorAll("form #sectorRCLIC .input"),
			categorias_id: document.querySelectorAll("form #sectorRCLIC input[name=categoria_id]"),
			soloCfc: document.querySelectorAll("form #sectorRCLIC input[name=soloCfc]"), // equivalente a 'categorias_id'
			cfc: document.querySelector("form #sectorRCLIC .input#cfc"),
			preguntasRCLIC: document.querySelector("form #sectorRCLIC #preguntasRCLIC"),
		};
		// preguntasRCLIC
		DOM = {
			...DOM,
			preguntasInputs: DOM.preguntasRCLIC.querySelectorAll(".input"),
			ama: DOM.preguntasRCLIC.querySelectorAll("input[name=ama]"), // equivalente a 'preguntasInputs'

			// Sector Rol en la Iglesia
			sectorRolIgl: DOM.preguntasRCLIC.querySelector("#sectorRolIgl"),
			rolIglesia_id: DOM.preguntasRCLIC.querySelector("#sectorRolIgl select[name=rolIglesia_id]"),
			rolIglesiaDefault: DOM.preguntasRCLIC.querySelector("#sectorRolIgl select[name=rolIglesia_id] option"),

			// Sector Proceso de Canonización
			sectorCanon: DOM.preguntasRCLIC.querySelector("#sectorCanon"),
			canon_id: DOM.preguntasRCLIC.querySelector("#sectorCanon select[name=canon_id]"),
			canonDefault: DOM.preguntasRCLIC.querySelector("#sectorCanon select[name=canon_id] option"),

			// Sector Aparición Mariana
			sectorApMar: DOM.preguntasRCLIC.querySelector("#sectorApMar"),
			apMar_id: DOM.preguntasRCLIC.querySelector("#sectorApMar select[name=apMar_id]"),
		};
		// Variables compartidas
		v.camposRCLIC = Array.from(DOM.inputsRCLIC).map((n) => n.name);

		// Variables para personajes
		if (personajes) v.prefijos = await fetch(prefijos).then((n) => n.json());
	}
	if (epocasDelAno) {
		DOM.dias_del_ano_Fila = document.querySelectorAll("form #calendario tr");
		DOM.dias_del_ano_Dia = document.querySelectorAll("form #calendario tr td:first-child");
		DOM.dias_del_ano_RCLV = document.querySelectorAll("form #calendario tr td:nth-child(2)");
		DOM.marcoCalendario = document.querySelector("form #calendario");
		DOM.tablaCalendario = document.querySelector("form #calendario table");
		v.fechasDelAno = Array.from(DOM.dias_del_ano_Dia).map((n) => n.innerHTML);
	}

	// Funciones
	let FN = {
		impactos: {
			nombre: {
				logos: () => {
					// Les asigna el url a los 'href'
					if (OK.nombre) {
						DOM.linksClick.forEach((link, i) => (link.href = linksUrl[i] + DOM.nombre.value));
						DOM.googleIMG.href = googleIMG.pre + DOM.nombre.value + googleIMG.post;
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
					const mes = DOM.mes_id.value;
					const dia30 = document.querySelector("select[name=dia] option[value='30']");
					const dia31 = document.querySelector("select[name=dia] option[value='31']");

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
					// Si no existe el sector, interrumpe la función
					if (!DOM.posiblesRepetidos) return;

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
						DOM.anoFM.classList.remove("ocultar");
						DOM.sectorContadorMovil.classList.remove("ocultar");
						DOM.comentarioMovil.classList.remove("ocultar");
					} else {
						DOM.anoFM.classList.add("ocultar");
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
					const mes = v.meses[mes_id - 1];
					const fechaInicio = dia + "/" + mes;

					// Obtiene los ID de inicio y de fin
					const idInicio = v.fechasDelAno.indexOf(fechaInicio);
					if (idInicio < 0) return;
					let idFin = idInicio + diasDeDuracion - 1; // resta uno para contar bien
					if (idFin > 365) idFin -= 366;

					// Actualiza el color de todos los días del año
					for (let i = 0; i < DOM.dias_del_ano_Fila.length; i++) {
						let ninguno = DOM.dias_del_ano_RCLV[i].innerHTML == "Ninguno";
						let siMismo = DOM.dias_del_ano_RCLV[i].innerHTML == DOM.nombre.value;
						let color =
							(idInicio < idFin && (i < idInicio || i > idFin)) || // el evento ocurre todo en el mismo año, e 'i' está fuera del rango
							(idFin < i && i < idInicio) // ocurre en más de un año, e 'i' está fuera del rango
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
			genero: {
				consolidado: async function () {
					// Obtiene el genero_id
					v.genero_id = opcElegida(DOM.generos_id);
					if (v.genero_id == "MF") DOM.plural_id.checked = true; // si se eligieron ambos, se active 'plural'
					if (v.genero_id) v.genero_id += DOM.plural_id.checked ? "P" : "S";
					else DOM.plural_id.checked = false;

					// Impactos en campos RCLIC exclusivos de personajes
					if (personajes) {
						// Opciones de 'Rol en la Iglesia'
						if (v.genero_id) this.opcsVisibles(DOM.rolIglesia_id, v.rolesIglesia, DOM.rolIglesiaDefault);

						// Opciones de 'Proceso de Canonización'
						if (v.genero_id) this.opcsVisibles(DOM.canon_id, v.canons, DOM.canonDefault);

						// Impacto por la combinación de cfc y género
						FN.impactos.cfcGenero();
					}

					// Impactos en 'hoyEstamos'
					await FN.impactos.enLeyenda("hoyEstamos_id");

					// Fin
					return;
				},
				opcsVisibles: (select, opciones, opcionDefault) => {
					// Limpia el select
					const selectedValue_id = select.value;
					select.innerHTML = "";
					select.appendChild(opcionDefault);

					// Agrega las opciones válidas para el género
					for (let opcion of opciones)
						if (opcion[v.genero_id]) {
							// Crea la opción
							const option = document.createElement("option");
							option.value = opcion.id;
							option.selected = opcion.id == selectedValue_id;
							option.innerText = opcion[v.genero_id];

							// Agrega la opción
							select.appendChild(option);
						}

					// Fin
					return;
				},
			},
			epocaOcurrencia: {
				personajes: async () => {
					// Obtiene la opción elegida
					let epocaOcurrencia_id = opcElegida(DOM.epocasOcurrencia_id);
					// Obtiene el año
					let ano = FN_ano(DOM.ano.value);

					// Si 'pst' y Año > 1100, muestra sectorApMar. Si no, lo oculta
					// Es necesario dejar la condición 'pst', para que oculte  si el usuario cambia
					if (epocaOcurrencia_id == "pst" && ano > 1100) DOM.sectorApMar.classList.remove("invisible");
					else DOM.sectorApMar.classList.add("invisible");

					// Fin
					return;
				},
				hechos: async () => {
					// Obtiene la opción elegida
					let epocaOcurrencia_id = opcElegida(DOM.epocasOcurrencia_id);

					// Obtiene el año
					let ano = FN_ano(DOM.ano.value);

					// Si 'pst' y Año > 1100, muestra sectorApMar. Si no, lo oculta
					// Es necesario dejar la condición 'pst', para que lo oculte si el usuario lo combina con otra opción
					if (epocaOcurrencia_id == "pst" && ano > 1100) DOM.sectorApMar.classList.remove("invisible");
					else DOM.sectorApMar.classList.add("invisible");

					// Fin
					return;
				},
			},
			cfcGenero: () => {
				// Muestra u oculta el sector RCLIC
				if (DOM.cfc.checked && v.genero_id) {
					DOM.sectorRolIgl.classList.remove("invisible");
					DOM.sectorCanon.classList.remove("invisible");
				} else {
					DOM.sectorRolIgl.classList.add("invisible");
					DOM.sectorCanon.classList.add("invisible");
				}

				// Fin
				return;
			},
			enLeyenda: async function (sector) {
				// Si no existe el sector, interrumpe la función
				if (!DOM[sector]) return; // hoyEstamos, leyNombre

				// Opciones
				let opciones = [];
				if (sector == "hoyEstamos_id")
					opciones = v.hoyEstamos.filter((n) => !n.genero_id || (v.genero_id && n.genero_id == v.genero_id));
				else if (sector == "leyNombre" && DOM.nombre.value) {
					// Obtiene la info - nombre, genero_id, canon_id
					let info = "&nombre=" + DOM.nombre.value;
					if (DOM.nombreAltern) info += "&nombreAltern=" + DOM.nombreAltern.value;
					info += "&genero_id=" + v.genero_id;
					if (DOM.rolIglesia_id) info += "&rolIglesia_id=" + DOM.rolIglesia_id.value;
					if (DOM.canon_id) info += "&canon_id=" + DOM.canon_id.value;

					// Obtiene la opciones
					opciones = await fetch(rutas.obtieneLeyNombre + info).then((n) => n.json());
				}

				// Obtiene la opción seleccionada actualmente
				DOM.opcionElegida = document.querySelector("form .input[name=" + sector + "] option:checked");
				const indice = Array.from(DOM[sector]).indexOf(DOM.opcionElegida);

				// Reinicia el select
				DOM[sector].innerHTML = "";
				DOM[sector].appendChild(DOM[sector + "Default"]);

				// Agrega las opciones
				for (let opcion of opciones) {
					// Crea la opción
					const option = document.createElement("option");
					option.value = typeof opcion == "string" ? opcion : opcion.id;
					option.innerText = typeof opcion == "string" ? opcion : opcion.nombre;
					option.selected = true;

					// Agrega la opción
					DOM[sector].appendChild(option);
				}

				// Selecciona la opción original
				if (indice < DOM[sector].length) DOM[sector].selectedIndex = indice + 1; // se agrega '+1' por la opción 'default' que está al inicio

				// Corrige el ancho
				this.ancho(sector);

				// Fin
				return;
			},
			ancho: (sector) => {
				// Variables
				const opcionElegida = document.querySelector("form .input[name=" + sector + "] option:checked")
					? document.querySelector("form .input[name=" + sector + "] option:checked")
					: document.querySelector("form .input[name=" + sector + "] option");

				const ancho = opcionElegida.innerText.length;

				// Ajusta el ancho del select
				DOM[sector].style.width = 9 * 2 + ancho * 6 + "px";

				// Fin
				return;
			},
		},
		validacs: {
			avatar: async () => {
				// Variables
				let params = "&avatar=" + encodeURIComponent(DOM.inputAvatar.value);
				params += "&imgOpcional=SI";
				if (DOM.inputAvatar.value) {
					params += "&esImagen=" + (v.esImagen ? "SI" : "NO");
					params += "&tamano=" + DOM.inputAvatar.files[0].size;
				}

				// Averigua los errores
				errores.avatar = await fetch(rutas.validacion + "avatar" + params).then((n) => n.json());
				OK.avatar = !errores.avatar;

				// Fin
				return;
			},
			nombre: async () => {
				// Variables
				let params = "nombre";
				params += "&nombre=" + encodeURIComponent(DOM.nombre.value);
				if (DOM.nombreAltern && DOM.nombreAltern.value)
					params += "&nombreAltern=" + encodeURIComponent(DOM.nombreAltern.value);
				params += "&entidad=" + entidad;
				if (id) params += "&id=" + id;

				// Le agrega lo referido a la aparición mariana
				if (hechos) {
					let soloCfc = opcElegida(DOM.soloCfc);
					let epocaOcurrencia_id = opcElegida(DOM.epocasOcurrencia_id);
					let ano = FN_ano(DOM.ano.value);
					let ama = opcElegida(DOM.ama);
					if (soloCfc == 1 && epocaOcurrencia_id == "pst" && ano > 1100 && ama == 1) params += "&ama=1";
				}

				// Averigua los errores
				errores.nombre = await fetch(rutas.validacion + params).then((n) => n.json());
				OK.nombre = !errores.nombre;

				// Fin
				return;
			},
			fecha: async () => {
				// Si se conoce la fecha...
				if (DOM.tipoFecha.value != "SF") {
					// Obtiene los datos de los campos
					let params = "fecha";
					params += "&entidad=" + entidad;
					for (let campoFecha of DOM.camposFecha) params += "&" + campoFecha.name + "=" + campoFecha.value;

					// Averigua si hay un error con la fecha
					errores.fecha = await fetch(rutas.validacion + params).then((n) => n.json());
				} else errores.fecha = "";

				// OK vigencia
				OK.fecha = !errores.fecha;

				// Fin
				return;
			},
			repetido: () => {
				if (!DOM.posiblesRepetidos) return;

				// Variables
				let casos = document.querySelectorAll("#posiblesRepetidos li input");
				let cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";

				// Errores y OK
				errores.repetidos = casos && Array.from(casos).some((n) => n.checked) ? cartelDuplicado : "";
				OK.repetidos = !errores.repetidos;

				// Fin
				return;
			},
			genero: async () => {
				// Variables
				let params = "genero";
				params += "&genero_id=" + (v.genero_id ? v.genero_id : ""); // tiene que ser escrito así, para que no quede el texto 'undefined'

				// OK y Errores
				errores.genero_id = await fetch(rutas.validacion + params).then((n) => n.json());
				OK.genero_id = !errores.genero_id;

				// Fin
				return;
			},
			carpetaAvatars: async () => {
				// Variables
				let params = "carpetaAvatars";
				params += "&carpetaAvatars=" + DOM.carpetaAvatars.value;

				// OK y Errores
				errores.carpetaAvatars = await fetch(rutas.validacion + params).then((n) => n.json());
				OK.carpetaAvatars = !errores.carpetaAvatars;

				// Fin
				return;
			},
			prioridad: async () => {
				// Variables
				let params = "prioridad";
				params += "&prioridad_id=" + DOM.prioridad_id.value;

				// OK y Errores
				errores.prioridad_id = await fetch(rutas.validacion + params).then((n) => n.json());
				OK.prioridad_id = !errores.prioridad_id;

				// Fin
				return;
			},
			epocaOcurrencia: async () => {
				// Variables
				let params = "epocaOcurrencia";
				params += "&entidad=" + entidad;
				let epocaOcurrencia_id = opcElegida(DOM.epocasOcurrencia_id);
				params += "&epocaOcurrencia_id=" + epocaOcurrencia_id;

				// Agrega los demás parámetros
				if (epocaOcurrencia_id == "pst") params += "&" + ano + "=" + FN_ano(DOM.ano.value);

				// OK y Errores
				errores.epocaOcurrencia = await fetch(rutas.validacion + params).then((n) => n.json());
				OK.epocaOcurrencia = !errores.epocaOcurrencia;

				// Fin
				return;
			},
			RCLIC: {
				personajes: async () => {
					// Variables
					let params = "RCLIC_personajes";

					// Obtiene la categoría
					const categoria_id = opcElegida(DOM.categorias_id);
					params += "&categoria_id=" + categoria_id;

					if (categoria_id == "CFC") {
						// Obtiene los valores de los preguntasInputs
						params += "&genero_id=" + v.genero_id;
						if (v.genero_id) {
							// Agrega los datos de CFC
							for (let campo of DOM.preguntasInputs)
								if (campo.value) params += "&" + campo.name + "=" + campo.value;

							// Agrega la epocaOcurrencia_id
							const epocaOcurrencia_id = opcElegida(DOM.epocasOcurrencia_id);
							params += "&epocaOcurrencia_id=" + epocaOcurrencia_id;

							// Acciones si la epocaOcurrencia_id es 'pst'
							if (epocaOcurrencia_id == "pst") {
								// Agrega el año
								const ano = FN_ano(DOM.ano.value);
								params += "&anoNacim=" + ano;

								// Agrega lo referido a la aparición mariana
								if (ano > 1100) params += "&apMar_id=" + opcElegida(DOM.apMar_id);
							}
						}
					}

					// OK y Errores
					errores.RCLIC = await fetch(rutas.validacion + params).then((n) => n.json());
					OK.RCLIC = !errores.RCLIC;

					// Fin
					return;
				},
				hechos: async () => {
					// Variables
					let params = "RCLIC_hechos";

					// Obtiene el 'soloCfc'
					let soloCfc = opcElegida(DOM.soloCfc);
					params += "&soloCfc=" + soloCfc;

					if (soloCfc == 1) {
						// Agrega los datos de epocaOcurrencia_id y año
						let epocaOcurrencia_id = opcElegida(DOM.epocasOcurrencia_id);
						params += "&epocaOcurrencia_id=" + epocaOcurrencia_id;

						if (epocaOcurrencia_id == "pst") {
							let ano = FN_ano(DOM.ano.value);
							// Agrega el año
							params += "&anoComienzo=" + ano;
							// Agrega lo referido a la aparición mariana
							if (ano > 1100) params += "&ama=" + opcElegida(DOM.ama);
						}
					}

					// OK y Errores
					errores.RCLIC = await fetch(rutas.validacion + params).then((n) => n.json());
					OK.RCLIC = !errores.RCLIC;

					// Fin
					return;
				},
			},
			leyenda: async () => {
				// Fin
				if (!DOM.hoyEstamos_id && !DOM.leyNombre) return;

				// Variables
				let params = "leyenda";
				params += "&entidad=" + entidad;
				if (DOM.hoyEstamos_id) params += "&hoyEstamos_id=" + DOM.hoyEstamos_id.value;
				if (DOM.leyNombre) params += "&leyNombre=" + DOM.leyNombre.value;

				// OK y Errores
				errores.leyenda = await fetch(rutas.validacion + params).then((n) => n.json());
				OK.leyenda = !errores.leyenda;

				// Fin
				return;
			},
			muestraErroresOK: () => {
				v.camposError.forEach((campoError, i) => {
					// Íconos de OK
					OK[campoError] ? DOM.iconosOK[i].classList.remove("ocultar") : DOM.iconosOK[i].classList.add("ocultar");

					// Íconos de error
					errores[campoError]
						? DOM.iconosError[i].classList.remove("ocultar")
						: DOM.iconosError[i].classList.add("ocultar");

					// Mensaje de error
					DOM.mensajesError[i].innerHTML = errores[campoError] ? errores[campoError] : "";
				});
			},
			botonSubmit: () => {
				// Variables
				const resultado = Object.values(OK);
				const resultadosTrue = resultado.length ? resultado.every((n) => !!n) : false;

				// Activa/Inactiva
				resultadosTrue && resultado.length == v.camposError.length
					? DOM.botonSubmit.classList.remove("inactivo")
					: DOM.botonSubmit.classList.add("inactivo");

				// Fin
				return;
			},
		},
		startUp: async function (forzar) {
			// Avatar
			errores.avatar = errores.avatar ? errores.avatar : false;
			OK.avatar = !errores.avatar;
			if (forzar) DOM.iconosOK[0].classList.remove("ocultaAvatar");

			// Nombre
			if (DOM.nombre.value || (forzar && errores.nombre === undefined)) await this.validacs.nombre();
			if (DOM.nombre.value && OK.nombre) this.impactos.nombre.logos();

			// Fechas
			this.impactos.fecha.muestraOcultaCamposFecha(); // El tipo de fecha siempre tiene un valor
			if (DOM.tipoFecha.value && DOM.tipoFecha.value != "SF" && DOM.mes_id.value)
				this.impactos.fecha.muestraLosDiasDelMes();
			if (DOM.tipoFecha.value == "SF" || (DOM.mes_id.value && DOM.dia.value) || (forzar && errores.fecha === undefined)) {
				// Valida el sector Fechas
				await this.validacs.fecha();
				// Si la fecha está OK, revisa los Repetidos
				if (OK.fecha)
					if (entidad != "epocasDelAno") {
						await this.impactos.fecha.muestraPosiblesRepetidos();
						this.validacs.repetido();
					} else this.impactos.fecha.epocasDelAno();
			}

			// Genero
			if (opcElegida(DOM.generos_id)) await this.impactos.genero.consolidado();
			if (opcElegida(DOM.generos_id) || (forzar && errores.genero_id === undefined)) await this.validacs.genero();

			// Carpeta Avatars
			if (DOM.carpetaAvatars && (DOM.carpetaAvatars.value || (forzar && errores.carpetaAvatars === undefined)))
				await this.validacs.carpetaAvatars();

			// Prioridad
			if (DOM.prioridad_id && (DOM.prioridad_id.value || (forzar && errores.prioridad_id === undefined)))
				await this.validacs.prioridad();

			// Época
			if (DOM.epocasOcurrencia_id.length) {
				if (opcElegida(DOM.epocasOcurrencia_id)) await this.impactos.epocaOcurrencia[entidad]();
				if (opcElegida(DOM.epocasOcurrencia_id) || (forzar && errores.epocaOcurrencia === undefined))
					await this.validacs.epocaOcurrencia();
			}

			// RCLIC
			if (
				(personajes && opcElegida(DOM.categorias_id)) ||
				(hechos && opcElegida(DOM.soloCfc)) ||
				(forzar && (personajes || hechos) && errores.RCLIC === undefined)
			)
				await this.validacs.RCLIC[entidad]();

			// SectorLeyenda
			if (DOM.hoyEstamos_id && !DOM.hoyEstamos_id.value) await FN.impactos.enLeyenda("hoyEstamos");
			if (DOM.leyNombre && !DOM.leyNombre.value) await FN.impactos.enLeyenda("leyNombre");
			if ((DOM.hoyEstamos_id && (forzar || DOM.hoyEstamos_id.value)) || (DOM.leyNombre && (forzar || DOM.leyNombre.value)))
				await this.validacs.leyenda();

			// Acciones finales
			this.validacs.muestraErroresOK();
			this.validacs.botonSubmit();

			// Fin
			return;
		},
		actualizaVarios: async function () {
			await this.validacs.avatar();
			this.validacs.muestraErroresOK();
			this.validacs.botonSubmit();
		},
	};

	// Correcciones mientras se escribe
	DOM.form.addEventListener("input", async (e) => {
		// Variables
		const campo = e.target.name;
		if (!DOM[campo]) return;

		// Validaciones estándar y obtiene el valor
		amplio.restringeCaracteres(e);
		let valor = e.target.value;

		// Acciones si se cambia un texto
		if (campo == "nombre" || campo == "nombreAltern" || campo.startsWith("comentario")) {
			// Variables
			const largoMaximo =
				campo == "nombreAltern" || (campo == "nombre" && !["hechos", "eventos"].includes(entidad))
					? 35
					: campo == "nombre"
					? 45
					: campo.startsWith("comentario")
					? 70
					: false;

			// Si se cambia el nombre, quita el prefijo 'San'
			if (campo == "nombre" && personajes)
				for (let prefijo of v.prefijos)
					if (valor.startsWith(prefijo + " ")) {
						valor = valor.slice(prefijo.length + 1);
						break;
					}

			// Quita los caracteres que exceden el largo permitido
			if (largoMaximo && valor.length > largoMaximo) valor = valor.slice(0, largoMaximo);

			// Si se cambia un 'textarea', actualiza el contador
			if (campo == "comentarioMovil") DOM.contadorMovil.innerHTML = largoMaximo - valor.length;
			if (campo == "comentarioDuracion") DOM.contadorDuracion.innerHTML = largoMaximo - valor.length;

			// Limpia el ícono de error/OK
			const indice = campo.startsWith("comentario") ? 2 : 1; // 2 para fecha, 1 para nombre
			DOM.mensajesError[indice].innerHTML = "";
			DOM.iconosError[indice].classList.add("ocultar");
			DOM.iconosOK[indice].classList.add("ocultar");
		}
		// Acciones si se cambia el año
		if (campo == ano) {
			// Sólo números en el año
			valor = valor.replace(/[^\d]/g, "");

			// Menor o igual que el año actual
			if (valor) {
				const anoIngresado = parseInt(valor);
				valor = Math.min(anoIngresado, anoHoy);
			}

			// Limpia el ícono de error/OK
			const indice = v.camposError.indexOf("epocaOcurrencia");
			DOM.mensajesError[indice].innerHTML = "";
			DOM.iconosError[indice].classList.add("ocultar");
			DOM.iconosOK[indice].classList.add("ocultar");
		}
		// Reemplaza el valor del DOM
		if (campo == "nombre" || campo == "nombreAltern" || campo.startsWith("comentario") || campo == ano) {
			const posicCursor = e.target.selectionStart;
			e.target.value = valor;
			e.target.selectionEnd = posicCursor;
		}
		// Actualiza los datos de 'leyNombre'
		if (["nombre", "nombreAltern"].includes(campo) && DOM.leyNombreFijo) DOM.leyNombreFijo.innerHTML = valor;

		// Fin
		return;
	});

	// Acciones cuando se confirma el input
	DOM.form.addEventListener("change", async (e) => {
		// Variables
		const campo = e.target.name;

		// avatar
		if (campo == "avatar") {
			// Muestra los resultados
			DOM.iconosOK[0].classList.remove("ocultaAvatar");

			// Revisar el input
			await revisaAvatar({DOM, v, FN});
			return;
		}

		// sector Nombre
		if (v.camposNombre.includes(campo)) {
			await FN.validacs.nombre();
			FN.impactos.nombre.logos();
		}

		// sector Fecha
		if (v.camposFecha.includes(campo)) {
			// Impactos
			if (campo == "diasDeDuracion") e.target.value = Math.max(2, Math.min(e.target.value, 366));
			if (campo == "mes_id") FN.impactos.fecha.muestraLosDiasDelMes();
			if (campo == "tipoFecha") FN.impactos.fecha.muestraOcultaCamposFecha();
			if (epocasDelAno && ["mes_id", "dia", "diasDeDuracion"].includes(campo)) FN.impactos.fecha.epocasDelAno(campo);

			// Valida las fechas
			await FN.validacs.fecha();

			// Impactos en repetidos
			if (OK.fecha) {
				await FN.impactos.fecha.muestraPosiblesRepetidos();
				FN.validacs.repetido();
			}
		}

		// sector Repetido
		if (campo == "repetido") FN.validacs.repetido();

		// sector 'Genero'
		if (["genero_id", "plural_id"].includes(campo)) {
			await FN.impactos.genero.consolidado();
			await FN.validacs.genero();

			// Si corresponde, valida RCLIC
			if (personajes && OK.genero_id && opcElegida(DOM.categorias_id) == "CFC") await FN.validacs.RCLIC.personajes();
		}

		// sector Carpeta Avatars
		if (campo == "carpetaAvatars") await FN.validacs.carpetaAvatars();

		// sector Prioridad
		if (campo == "prioridad_id") await FN.validacs.prioridad();

		// sector Época
		if (v.camposEpoca.includes(campo)) {
			// Impacto y Validaciones
			await FN.impactos.epocaOcurrencia[entidad]();
			await FN.validacs.epocaOcurrencia();
			// Si se eligió el checkbox "pst", pone el cursor en 'Año'
			if (e.target.value == "pst") DOM.ano.focus();
			// Si corresponde, valida RCLIC
			if (OK.epocaOcurrencia) {
				if (personajes && opcElegida(DOM.categorias_id) == "CFC") await FN.validacs.RCLIC.personajes();
				if (hechos && opcElegida(DOM.soloCfc) == 1) await FN.validacs.RCLIC.hechos();
			}
		}

		// sector RCLIC
		if (v.camposRCLIC && v.camposRCLIC.includes(campo)) {
			if (campo == "categoria_id") FN.impactos.cfcGenero(); // son campos afectados por la combinación de genero y cfc
			await FN.validacs.RCLIC[entidad]();
			if (hechos) await FN.validacs.nombre();
		}

		// sector leyenda
		if (["hoyEstamos_id", "leyNombre"].includes(campo)) {
			FN.impactos.ancho(campo);
			await FN.validacs.leyenda();
		}

		// Campos que impactan en 'leyendaNombre'
		if ([...v.camposNombre, "genero_id", "plural_id", "canon_id", "rolIglesia_id"].includes(campo)) {
			await FN.impactos.enLeyenda("leyNombre");
			await FN.validacs.leyenda();
		}

		// Final de la rutina
		FN.validacs.muestraErroresOK();
		FN.validacs.botonSubmit();
	});

	// Botón submit
	DOM.botonSubmit.addEventListener("click", async (e) => {
		if (DOM.botonSubmit.className.includes("inactivo")) {
			e.preventDefault();
			await FN.startUp(true);
		}
	});

	// Status inicial
	DOM.iconosOK[0].classList.add("ocultaAvatar");
	await FN.startUp();
});

// Variables
const personajes = entidad == "personajes";
const hechos = entidad == "hechos";
const epocasDelAno = entidad == "epocasDelAno";
const ano = personajes ? "anoNacim" : "anoComienzo";
const rutas = {
	obtieneVariables: "/rclv/api/rc-obtiene-variables-edicion",
	validacion: "/rclv/api/rc-valida-sector-edicion/?funcion=",
	registrosConEsaFecha: "/rclv/api/rc-registros-con-esa-fecha/",
	prefijos: "/rclv/api/rc-prefijos",
	obtieneLeyNombre: "/rclv/api/rc-obtiene-leyenda-nombre/?" + entidad + "=true",
};
const linksUrl = ["https://es.wikipedia.org/wiki/", "https://www.google.com/search?q="];
const googleIMG = {pre: "//google.com/search?q=", post: "&tbm=isch&tbs=isz:l&hl=es-419"};
let OK = {};
let errores = {};
let v;

// Funciones
let opcElegida = (opciones) => {
	// Radio
	if (opciones[0].type == "radio") {
		for (var opcion of opciones) if (opcion.checked) return opcion.value;
		return "";
	}
	// Check
	else {
		let valor = "";
		for (var opcion of opciones) if (opcion.checked) valor += opcion.value;
		return valor;
	}
};
let FN_ano = (ano) => (ano ? parseInt(ano) : 0);
