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
		// Sectores a muestraOculta
		v.sector_cnt = document.querySelector("#preguntas #sector_cnt");
		v.sector_ama = document.querySelector("#preguntas #sector_ama");
		v.prefijos = await fetch("/rclv/api/prefijos").then((n) => n.json());
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
					params += "&" + campo + "=" + procesos.RCLI.muestraOculta.obtieneValor(campo);
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
			personajes: {
				ano: async () => {
					// Función
					let proceso = (dato) => {
						// Variables
						let cnt = {},
							ama = {};

						// Resultados
						if (dato != "") {
							dato = Number(dato);
							// Contemporáneos de Jesús
							cnt.certeza = dato >= 0; // Si el año es mayor o igual a cero, hay certeza sobre el resultado
							if (cnt.certeza) cnt.dato = dato <= 33; // Si hay certeza, en función del valor del año, el resultado es true o false

							// Aparición Mariana
							ama.certeza = dato < 1100; // Si el año es menor o igual a 1100, hay certeza sobre el resultado
							if (ama.certeza) ama.dato = false; // Si hay certeza sobre el resultado, el resultado es false
						} else cnt.certeza = ama.certeza = false;

						// Fin
						return {cnt, ama};
					};

					// Variables
					let {cnt, ama} = proceso(v.ano.value);

					// Contemporáneo de Jesús - Situaciones en las que se oculta el sector
					if (cnt.certeza) {
						// Oculta el sector
						v.sector_cnt.classList.add("ocultaPorAno");
						// Completa el dato de cnt
						cnt.dato ? (v.cnt[0].checked = true) : (v.cnt[1].checked = true);
					} else v.sector_cnt.classList.remove("ocultaPorAno");

					// Aparición Mariana - Situaciones en las que se oculta el sector
					if (ama.certeza && !ama.dato) {
						// Oculta el sector
						v.sector_ama.classList.add("ocultaPorAno");
						// Completa el dato de ama
						v.ama[1].checked = true;
					} else v.sector_ama.classList.remove("ocultaPorAno");

					// Fin
					return;
				},
				sexo: () => {
					// Variables
					let sexoValor = v.sexo_id[0].checked
						? v.sexo_id[0].value
						: v.sexo_id[1].checked
						? v.sexo_id[1].value
						: "";
					// Consecuencias
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
			hechos: {
				ano: async () => {
					// Funciones
					let proceso = (dato) => {
						// Variables
						let jss = {},
							cnt = {},
							ncn = {},
							ama = {};

						// Resultados
						if (dato != "") {
							dato = Number(dato);
							// Jesús
							jss.certeza = dato >= 0; // Si el año es mayor o igual a cero, hay certeza sobre el resultado
							if (jss.certeza) jss.dato = dato <= 33; // Si hay certeza, en función del valor del año, el resultado es true o false

							// Contemporáneos de Jesús
							cnt.certeza = dato >= 0; // Si el año es mayor o igual a cero, hay certeza sobre el resultado
							if (cnt.certeza) cnt.dato = dato <= 100; // Si hay certeza, en función del valor del año, el resultado es true o false

							// También ocurrió fuera de la vida de los apóstoles
							ncn.certeza = dato < 0 || dato > 100; // Si el año es mayor o igual a cero, hay certeza sobre el resultado
							if (ncn.certeza) ncn.dato = true; // Si hay certeza sobre el resultado, el resultado es true

							// Aparición Mariana
							ama.certeza = dato < 1100; // Si el año es menor o igual a 1100, hay certeza sobre el resultado
							if (ama.certeza) ama.dato = false; // Sabemos que en ese caso el resultado es false
						} else jss.certeza = cnt.certeza = ncn.certeza = ama.certeza = false;

						// Fin
						return {jss, cnt, ncn, ama};
					};
					let muestraOculta = (datos, campo) => {
						// Situaciones en las que se oculta el sector
						if (datos.certeza) {
							// Oculta el sector
							v["sector_" + campo].classList.add("ocultaPorAno");
							// Completa el dato
							datos.dato ? (v[campo][0].checked = true) : (v[campo][1].checked = true);
						} else {
							v["sector_" + campo].classList.remove("ocultaPorAno");
							v[campo][0].checked = false;
							v[campo][1].checked = false;
						}
					};

					// Variables
					let {jss, cnt, ncn, ama} = proceso(v.ano.value);

					// Mostrar u ocultar sectores
					muestraOculta(jss, "jss");
					muestraOculta(cnt, "cnt");
					muestraOculta(ncn, "ncn");
					muestraOculta(ama, "ama");

					// Fin
					return;
				},
				jss: async () => {
					// Función
					let proceso= (dato) => {
						// Variables
						let cnt = {},
							ama = {};
				
						// Resultados
						if (dato == "1") {
							// Contemporáneos de Jesús
							cnt.certeza = true; // Si 'jss' es true, hay certeza de que 'cnt' es true
							cnt.dato = true; // Si 'jss' es true, 'cnt' es true también
				
							// Aparición Mariana
							ama.certeza = true; // Si 'jss' es true, hay certeza de que 'ama' es false
							ama.dato = false; // Si 'jss' es true, 'ama' es false
						} else cnt.certeza = ama.certeza = false;
				
						// Fin
						return {cnt, ama};
					}
				
					// Variables
					let dato = v.jss[0].checked ? v.jss[0].value : v.jss[1].checked ? v.jss[1].value : "";
					let {cnt, ama} = proceso(dato)

					// Contemporáneo de Jesús - Situaciones en las que se oculta el sector
					if (cnt.certeza) {
						// Oculta el sector
						v.sector_cnt.classList.add("ocultaPorJSS");
						// Completa el dato de cnt
						cnt.dato ? (v.cnt[0].checked = true) : (v.cnt[1].checked = true);
					} else {
						v.sector_cnt.classList.remove("ocultaPorJSS");
						v.cnt[0].checked = false;
						v.cnt[1].checked = false;
					}

					// Aparición Mariana - Situaciones en las que se oculta el sector
					if (ama.certeza) {
						// Oculta el sector
						v.sector_ama.classList.add("ocultaPorJSS");
						// Completa el dato de ama
						ama.dato ? (v.ama[0].checked = true) : (v.ama[1].checked = true);
					} else {
						v.sector_ama.classList.remove("ocultaPorJSS");
						v.ama[0].checked = false;
						v.ama[1].checked = false;
					}

					// Fin
					return;
				},
				cnt: async () => {
					// Función
					let proceso= (dato) => {
						// Variables
						let ncn = {},
							ama = {};
				
						// Resultados
						if (dato == "0") {
							// Contemporáneos de Jesús
							ncn.certeza = true; // Si 'cnt' es false, hay certeza de que 'ncn' es true
							ncn.dato = true; // Si 'cnt' es false, 'ncn' es true
						} else ncn.certeza = false;
				
						if (dato == "1") {
							// Aparición Mariana
							ama.certeza = true; // Si 'cnt' es true, hay certeza de que 'ama' es false
							ama.dato = false; // Si 'cnt' es true, 'ama' es false
						} else ama.certeza = false;
				
						// Fin
						return {ncn, ama};
					}
				
					// Variable
					let dato = v.cnt[0].checked ? v.cnt[0].value : v.cnt[1].checked ? v.cnt[1].value : "";
					let {ncn, ama} = proceso(dato)

					// Contemporáneo de Jesús - Situaciones en las que se oculta el sector
					if (ncn.certeza) {
						// Oculta el sector
						v.sector_ncn.classList.add("ocultaPorCNT");
						// Completa el dato de cnt
						ncn.dato ? (v.ncn[0].checked = true) : (v.ncn[1].checked = true);
					} else {
						v.sector_ncn.classList.remove("ocultaPorCNT");
						v.ncn[0].checked = false;
						v.ncn[1].checked = false;
					}

					// Aparición Mariana - Situaciones en las que se oculta el sector
					if (ama.certeza) {
						// Oculta el sector
						v.sector_ama.classList.add("ocultaPorCNT");
						// Completa el dato de ama
						ama.dato ? (v.ama[0].checked = true) : (v.ama[1].checked = true);
					} else {
						v.sector_ama.classList.remove("ocultaPorCNT");
						v.ama[0].checked = false;
						v.ama[1].checked = false;
					}

					// Fin
					return;
				},
				ncn: async () => {
					// Variable
					let dato = v.cnt[0].checked ? v.cnt[0].value : v.cnt[1].checked ? v.cnt[1].value : "";

					// Aparición Mariana - Situaciones en las que se oculta el sector
					if (dato == "0") {
						// Oculta el sector
						v.sector_ama.classList.add("ocultaPorNCN");
						// Completa el dato de ama
						v.ama[1].checked = false;
					} else {
						v.sector_ama.classList.remove("ocultaPorCNT");
						v.ama[0].checked = false;
						v.ama[1].checked = false;
					}
				},
			},
			muestraOculta: {
				ocultar: (indice) => {
					for (let i = indice; i < v.cfc.length; i++) v.cfc[i].classList.add("ocultar");
					return;
				},
				obtieneValor: (campo) => {
					// Obtiene el inputElegido
					let input = v[campo];
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
						if (campo == "solo_cfc") {
							if (valor == "0") v.sector_ama.classList.add("ocultaPorNoCFC");
							else v.sector_ama.classList.remove("ocultaPorNoCFC");
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
			// Variables
			let valor = v[campo].value;
			// 1. Primera letra en mayúscula
			v[campo].value = valor.slice(0, 1).toUpperCase() + valor.slice(1);
			valor = v[campo].value;
			// 2. Quita los caracteres no deseados
			v[campo].value = valor.replace(/[^a-záéíóúüñ'\s\d]/gi, "").replace(/ +/g, " ");
			valor = v[campo].value;
			// 3. Quita el prefijo 'San'
			if (campo == "nombre" && v.entidad == "personajes")
				for (let prefijo of v.prefijos) {
					if (valor.startsWith(prefijo + " ")) v[campo].value = valor.slice(prefijo.length + 1);
					valor = v[campo].value;
					break;
				}
			// 4. Quita los caracteres que exceden el largo permitido
			if (valor.length > 30) v[campo].value = valor.slice(0, 30);
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
			if (OK.nombre) procesos.nombre.logosWikiSantopedia();
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
				if (OK.RCLI) await procesos.RCLI[v.entidad].ano();
			}
			// 4.2. Acciones si se cambia el sexo
			if (campo == "sexo_id") procesos.RCLI.personajes.sexo();
			// 4.3. Acciones si se cambia 'jss', 'cnt', o 'ncn'
			if (["jss", "cnt", "ncn"].includes(campo)) await procesos.RCLI.hechos[campo]();
			// Revisa los errores en RCLI
			await validacs.RCLI.consolidado();
			// Muestra y oculta los campos que correspondan
			procesos.RCLI.muestraOculta[v.entidad]();
		}
		// Final de la rutina
		feedback.muestraErroresOK();
		feedback.botonSubmit();
	});
	// Botón submit
	v.botonSubmit.addEventListener("click", async (e) => {
		// Acciones si el botón está inactivo
		if (v.botonSubmit.classList.contains("inactivo")) {
			// Realiza todas las validaciones
			await validacs.nombre.nombreApodo();
			await validacs.fechas();
			validacs.repetido();
			if (!v.valores) await validacs.RCLI.consolidado(true);
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
