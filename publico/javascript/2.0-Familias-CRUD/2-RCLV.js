"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Variables que se obtienen del url
		entidad: new URL(window.location.href).searchParams.get("entidad"),
		id: new URL(window.location.href).searchParams.get("id"),
		// Variables generales
		dataEntry: document.querySelector("#dataEntry"),
		botonSubmit: document.querySelector(".flechas #submit"),
		// Rutas
		rutaValidacion: "/rclv/api/valida-sector/?funcion=",
		rutaRegistrosConEsaFecha: "/rclv/api/registros-con-esa-fecha/",
		// Links a otros sitios
		linksClick: document.querySelectorAll("#dataEntry #valoresFecha .links"),
		linksUrl: ["https://es.wikipedia.org/wiki/", "https://www.santopedia.com/buscar?q="],
		// Variables de errores
		iconoOK: document.querySelectorAll("#dataEntry .OK .fa-circle-check"),
		iconoError: document.querySelectorAll("#dataEntry .OK .fa-circle-xmark"),
		mensajeError: document.querySelectorAll("#dataEntry .OK .mensajeError"),
		// Campos para todos los RCLV
		nombre: document.querySelector("#dataEntry input[name='nombre']"),
		mes_id: document.querySelector("#dataEntry select[name='mes_id']"),
		dia: document.querySelector("#dataEntry select[name='dia']"),
		desconocida: document.querySelector("#dataEntry input[name='desconocida']"),
		posiblesRepetidos: document.querySelector("#dataEntry #posiblesRepetidos"),
		sectores: ["nombre", "fecha", "repetidos"],
	};
	v = {
		...v,
		// Obtiene la entidad en formato booleano
		personajes: v.entidad == "personajes",
		hechos: v.entidad == "hechos",
		valores: v.entidad == "valores",
	};
	let OK = {};
	let errores = {};

	// Valores para !valores
	if (!v.valores) {
		v.cfc = document.querySelectorAll("#preguntas .cfc");
		(v.camposRCLI = (() => {
			// Obtiene todos los campos RCLI
			let campos = document.querySelectorAll("#dataEntry #preguntas .RCLI");
			campos = Array.from(campos).map((n) => n.name);
			campos = [...new Set(campos)];
			return campos;
		})()),
			(v.preguntas = document.querySelector("#dataEntry #preguntas"));
		v.ano = document.querySelector("#dataEntry input[name='ano']");
		v.ama = document.querySelectorAll("input[name='ama']");
		v.cnt = document.querySelectorAll("input[name='cnt']");
		// Para ocultar
		v.sectores.push("RCLI");
		v.rutaConsecuenciasAno = "/rclv/api/consecuencias-de-ano/?entidad=";
	}
	// Valores para personajes
	if (v.personajes) {
		v.apodo = document.querySelector("#dataEntry input[name='apodo']");
		// Inputs
		v.categoria_id = document.querySelectorAll("input[name='categoria_id']");
		v.sexo_id = document.querySelectorAll("input[name='sexo_id']");
		v.rol_iglesia_id = document.querySelector("select[name='rol_iglesia_id']");
		v.enProcCan = document.querySelectorAll("input[name='enProcCan']");
		v.proceso_id = document.querySelector("select[name='proceso_id']");
		v.ap_mar_id = document.querySelector("select[name='ap_mar_id']");
		v.santosanta = document.querySelector("#dataEntry #santosanta");
		// Sectores a mostrarOcultar
		v.sector_cnt = document.querySelector("#preguntas #sector_cnt");
		v.sector_ama = document.querySelector("#preguntas #sector_ama");
	}
	// Valores para hechos
	if (v.hechos) {
		// Inputs
		v.solo_cfc = document.querySelectorAll("input[name='solo_cfc']");
		v.jss = document.querySelectorAll("input[name='jss']");
		v.cnt = document.querySelectorAll("input[name='cnt']");
		v.ncn = document.querySelectorAll("input[name='ncn']");
		v.ama = document.querySelectorAll("input[name='ama']");
		// Sectores
		v.sector_jss = document.querySelector("#preguntas #sector_jss");
		v.sector_cnt = document.querySelector("#preguntas #sector_cnt");
		v.sector_ncn = document.querySelector("#preguntas #sector_ncn");
		v.sector_ama = document.querySelector("#preguntas #sector_ama");
	}

	// Funciones
	let validacs = {
		nombre: {
			nombre: async () => {
				// Verifica errores en el sector 'nombre', campo 'nombre'
				let params = "&nombre=" + v.nombre.value;
				errores.nombre = await fetch(v.rutaValidacion + "nombre" + params).then((n) => n.json());
				// Si hay errores, cambia el OK a false
				if (errores.nombre) OK.nombre = false;
				// Fin
				return;
			},
			apodo: async () => {
				// Verifica errores en el sector 'nombre', campo 'apodo'
				let params = "&apodo=" + v.apodo.value;
				errores.nombre = await fetch(v.rutaValidacion + "nombre" + params).then((n) => n.json());
				if (errores.nombre) OK.nombre = false;
				// Fin
				return;
			},
			nombreApodo: async () => {
				// Verifica errores en el sector 'nombre'
				let params = "&nombre=" + v.nombre.value + "&entidad=" + v.entidad;
				if (v.personajes) params += "&apodo=" + v.apodo.value;
				if (v.id) params += "&id=" + v.id;
				errores.nombre = await fetch(v.rutaValidacion + "nombre" + params).then((n) => n.json());
				// Consolidar la info
				OK.nombre = !errores.nombre;
				// Fin
				return;
			},
		},
		fechas: async () => {
			// Si se conoce la fecha...
			if (!v.desconocida.checked) {
				// Averigua si hay un error con la fecha
				let params = "&mes_id=" + v.mes_id.value + "&dia=" + v.dia.value;
				errores.fecha = await fetch(v.rutaValidacion + "fecha" + params).then((n) => n.json());
				OK.fecha = !errores.fecha;
			} else {
				// Errores y OK
				errores.fecha = "";
				OK.fecha = true;
			}
			// Fin
			return;
		},
		repetido: () => {
			// Variables
			let casos = document.querySelectorAll("#posiblesRepetidos li input");
			let cartelDuplicado =
				"Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
			// Errores y OK
			errores.repetidos = casos && Array.from(casos).some((n) => n.checked) ? cartelDuplicado : "";
			OK.repetidos = !errores.repetidos;
			// Fin
			return;
		},
		RCLI: {
			ano: async () => {
				// Variables
				let ano = v.ano.value;
				// Se averigua si hay un error con el año
				let params = "&ano=" + ano;
				errores.RCLI = await fetch(v.rutaValidacion + "ano" + params).then((n) => n.json());
				OK.RCLI = !errores.RCLI;
				// Fin
				return;
			},
			consolidado: async (muestraErrores) => {
				// Variables
				let params = "&entidad=" + v.entidad;
				// Obtiene el valor de cada campo
				for (let campo of v.camposRCLI)
					params += "&" + campo + "=" + procesos.RCLI.obtieneValor(campo);
				// OK y Errores
				errores.RCLI = await fetch(v.rutaValidacion + v.entidad + params).then((n) => n.json());
				OK.RCLI = !errores.RCLI;
				// Oculta los errores
				if (!muestraErrores) errores.RCLI = "";

				// Fin
				return;
			},
		},
	};
	let procesos = {
		nombre: {
			logosWikiSantopedia: () => {
				// Mostrar logo de Wiki y Santopedia
				if (OK.nombre)
					v.linksClick.forEach((link, i) => {
						link.href = v.linksUrl[i] + v.nombre.value;
						link.classList.remove("ocultar");
					});
				else for (let link of v.linksClick) link.classList.add("ocultar");
				// Fin
				return;
			},
		},
		fechas: {
			muestraLosDiasDelMes: () => {
				// Aplicar cambios en los días 30 y 31
				// Variables
				let dia30 = document.querySelector("select[name='dia'] option[value='30']");
				let dia31 = document.querySelector("select[name='dia'] option[value='31']");
				let mes = v.mes_id.value;

				// Revisar para febrero
				if (mes == 2) {
					dia30.classList.add("ocultar");
					dia31.classList.add("ocultar");
					if (v.dia.value > 29) v.dia.value = "";
				} else {
					// Revisar para los demás meses de 30 días
					dia30.classList.remove("ocultar");
					if (mes == 4 || mes == 6 || mes == 9 || mes == 11) {
						dia31.classList.add("ocultar");
						if (v.dia.value > 30) v.dia.value = "";
					} else dia31.classList.remove("ocultar");
				}
			},
			muestraPosiblesDuplicados: async () => {
				// Obtiene los casos con esa fecha
				// 1. Obtiene los parámetros
				let params = "?mes_id=" + v.mes_id.value + "&dia=" + v.dia.value + "&entidad=" + v.entidad;
				if (v.id) params += "&id=" + v.id;
				// 2. Busca otros casos con esa fecha
				let casos = await fetch(v.rutaRegistrosConEsaFecha + params).then((n) => n.json());

				// Si no hay otros casos, mensaje de "No hay otros casos"
				if (!casos.length) {
					v.posiblesRepetidos.innerHTML = "¡No hay otros casos!";
					v.posiblesRepetidos.classList.add("sinCasos");
				}

				// Si hay otros casos, los muestra
				else {
					v.posiblesRepetidos.innerHTML = "";
					v.posiblesRepetidos.classList.remove("sinCasos");
					for (let caso of casos) {
						// Crear el input
						let input = document.createElement("input");
						input.type = "checkbox";
						input.name = "repetido";
						input.checked = true;
						// Crear la label
						let texto = document.createTextNode(caso);
						let label = document.createElement("label");
						label.appendChild(texto);
						// Crear el 'li'
						let li = document.createElement("li");
						li.appendChild(input);
						li.appendChild(label);
						v.posiblesRepetidos.appendChild(li);
					}
				}

				// Fin
				return;
			},
			limpiezaDeFechaRepetidos: () => {
				// Limpia los valores de mes, día y repetidos
				v.mes_id.value = "";
				v.dia.value = "";
				v.posiblesRepetidos.innerHTML = "";
				// Fin
				return;
			},
		},
		RCLI: {
			obtieneValor: (campo) => {
				// Obtiene el inputElegido
				let input = v[campo];
				// console.log(input[1]);
				let valor =
					input[0] && input[0].localName == "input"
						? input[0].checked
							? input[0].value
							: input[1].checked
							? input[1].value
							: ""
						: input.value;
				return input[0] && input[0].localName == "input"
					? input[0].checked
						? input[0].value
						: input[1].checked
						? input[1].value
						: ""
					: input.value;
			},
			novs_personajes: {
				ano: async () => {
					// Variable
					let ano = v.ano.value != "" ? Number(v.ano.value) : "";

					// Lectura de 'procesos'
					let ruta = v.rutaConsecuenciasAno + "personajes&ano=" + ano;
					let {cnt, ama} = await fetch(ruta).then((n) => n.json());

					// Contemporáneo de Jesús - Situaciones en las que se oculta el sector
					if (cnt.certeza) {
						// Oculta el sector
						v.sector_cnt.classList.add("ocultarPorAno");
						// Completa el dato de cnt
						cnt.dato ? (v.cnt[0].checked = true) : (v.cnt[1].checked = true);
					} else v.sector_cnt.classList.remove("ocultarPorAno");

					// Aparición Mariana - Situaciones en las que se oculta el sector
					if (ama.certeza && !ama.dato) {
						// Oculta el sector
						v.sector_ama.classList.add("ocultarPorAno");
						// Completa el dato de ama
						v.ama[1].checked = true;
					} else v.sector_ama.classList.remove("ocultarPorAno");

					// Fin
					return;
				},
				sexo: () => {
					// Definir variables
					let sexoValor = v.sexo_id[0].checked
						? v.sexo_id[0].value
						: v.sexo_id[1].checked
						? v.sexo_id[1].value
						: "";
					if (sexoValor) {
						// Proceso de canonización
						// 1. Actualiza las opciones
						let opciones_proc = document.querySelectorAll("select[name='proceso_id'] option");
						opciones_proc.forEach((n) =>
							n.value.length < 2 || n.value[2] != sexoValor
								? n.classList.add("ocultar")
								: n.classList.remove("ocultar")
						);
						// 2. Preserva la opción elegida, cambiándole el sexo
						if (
							v.proceso_id.value &&
							v.proceso_id.value.length != 2 &&
							v.proceso_id.value[2] != sexoValor
						)
							v.proceso_id.value = v.proceso_id.value.slice(0, 2) + sexoValor;
						// 3. Actualiza el sexo de la pregunta
						let letraActual = sexoValor == "V" ? "anto" : "anta";
						let letraAnterior = sexoValor == "V" ? "anta" : "anto";
						if (v.santosanta.innerHTML.includes(letraAnterior))
							v.santosanta.innerHTML = v.santosanta.innerHTML.replace(
								letraAnterior,
								letraActual
							);
						// Rol en la Iglesia
						// 1. Actualiza las opciones
						let opciones_rol = document.querySelectorAll("select[name='rol_iglesia_id'] option");
						opciones_rol.forEach((n) =>
							n.value.length < 2 || n.value[2] != sexoValor
								? n.classList.add("ocultar")
								: n.classList.remove("ocultar")
						);
						// 2. Preserva la opción elegida, cambiándole el sexo
						let rol_iglesia = v.rol_iglesia_id.value;
						if (rol_iglesia && rol_iglesia.length != 2 && rol_iglesia[2] != sexoValor)
							v.rol_iglesia_id.value = rol_iglesia.slice(0, 2) + sexoValor;
						// Si no existe la opción (ej: sacerdote mujer), opción "Elegí un valor"
						if (!v.rol_iglesia_id.value) v.rol_iglesia_id.value = "";
					}
					return;
				},
			},
			novs_hechos: {
				ano: async () => {
					// Función
					let mostrarOcultar = (datos, campo) => {
						// Situaciones en las que se oculta el sector
						if (datos.certeza) {
							// Oculta el sector
							v["sector_" + campo].classList.add("ocultarPorAno");
							// Completa el dato
							datos.dato ? (v[campo][0].checked = true) : (v[campo][1].checked = true);
						} else v["sector_" + campo].classList.remove("ocultarPorAno");
					};

					// Variable
					let ano = v.ano.value != "" ? Number(v.ano.value) : "";

					// Lectura de 'procesos'
					let ruta = v.rutaConsecuenciasAno + "hechos&ano=" + ano;
					let {jss, cnt, ncn, ama} = await fetch(ruta).then((n) => n.json());

					// Mostrar u ocultar sectores
					mostrarOcultar(jss, "jss");
					mostrarOcultar(cnt, "cnt");
					mostrarOcultar(ncn, "ncn");
					mostrarOcultar(ama, "ama");

					// Fin
					return;
				},
				jss: async () => {

				},
				cnt: async () => {},
			},
			muestraOculta: {
				ocultar: (indice) => {
					for (let i = indice; i < v.cfc.length; i++) v.cfc[i].classList.add("ocultar");
					return;
				},
				obtieneValor: (campo) => {
					// Obtiene el inputElegido
					let input = v[campo];
					// console.log(input[1]);
					let valor =
						input[0] && input[0].localName == "input"
							? input[0].checked
								? input[0].value
								: input[1].checked
								? input[1].value
								: ""
							: input.value;
					return input[0] && input[0].localName == "input"
						? input[0].checked
							? input[0].value
							: input[1].checked
							? input[1].value
							: ""
						: input.value;
				},
				personajes: function () {
					// Variables
					let saltear = true;
					// Revisión por campo
					for (let indice = 0; indice < v.camposRCLI.length - 1; indice++) {
						// Variables
						let campo = v.camposRCLI[indice];
						let valor = this.obtieneValor(campo);

						// Particularidad para 'categoria_id'
						if (campo == "categoria_id") {
							if (!this.obtieneValor("sexo_id") || valor != "CFC") {
								this.ocultar(indice + 2);
								break;
							} else {
								v.cfc[indice + 2].classList.remove("ocultar");
								continue;
							}
						}
						// Particularidad para 'ano'
						if (campo == "ano") continue;

						// Particularidades para enProcCan y ama
						if ((campo == "enProcCan" || campo == "ama") && valor == "0") {
							// Oculta el siguiente campo
							v.cfc[indice + 1].classList.add("ocultar");
							// Muestra el campo subsiguiente
							if (indice + 2 < v.camposRCLI.length)
								v.cfc[indice + 2].classList.remove("ocultar");
							// Saltea el campo subsiguiente
							indice++;
							// Fin
							continue;
						}

						// Saltear
						if (campo == "ano") saltear = false;
						// Caso genérico
						if (valor) v.cfc[indice + 1].classList.remove("ocultar");
						else {
							if (saltear) continue;
							this.ocultar(indice + 1);
							break;
						}
					}
				},
				hechos: function () {
					// Variables
					let saltear = true;
					// Revisión por campo
					for (let indice = 0; indice < v.camposRCLI.length - 1; indice++) {
						// Variables
						let campo = v.camposRCLI[indice];
						let valor = this.obtieneValor(campo);

						// Particularidad para 'solo_cfc'
						if (campo == "solo_cfc" && valor == "0") {
							this.ocultar(indice + 1);
							break;
						}

						// Saltear
						if (campo == "solo_cfc") saltear = false;
						// Caso genérico
						if (valor) v.cfc[indice + 1].classList.remove("ocultar");
						else {
							if (saltear) continue;
							this.ocultar(indice + 1);
							break;
						}
					}
				},
			},
		},
	};
	let feedback = {
		startUp: async () => {
			// Valida el nombre
			if (v.nombre.value) await validacs.nombre.nombreApodo();
			// Personaliza los días del mes
			if (v.mes_id.value) procesos.fechas.muestraLosDiasDelMes(v.mes_id, v.dia);
			// Valida los días
			if ((v.mes_id.value && v.dia.value) || v.desconocida.checked) {
				// Valida las fechas
				await validacs.fechas();
				// Valida los duplicados
				validacs.repetido();
			}
			// Valida RCLI
			if (v.entidad != "valores") await validacs.RCLI.consolidado();
			// Muestra el RCLI
			if (v.entidad != "valores") await procesos.RCLI.muestraOculta[v.entidad]();
		},
		muestraErrorOK: (i, ocultarOK) => {
			// Íconos de OK
			OK[v.sectores[i]] && !ocultarOK
				? v.iconoOK[i].classList.remove("ocultar")
				: v.iconoOK[i].classList.add("ocultar");
			// Íconos de error
			errores[v.sectores[i]]
				? v.iconoError[i].classList.remove("ocultar")
				: v.iconoError[i].classList.add("ocultar");
			// Mensaje de error
			v.mensajeError[i].innerHTML = errores[v.sectores[i]] ? errores[v.sectores[i]] : "";
		},
		muestraErroresOK: function () {
			// Muestra los íconos de Error y OK
			v.sectores.forEach((sector, i) => {
				this.muestraErrorOK(i);
			});
		},
		botonSubmit: () => {
			// Botón submit
			let resultado = Object.values(OK);
			let resultadoTrue = resultado.length ? resultado.every((n) => n == true) : false;
			resultadoTrue && resultado.length == v.sectores.length
				? v.botonSubmit.classList.remove("inactivo")
				: v.botonSubmit.classList.add("inactivo");
		},
	};

	// Correcciones mientras se escribe
	v.dataEntry.addEventListener("input", async (e) => {
		let campo = e.target.name;
		// Acciones si se cambia el nombre o apodo
		if (campo == "nombre" || campo == "apodo") {
			// Primera letra en mayúscula
			let valor = v[campo].value;
			v[campo].value = valor.slice(0, 1).toUpperCase() + valor.slice(1);
			// Quita los caracteres no deseados
			v[campo].value = v[campo].value.replace(/[^a-záéíóúüñ'\s\d]/gi, "").replace(/ +/g, " ");
			// Quita los caracteres que exceden el largo permitido
			if (v[campo].value.length > 30) v[campo].value = v[campo].value.slice(0, 30);
			// Revisa los errores y los publica si existen
			await validacs.nombre[campo]();
			feedback.muestraErrorOK(0, true);
		}
		// Acciones si se cambia el año
		if (campo == "ano") {
			// Sólo números
			v.ano.value = v.ano.value.replace(/[^-\d]/g, "");
			// Impide guiones en el medio
			if (v.ano.value.lastIndexOf("-") > 0) v.ano.value = v.ano.value.replace(/[-]/g, "");
		}
	});
	// Acciones cuando se  confirma el input
	v.dataEntry.addEventListener("change", async (e) => {
		// Variables
		let campo = e.target.name;
		// 1. Acciones si se cambia el nombre o apodo
		if ((campo == "nombre" || campo == "apodo") && v.nombre.value) {
			await validacs.nombre.nombreApodo();
			procesos.nombre.logosWikiSantopedia();
		}
		// 2. Acciones si se cambia la fecha
		if (campo == "mes_id" || campo == "dia" || campo == "desconocida") {
			if (campo == "mes_id") procesos.fechas.muestraLosDiasDelMes();
			if ((campo == "mes_id" || campo == "dia") && v.mes_id.value && v.dia.value) {
				await validacs.fechas();
				if (OK.fecha) {
					await procesos.fechas.muestraPosiblesDuplicados();
					validacs.repetido();
				}
			}
			if (campo == "desconocida" && v.desconocida.checked) {
				procesos.fechas.limpiezaDeFechaRepetidos();
				await validacs.fechas();
				validacs.repetido();
			}
		}
		// 3. Acciones si se cambia repetido
		if (campo == "repetido") validacs.repetido();
		// 4. Acciones si se cambia un campo RCLI
		if (v.camposRCLI && v.camposRCLI.includes(campo)) {
			// 4.1. Acciones si se cambia el año
			if (campo == "ano") {
				await validacs.RCLI.ano();
				if (OK.RCLI) procesos.RCLI["novs_" + v.entidad].ano();
			}
			// 4.2. Acciones si se cambia el sexo
			if (campo == "sexo_id") procesos.RCLI.novs_personajes.sexo();
			// 4.3. Acciones si se cambia 'jss'

			// Revisa los errores en RCLI
			await validacs.RCLI.consolidado();
			// Muestra y oculta los campos que correspondan
			procesos.RCLI.muestraOculta[v.entidad]();
		}
		// Final de la rutina
		feedback.muestraErroresOK();
		feedback.botonSubmit();
	});
	v.botonSubmit.addEventListener("click", async (e) => {
		// Acciones si el botón está inactivo
		if (v.botonSubmit.classList.contains("inactivo")) {
			await validacs.nombre.nombreApodo();
			await validacs.fechas();
			validacs.repetido();
			if (!v.valores) {
				await validacs.RCLI.consolidado(true);
				await procesos.RCLI["muestraOculta_" + v.entidad]();
			}
			// Fin
			feedback.muestraErroresOK();
		}
		// Si el botón está activo, función 'submit'
		else v.dataEntry.submit();
	});

	// Status inicial
	await feedback.startUp();
	feedback.muestraErroresOK();
	feedback.botonSubmit();
});
