"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Variables generales
		dataEntry: document.querySelector("#dataEntry"),
		botonSubmit: document.querySelector(".flechas button[type='submit']"),

		// Variables de errores
		iconosOK: document.querySelectorAll("#dataEntry .OK .fa-circle-check"),
		iconosError: document.querySelectorAll("#dataEntry .OK .fa-circle-xmark"),
		mensajeError: document.querySelectorAll("#dataEntry .OK .mensajeError"),

		// Campos
		nombre: document.querySelector("#dataEntry input[name='nombre']"),
		mes_id: document.querySelector("#dataEntry select[name='mes_id']"),
		dia: document.querySelector("#dataEntry select[name='dia']"),
		desconocida: document.querySelector("#dataEntry input[name='desconocida']"),
		posiblesRepetidos: document.querySelector("#dataEntry #posiblesRepetidos"),
		epocas_id: document.querySelectorAll("#dataEntry input[name='epoca_id']"),
		ano: document.querySelector("#dataEntry input[name='ano']"),

		// Otros
		camposNombre: document.querySelectorAll("#dataEntry #nombre .input"),
		camposFecha: document.querySelectorAll("#dataEntry #fecha .input"),
		camposEpoca: document.querySelectorAll("#dataEntry #epoca .input"),
		camposRCLIC: document.querySelectorAll("#dataEntry #RCLIC .input"),
		sectorApMar: document.querySelector("#dataEntry #sectorApMar"),
		linksClick: document.querySelectorAll("#dataEntry #fecha .links"),
	};
	console.dir(Array.from(DOM.iconosOK).map(n=>n.parentNode))
	let rutas = {
		// Rutas
		validacion: "/rclv/api/valida-sector/?funcion=",
		registrosConEsaFecha: "/rclv/api/registros-con-esa-fecha/",
	};
	let varios = {
		// Variables que se obtienen del url
		entidad: new URL(location.href).searchParams.get("entidad"),
		id: new URL(location.href).searchParams.get("id"),
		// Campos por sector
		camposNombre: Array.from(DOM.camposNombre).map((n) => n.name),
		camposFecha: Array.from(DOM.camposFecha).map((n) => n.name),
		camposEpoca: Array.from(DOM.camposEpoca).map((n) => n.name),
		camposRCLIC: Array.from(DOM.camposRCLIC).map((n) => n.name),
		// Links a otros sitios
		linksUrl: ["https://es.wikipedia.org/wiki/", "https://www.santopedia.com/buscar?q="],
		// Errores
		camposError: Array.from(DOM.iconosError).map((n) => n.parentElement.id),
		OK: {},
		errores: {},
	};
	varios.personajes = varios.entidad == "personajes";
	varios.hechos = varios.entidad == "hechos";

	// Valores para personajes
	if (varios.personajes) {
		DOM = {
			...DOM,
			// Data-Entry adicional
			apodo: document.querySelector("#dataEntry input[name='apodo']"),
			sexos_id: document.querySelectorAll("#dataEntry input[name='sexo_id']"),
			categorias_id: document.querySelectorAll("#dataEntry input[name='categoria_id']"),
			rol_iglesia_id: document.querySelector("#dataEntry select[name='rol_iglesia_id']"),
			canon_id: document.querySelector("#dataEntry select[name='canon_id']"),
			ap_mar_id: document.querySelector("#dataEntry select[name='ap_mar_id']"),
			// Otros
			opcionesRolIglesia: document.querySelectorAll("#dataEntry select[name='rol_iglesia_id'] option"),
			opcionesProceso: document.querySelectorAll("#dataEntry select[name='canon_id'] option"),
			camposCFC: document.querySelectorAll("#dataEntry #RCLIC #preguntasRCLIC .input"),
		};
		varios.prefijos = await fetch("/rclv/api/prefijos").then((n) => n.json());
	}
	// Valores para hechos
	if (varios.hechos)
		DOM = {
			...DOM,
			// Inputs - RCLIC
			solo_cfc: document.querySelectorAll("#dataEntry input[name='solo_cfc']"),
			ama: document.querySelectorAll("#dataEntry input[name='ama']"),
		};
	// -------------------------------------------------------
	// Funciones
	let impactos = {
		nombre: {
			logosWikiSantopedia: () => {
				// Mostrar logo de Wiki y Santopedia
				if (varios.OK.nombre)
					DOM.linksClick.forEach((link, i) => {
						link.href = varios.linksUrl[i] + DOM.nombre.value;
						link.classList.remove("ocultar");
					});
				else for (let link of DOM.linksClick) link.classList.add("ocultar");
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

				if (!DOM.desconocida.checked) {
					// Obtiene los casos con esa fecha
					// 1. Obtiene los parámetros
					let params = "?entidad=" + varios.entidad;
					if (varios.id) params += "&id=" + varios.id;
					params += "&mes_id=" + DOM.mes_id.value + "&dia=" + DOM.dia.value;
					// 2. Busca otros casos con esa fecha
					casos = await fetch(rutas.registrosConEsaFecha + params).then((n) => n.json());
				}

				// Si no hay otros casos, mensaje de "No hay otros casos"
				if (!casos.length) {
					DOM.posiblesRepetidos.innerHTML = "¡No hay otros casos!";
					DOM.posiblesRepetidos.classList.add("sinCasos");
				}
				// Si hay otros casos, los muestra y valida 'repetidos'
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

				// Valida repetidos
				validacs.repetido();

				// Fin
				return;
			},
			limpiezaDeMesDia: () => {
				// Limpia los valores de mes, día y repetidos
				DOM.mes_id.value = "";
				DOM.dia.value = "";

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
		// Sectores
		nombre: {
			personajes: async () => {
				// Verifica errores en el sector 'nombre'
				let params = "&nombre=" + encodeURIComponent(DOM.nombre.value);
				params += "&apodo=" + encodeURIComponent(DOM.apodo.value);
				params += "&entidad=" + varios.entidad;
				if (varios.id) params += "&id=" + varios.id;

				// Averigua los errores
				varios.errores.nombre = await fetch(rutas.validacion + "nombre" + params).then((n) => n.json());
				varios.OK.nombre = !varios.errores.nombre;
				// Fin
				return;
			},
			hechos: async () => {
				// Verifica errores en el sector 'nombre', campo 'nombre'
				let params = "&nombre=" + encodeURIComponent(DOM.nombre.value);
				parms += "&entidad=" + varios.entidad;
				if (varios.id) params += "&id=" + varios.id;

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
			if (!DOM.desconocida.checked) {
				// Averigua si hay un error con la fecha
				let params = "&mes_id=" + DOM.mes_id.value + "&dia=" + DOM.dia.value;
				varios.errores.fecha = await fetch(rutas.validacion + "fecha" + params).then((n) => n.json());
			} else varios.errores.fecha = "";

			// OK vigencia
			varios.OK.fecha = !varios.errores.fecha;

			// Acciones si la fecha está OK
			if (varios.OK.fecha) await impactos.fecha.muestraPosiblesRepetidos();

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
		epoca: async () => {
			// Variables
			let params = "epoca&entidad=" + varios.entidad;

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

					// Obtiene los valores de los camposCFC
					if (sexo_id.value) {
						// Agrega los datos de CFC
						for (let campo of DOM.camposCFC) if (campo.value) params += "&" + campo.name + "=" + campo.value;
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
		muestraErrorOK: (i, ocultarOK) => {
			// Íconos de OK
			varios.OK[varios.camposError[i]] && !ocultarOK
				? DOM.iconosOK[i].classList.remove("ocultar")
				: DOM.iconosOK[i].classList.add("ocultar");
			// Íconos de error
			varios.errores[varios.camposError[i]]
				? DOM.iconosError[i].classList.remove("ocultar")
				: DOM.iconosError[i].classList.add("ocultar");
			// Mensaje de error
			DOM.mensajeError[i].innerHTML = varios.errores[varios.camposError[i]] ? varios.errores[varios.camposError[i]] : "";
		},
		muestraErroresOK: function () {
			// Muestra los íconos de Error y OK
			for (let i = 0; i < varios.camposError.length; i++) this.muestraErrorOK(i);
		},
		botonSubmit: () => {
			// Botón submit
			let resultado = Object.values(varios.OK);
			let resultadosTrue = resultado.length ? resultado.every((n) => !!n) : false;
			resultadosTrue && resultado.length == varios.camposError.length
				? DOM.botonSubmit.classList.remove("inactivo")
				: DOM.botonSubmit.classList.add("inactivo");
		},
		startUp: async function (forzar) {
			// 1. Valida el nombre
			if (DOM.nombre.value || (forzar && varios.errores.nombre == undefined))
				varios.personajes ? await this.nombre.nombreApodo() : await this.nombre.nombre();
			if (DOM.nombre.value && varios.OK.nombre) impactos.nombre.logosWikiSantopedia();

			// 2. Valida las fechas
			if (DOM.desconocida.checked) impactos.fecha.limpiezaDeMesDia();
			if (DOM.mes_id.value) impactos.fecha.muestraLosDiasDelMes();
			if ((DOM.mes_id.value && DOM.dia.value) || DOM.desconocida.checked || (forzar && varios.errores.fecha == undefined))
				await this.fecha();

			// 4. Valida el sexo
			if (varios.personajes && opcionElegida(DOM.sexos_id).value) await impactos.sexo();
			if (varios.personajes && (opcionElegida(DOM.sexos_id).value || (forzar && varios.errores.sexo_id == undefined)))
				await this.sexo();

			// 5. Valida la época
			if (opcionElegida(DOM.epocas_id).value) await impactos.epoca[varios.entidad]();
			if (opcionElegida(DOM.epocas_id).value || (forzar && varios.errores.epoca == undefined)) await this.epoca();

			// 6. Valida RCLIC
			if (
				(varios.personajes && opcionElegida(DOM.categorias_id).value) ||
				(varios.hechos && opcionElegida(DOM.solo_cfc).value) ||
				(forzar && varios.errores.RCLIC == undefined)
			)
				await this.RCLIC[varios.entidad]();

			// Fin
			this.muestraErroresOK();
			this.botonSubmit();
		},
	};

	// Correcciones mientras se escribe
	DOM.dataEntry.addEventListener("input", async (e) => {
		// Variables
		let campo = e.target.name;
		let valor = DOM[campo].value;

		// Acciones si se cambia el nombre o apodo
		if (varios.camposNombre.includes(campo)) {
			// 1. Primera letra en mayúscula
			DOM[campo].value = valor.slice(0, 1).toUpperCase() + valor.slice(1);
			valor = DOM[campo].value;

			// 2. Quita los caracteres no deseados
			DOM[campo].value = valor
				.replace(/[^a-záéíóúüñ'.-\s]/gi, "")
				.replace(/ +/g, " ")
				.replace(/\t/g, "")
				.replace(/\r/g, "");
			valor = DOM[campo].value;

			// 3. Quita el prefijo 'San'
			if (campo == "nombre" && varios.personajes)
				for (let prefijo of varios.prefijos) {
					if (valor.startsWith(prefijo + " ")) {
						DOM[campo].value = valor.slice(prefijo.length + 1);
						valor = DOM[campo].value;
						break;
					}
				}

			// 4. Quita los caracteres que exceden el largo permitido
			if (valor.length > 30) valor = valor.slice(0, 30);
		}
		if (campo == "ano") {
			// Sólo números en el año
			valor = valor.replace(/[^\d]/g, "");

			// Menor o igual que el año actual
			if (valor) {
				let anoIngresado = parseInt(valor);
				let anoActual = new Date().getFullYear();
				valor = Math.min(anoIngresado, anoActual);
			}
		}

		// Actualiza el valor en el DOM
		e.target.value = valor;

		// Oculta íconos de acierto y error
		const i = varios.camposError.indexOf(campo);
		DOM.mensajeError[i].innerHTML = "";
		DOM.iconosError[i].classList.add("ocultar");
		DOM.iconosOK[i].classList.add("ocultar");

		// Fin
		return;
	});
	// Acciones cuando se  confirma el input
	DOM.dataEntry.addEventListener("change", async (e) => {
		// Variables
		let campo = e.target.name;

		// 1. Acciones si se cambia el sector Nombre
		if (varios.camposNombre.includes(campo) && DOM.nombre.value) {
			await validacs.nombre[varios.entidad]();
			if (varios.OK.nombre) impactos.nombre.logosWikiSantopedia();
		}

		// 2. Acciones si se cambia el sector Fecha
		if (varios.camposFecha.includes(campo)) {
			if (campo == "mes_id") impactos.fecha.muestraLosDiasDelMes();
			if ((campo == "mes_id" || campo == "dia") && DOM.mes_id.value && DOM.dia.value) {
				DOM.desconocida.checked = false;
				await validacs.fecha();
			}
			if (campo == "desconocida") {
				if (DOM.desconocida.checked) impactos.fecha.limpiezaDeMesDia();
				await validacs.fecha();
			}
		}

		// 3. Acciones si se cambia el sector Repetido
		if (campo == "repetido") validacs.repetido();
		
		// 4. Acciones si se cambia el sector Sexo
		if (campo == "sexo_id") {
			await impactos.sexo();
			await validacs.sexo();
			// Si corresponde, valida RCLIC
			if (varios.OK.sexo_id && opcionElegida(DOM.categorias_id).value == "CFC") await validacs.RCLIC.personajes();
		}

		// 5. Acciones si se cambia el sector Época
		if (varios.camposEpoca.includes(campo)) {
			// Impacto y Validaciones
			await impactos.epoca[varios.entidad]();
			await validacs.epoca();
			// Si se eligió el checkbox "pst", pone el cursor en 'Año'
			if (e.target.value == "pst") DOM.ano.focus();
			// Si corresponde, valida RCLIC
			if (varios.OK.epoca) {
				if (varios.personajes && opcionElegida(DOM.categorias_id).value == "CFC") await validacs.RCLIC.personajes();
				if (varios.hechos && opcionElegida(DOM.solo_cfc).value == 1) await validacs.RCLIC.hechos();
			}
		}

		// 6. Acciones si se cambia el sector RCLIC
		if (varios.camposRCLIC.includes(campo)) {
			// Nota: sus impactos se resuelven con CSS
			await validacs.RCLIC[varios.entidad]();
			if (varios.hechos) await validacs.nombre.hechos();
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
			await validacs.startUp(true);
		}
	});

	// Status inicial
	await validacs.startUp();
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
