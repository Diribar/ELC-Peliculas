"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Variables que se obtienen del url
		entidad: new URL(window.location.href).searchParams.get("entidad"),
		id: new URL(window.location.href).searchParams.get("id"),
		// Variables generales
		dataEntry: document.querySelector("#dataEntry"),
		botonSalir: document.querySelector("#flechas #salir"),
		botonSubmit: document.querySelector("#flechas #submit"),
		// Rutas
		rutaValidacion: "/rclv/api/validar-sector/?funcion=",
		rutaOtrosCasos: "/rclv/api/otros-casos/",
		// Links a otros sitios
		wiki: document.querySelector("#dataEntry #wiki"),
		url_wiki: "https://es.wikipedia.org/wiki/",
		santopedia: document.querySelector("#dataEntry #santopedia"),
		url_santopedia: "https://www.santopedia.com/buscar?q=",
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
		camposRCLI: () => {
			// Obtiene todos los campos RCLI
			let campos = document.querySelectorAll("#dataEntry #preguntas .RCLI");
			campos = Array.from(campos).map((n) => n.name);
			// Elimina los duplicados que existan de los nombres
			for (let i = campos.length - 1; i > 0; i--)
				if (i > campos.indexOf(campos[i])) campos.splice(i, 1);
			return campos;
		},
		// Botón salir
		origen: new URL(window.location.href).searchParams.get("origen"),
		prodEntidad: new URL(window.location.href).searchParams.get("prodEntidad"),
		prodID: new URL(window.location.href).searchParams.get("prodID"),
		rdp: "agregar/datos-personalizados",
		vista: () => {
			let vista = window.location.pathname;
			vista = vista.slice(0, vista.lastIndexOf("/"));
			return vista;
		},
	};
	v = {
		...v,
		// Obtener la entidad en formato booleano
		personajes: v.entidad == "personajes",
		hechos: v.entidad == "hechos",
		valores: v.entidad == "valores",
		// Botón salir
		entidadID: "?entidad=" + v.entidad + "&id=" + v.id,
		prodEntidadID: "&prodEntidad=" + v.prodEntidad + "&prodID=" + v.prodID,
		rutaOrigen: "/producto/" + (v.origen == "DP" ? v.rdp : v.origen == "ED" ? "edicion/" : "detalle/"),
	};
	let OK = {};
	let errores = {};

	// Valores para !valores
	if (!v.valores) {
		v.ano = document.querySelector("#dataEntry input[name='ano']");
		v.cfc = document.querySelectorAll("#preguntas .cfc");
		v.preguntas = document.querySelector("#dataEntry #preguntas");
	}
	// Valores para personajes
	if (v.personajes) {
		// Inputs
		v.apodo = document.querySelector("#dataEntry input[name='apodo']");
		v.categoria_id = document.querySelectorAll("input[name='categoria_id']");
		v.sexo_id = document.querySelectorAll("input[name='sexo_id']");
		v.rol_iglesia_id = document.querySelector("select[name='rol_iglesia_id']");
		v.enProcCan = document.querySelectorAll("input[name='enProcCan']");
		v.proceso_id = document.querySelector("select[name='proceso_id']");
		v.cnt = document.querySelectorAll("input[name='cnt']");
		v.ap_mar = document.querySelectorAll("input[name='ap_mar']");
		v.ap_mar_id = document.querySelector("select[name='ap_mar_id']");
		v.santosanta = document.querySelector("#dataEntry #santosanta");
		// Para ocultar
		v.sector_cnt = document.querySelector("#preguntas #sector_cnt");
		v.sectorAp_mar = document.querySelector("#preguntas #sectorApMar");
	}
	// Valores para hechos
	if (v.hechos) {
		// Inputs
		v.solo_cfc = document.querySelectorAll("input[name='solo_cfc']");
		v.jss = document.querySelectorAll("input[name='jss']");
		v.cnt = document.querySelectorAll("input[name='cnt']");
		v.exclusivo = document.querySelectorAll("input[name='exclusivo']");
		v.ap_mar = document.querySelectorAll("input[name='ap_mar']");
		// Para ocultarrutaValidacion
		v.sector_jss = document.querySelector("#preguntas #sector_jss");
		v.sector_cnt = document.querySelector("#preguntas #sector_cnt");
		v.sectorApMar = document.querySelector("#preguntas #sectorApMar");
	}

	// Funciones
	let validar = {
		nombre: async () => {
			// Verifica errores en el sector 'nombre', campo 'nombre'
			let params = "&nombre=" + v.nombre.value;
			errores.nombre = await fetch(v.rutaValidacion + "nombre" + params).then((n) => n.json());
			if (errores.nombre) OK.nombre = false;
			// Fin
			return;
		},
		apodo: async () => {
			// Verifica errores en el sector 'nombre', campo 'apodo'
			let params = "&apodo=" + v.apodo.value;
			errores.nombre = await fetch(v.rutaValidacion + "apodo" + params).then((n) => n.json());
			if (errores.nombre) OK.nombre = false;
			// Fin
			return;
		},
		nombreApodo: async () => {
			// Verifica errores en el sector 'nombre'
			let params = "&nombre=" + v.nombre.value + "&entidad=" + v.entidad;
			if (v.personajes) params += "&apodo=" + v.apodo.value;
			if (v.id) params += "&id=" + v.id;
			errores.nombre = await fetch(v.rutaValidacion + "nombreApodo" + params).then((n) => n.json());
			// Consolidar la info
			OK.nombre = !errores.nombre;
			// Fin
			return;
		},
		fechas: async () => {
			// Si se conoce la fecha...
			if (!v.desconocida.checked) {
				// Se averigua si hay un error con la fecha
				let params = "&mes_id=" + v.mes_id.value + "&dia=" + v.dia.value;
				errores.fecha = await fetch(v.rutaValidacion + "fecha" + params).then((n) => n.json());
				OK.fecha = !errores.fecha;
				// Agregar los registros que tengan esa fecha
				if (OK.fecha) {
					errores.repetidos = await registrosConEsaFecha(v.mes_id.value, v.dia.value);
					OK.repetidos = !errores.repetidos;
				} else OK.repetidos = false;
			} else {
				// OK y Errores
				errores.fecha = "";
				errores.repetidos = "";
				OK.fecha = true;
				OK.repetidos = true;
				// Limpia los valores de campos relacionados
				v.mes_id.value = "";
				v.dia.value = "";
				v.posiblesRepetidos.innerHTML = "";
			}
			return;
		},
		repetido: () => {
			let casos = document.querySelectorAll("#posiblesRepetidos li input");
			errores.repetidos = Array.from(casos).some((n) => n.checked) ? cartelDuplicado : "";
			OK.repetidos = !errores.repetidos;
			return;
		},
		ano: async () => {
			// Se averigua si hay un error con el año
			let params = "&ano=" + v.ano.value;
			errores.ano = await fetch(v.rutaValidacion + "ano" + params).then((n) => n.json());
			OK.ano = !errores.ano;
			//
			if (OK.ano) {
				if (v.personajes) {
					// Contemporáneo de Jesús
					if (v.ano.value < -50 || v.ano.value > 100) {
						v.cnt[1].checked = true;
						v.cnt[1].disabled = false;
						v.cnt[0].disabled = true;
						v.sector_cnt.classList.add("ocultarPorAno");
					} else {
						v.cnt[0].disabled = false;
						v.sector_cnt.classList.remove("ocultarPorAno");
					}
					// Aparición Mariana
					if (v.ano.value < 0) {
						v.ap_mar[1].checked = true;
						v.ap_mar[1].disabled = false;
						v.ap_mar[0].disabled = true;
						v.sectorAp_mar.classList.add("ocultarPorAno");
					} else {
						v.ap_mar[0].disabled = false;
						v.sectorAp_mar.classList.remove("ocultarPorAno");
					}
				}
				if (v.hechos) {
					// Vida de Jesús
					if (v.ano.value > 33) {
						v.jss[1].checked = true;
						v.jss[1].disabled = false;
						v.jss[0].disabled = true;
						v.sector_jss.classList.add("ocultarPorAno");
					} else {
						v.jss[0].disabled = false;
						v.sector_jss.classList.remove("ocultarPorAno");
					}
					// Contemp. Jesús
					if (v.ano.value > 100) {
						v.cnt[1].checked = true;
						v.cnt[1].disabled = false;
						v.cnt[0].disabled = true;
						v.sector_cnt.classList.add("ocultarPorAno");
					} else {
						v.cnt[0].disabled = false;
						v.sector_cnt.classList.remove("ocultarPorAno");
					}
					// Aparición Mariana
					if (v.ano.value < 33) {
						v.ap_mar[1].checked = true;
						v.ap_mar[1].disabled = false;
						v.ap_mar[0].disabled = true;
						v.sectorApMar.classList.add("ocultarPorAno");
					} else {
						v.ap_mar[0].disabled = false;
						v.sectorApMar.classList.remove("ocultarPorAno");
					}
				}
				v.preguntas.classList.remove("ocultar");
			} else v.preguntas.classList.add("ocultar");

			// Fin
			await mostrarRCLI[v.entidad](false);
			return;
		},
	};
	let diasDelMes = () => {
		// Aplicar cambios en los días 30 y 31
		// Variables
		let dia30 = document.querySelector("select[name='dia'] option[value='30']");
		let dia31 = document.querySelector("select[name='dia'] option[value='31']");

		// Revisar para febrero
		if (v.mes_id.value == 2) {
			dia30.classList.add("ocultar");
			dia31.classList.add("ocultar");
			if (v.dia.value > 29) dia.value = "";
		} else {
			// Revisar para los demás meses de 30 días
			dia30.classList.remove("ocultar");
			if (v.mes_id.value == 4 || v.mes_id.value == 6 || v.mes_id.value == 9 || v.mes_id.value == 11) {
				dia31.classList.add("ocultar");
				if (v.dia.value > 30) dia.value = "";
			} else dia31.classList.remove("ocultar");
		}
	};
	let registrosConEsaFecha = async () => {
		// Buscar otros casos en esa fecha
		// Obtener los casos
		let params = "?mes_id=" + v.mes_id.value + "&dia=" + v.dia.value + "&entidad=" + v.entidad;
		if (v.id) params += "&id=" + v.id;
		let casos = await fetch(v.rutaOtrosCasos + params).then((n) => n.json());
		// Si no hay, mensaje de "no hay casos"
		if (!casos.length) {
			v.posiblesRepetidos.innerHTML = "¡No hay otros casos!";
			v.posiblesRepetidos.classList.add("sinCasos");
			return "";
		} else {
			// Si hay, mostrarlos
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
			return "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
		}
	};
	let funcionSexo = () => {
		// Definir variables
		let sexoElegido = v.sexo_id[0].checked
			? v.sexo_id[0].value
			: v.sexo_id[1].checked
			? v.sexo_id[1].value
			: "";
		if (sexoElegido) {
			// Actualizar el sexo de la leyenda 'Santo o en proceso de canonización'
			let letraActual = sexoElegido == "V" ? "o" : "a";
			let letraAnterior = sexoElegido == "V" ? "a" : "o";
			if (v.santosanta.innerHTML.includes("ant" + letraAnterior))
				v.santosanta.innerHTML = v.santosanta.innerHTML.replace(
					"ant" + letraAnterior,
					"ant" + letraActual
				);
			// Dejar solamente las opciones alineadas con el sexo
			let opciones_proc = document.querySelectorAll("select[name='proceso_id'] option");
			opciones_proc.forEach((n) =>
				n.value.length < 2 || n.value[2] != sexoElegido
					? n.classList.add("ocultar")
					: n.classList.remove("ocultar")
			);
			let opciones_rol = document.querySelectorAll("select[name='rol_iglesia_id'] option");
			opciones_rol.forEach((n) =>
				n.value.length < 2 || n.value[2] != sexoElegido
					? n.classList.add("ocultar")
					: n.classList.remove("ocultar")
			);
			// Cambiar la opción anterior por el nuevo sexo_id
			// Proceso de canonización
			if (v.proceso_id.value && v.proceso_id.value.length != 2 && v.proceso_id.value[2] != sexoElegido)
				v.proceso_id.value = v.proceso_id.value.slice(0, 2) + sexoElegido;
			// Rol en la Iglesia
			if (
				v.rol_iglesia_id.value &&
				v.rol_iglesia_id.value.length != 2 &&
				v.rol_iglesia_id.value[2] != sexoElegido
			) {
				v.rol_iglesia_id.value = v.rol_iglesia_id.value.slice(0, 2) + sexoElegido;
				if (v.rol_iglesia_id.value == "") v.rol_iglesia_id.value = "";
			}
		}
		return;
	};
	let mostrarRCLI = {
		personajes: async function (mostrarErrores) {
			let num = -1;
			let params = "&entidad=" + v.entidad;
			let inputCategID, inputGenero, inputRol, inputProcCan, inputProcID, inputCnt, inputAM, AM_id;
			// categoria_id
			[params, inputCategID] = this.inputRadio(params, num, "categoria_id", v.categoria_id);
			// Sexo
			num++;
			if (inputCategID != "CFC") this.limpiar(num);
			else {
				[params, inputGenero] = this.inputRadio(params, num, "sexo_id", v.sexo_id);
				// Rol en la Iglesia
				num++;
				if (!inputGenero) this.limpiar(num);
				else {
					[params, inputRol] = this.inputSelect(params, num, "rol_iglesia_id", v.rol_iglesia_id);
					// En proceso de canonización
					num++;
					if (!inputRol) this.limpiar(num);
					else {
						[params, inputProcCan] = this.inputRadio(params, num, "enProcCan", v.enProcCan);
						// Proceso de canonizacion ID
						num++;
						if (!inputProcCan) this.limpiar(num);
						else {
							if (inputProcCan == "1")
								[params, inputProcID] = this.inputSelect(
									params,
									num,
									"proceso_id",
									v.proceso_id
								);
							else v.cfc[num].classList.add("ocultar");
							// Contemporáneo
							num++;
							if (inputProcCan != "0" && !inputProcID) this.limpiar(v.num);
							else {
								[params, inputCnt] = this.inputRadio(params, num, "cnt", v.cnt);
								// Aparición mariana - SI/NO
								num++;
								if (!inputCnt) this.limpiar(num);
								else {
									[params, inputAM] = this.inputRadio(params, num, "ap_mar", v.ap_mar);
									// Aparición mariana - Cuál
									num++;
									if (inputAM != "1") this.limpiar(num);
									else
										[params, AM_id] = this.inputSelect(
											params,
											num,
											"ap_mar_id",
											v.ap_mar_id
										);
								}
							}
						}
					}
				}
			}
			// OK y Errores
			errores.RCLI = await fetch(v.rutaValidacion + "RCLI_personaje" + params).then((n) => n.json());
			OK.RCLI = !errores.RCLI;
			if (!mostrarErrores) errores.RCLI = "";

			// Fin
			return;
		},
		hechos: async function (mostrarErrores) {
			let num = -1;
			let params = "&entidad=" + v.entidad;
			let inputCFC, inputJSS, inputCNT, inputEXC, inputAM;
			// Sólo CFC
			[params, inputCFC] = this.inputRadio(params, num, "solo_cfc", v.solo_cfc);
			// Jesús
			num++;
			if (inputCFC != "1") this.limpiar(num);
			else {
				[params, inputJSS] = this.inputRadio(params, num, "jss", v.jss);
				// Contemporaneos
				num++;
				if (!inputJSS) this.limpiar(num);
				else {
					if (inputJSS == "1") {
						v.cnt[0].checked = true;
						v.cnt[0].disabled = false;
						v.cnt[1].disabled = true;
						sector_cnt.classList.add("ocultarPorRCLI");
					} else {
						v.cnt[1].disabled = false;
						sector_cnt.classList.remove("ocultarPorRCLI");
					}
					[params, inputCNT] = this.inputRadio(params, num, "cnt", v.cnt);
					// Exclusivo
					num++;
					if (inputJSS != "1" && inputCNT != "1") this.limpiar(num);
					else [params, inputEXC] = this.inputRadio(params, num, "exclusivo", v.exclusivo);
					// Aparición Mariana
					num++;
					if (inputJSS != "0" || inputCNT != "0") this.limpiar(num);
					else [params, inputAM] = this.inputRadio(params, num, "ap_mar", v.ap_mar);
				}
			}
			// OK y Errores
			errores.RCLI = await fetch(v.rutaValidacion + "RCLI_hecho" + params).then((n) => n.json());
			OK.RCLI = !errores.RCLI;
			if (!mostrarErrores) errores.RCLI = "";

			// Fin
			return;
		},
		limpiar: (num) => {
			for (let i = num; i < v.cfc.length; i++) v.cfc[i].classList.add("ocultar");
			return;
		},
		inputRadio: (params, num, campo, input) => {
			if (num >= 0) v.cfc[num].classList.remove("ocultar");
			let inputElegido = input[0].checked ? input[0].value : input[1].checked ? input[1].value : "";
			params += "&" + campo + "=" + inputElegido;
			return [params, inputElegido];
		},
		inputSelect: (params, num, campo, input) => {
			v.cfc[num].classList.remove("ocultar");
			params += "&" + campo + "=" + input.value;
			return [params, input.value];
		},
	};
	let startUp = async () => {
		if (v.nombre.value && v.apodo.value) await validar.nombreApodo();
		if (v.mes_id.value) diasDelMes(v.mes_id, v.dia);
		if ((v.mes_id.value && v.dia.value) || v.desconocida.checked) {
			await validar.fechas();
			validar.repetido();
		}
		if (v.ano && v.ano.value) await validar.ano();
		if (!v.valores) {
			if (v.personajes && v.categoria_id[0].checked) funcionSexo();
			if (
				(v.personajes && (v.categoria_id[0].checked || v.categoria_id[1].checked)) ||
				(v.hechos && (v.solo_cfc[0].checked || v.solo_cfc[1].checked))
			)
				await mostrarRCLI[v.entidad](false);
		}
	};
	let feedback = (OK, errores, ocultarOK) => {
		// Definir las variables
		let sectores = ["nombre", "fecha", "repetidos"];
		if (!v.valores) sectores.push("ano", "RCLI");
		// Rutina
		sectores.forEach((sector, i) => {
			// Ícono de OK
			OK[sector] && (sector != "nombre" || !ocultarOK)
				? v.iconoOK[i].classList.remove("ocultar")
				: v.iconoOK[i].classList.add("ocultar");
			// Ícono de error
			errores[sector]
				? v.iconoError[i].classList.remove("ocultar")
				: v.iconoError[i].classList.add("ocultar");
			// Mensaje de error
			v.mensajeError[i].innerHTML = errores[sector] ? errores[sector] : "";
		});
		// Mostrar logo de Wikipedia
		if (OK.nombre) v.wiki.classList.remove("ocultar");
		else v.wiki.classList.add("ocultar");
		// Conclusiones
		let resultado = Object.values(OK);
		let resultadoTrue = resultado.length
			? resultado.reduce((a, b) => {
					return !!a && !!b;
			  })
			: false;
		// Alterar el botón submit
		resultadoTrue && resultado.length == sectores.length
			? v.botonSubmit.classList.remove("inactivo")
			: v.botonSubmit.classList.add("inactivo");
	};

	// Add Event Listeners - compatible RCLV x 3
	v.dataEntry.addEventListener("input", async (e) => {
		let campo = e.target.name;
		if (campo == "nombre") {
			// Quita los caracteres no deseados
			v.nombre.value = v.nombre.value.replace(/[^a-záéíóúüñ'\s]/gi, "").replace(/ +/g, " ");
			// Quita los caracteres que exceden el largo permitido
			if (v.nombre.value.length > 30) v.nombre.value = v.nombre.value.slice(0, 30);
			// Agrega el link a los íconos de búsqueda
			if (v.nombre.value.length > 3) {
				v.wiki.href = v.url_wiki + v.nombre.value;
				v.santopedia.href = v.url_santopedia + v.nombre.value;
			}
			// Revisa los errores y los publica si existen
			await validar.nombre();
			feedback(OK, errores, true);
		}
		if (campo == "apodo") {
			// Quita los caracteres no deseados
			v.apodo.value = v.apodo.value.replace(/[^a-záéíóúüñ'\s]/gi, "").replace(/ +/g, " ");
			// Quita los caracteres que exceden el largo permitido
			if (v.apodo.value.length > 30) v.apodo.value = v.apodo.value.slice(0, 30);
			// Revisa los errores y los publica si existen
			await validar.apodo();
			feedback(OK, errores, true);
		}
		if (campo == "ano") {
			v.ano.value = v.ano.value.replace(/[^-\d]/g, "");
			if (v.ano.value.lastIndexOf("-") > 0) v.ano.value = v.ano.value.replace(/[-]/g, "");
			if (parseInt(v.ano.value) > new Date().getFullYear()) v.ano.value = new Date().getFullYear();
			if (parseInt(v.ano.value) < -32768) v.ano.value = -32768;
		}
	});
	v.dataEntry.addEventListener("change", async (e) => {
		let campo = e.target.name;
		// Campos para todos los RCLV
		if ((campo == "nombre" || campo == "apodo") && v.nombre.value && (!v.apodo || v.apodo.value))
			await validar.nombreApodo();
		if (campo == "mes_id") diasDelMes();
		if (
			(campo == "mes_id" || campo == "dia" || campo == "desconocida") &&
			((v.mes_id.value && v.dia.value) || v.desconocida.checked)
		)
			await validar.fechas();
		if (campo == "repetido") validar.repetido();
		// Campos para !valores
		if (!v.valores && campo == "ano") await validar.ano();
		// Campos RCLI
		if (v.personajes && campo == "sexo_id") funcionSexo();
		if (!v.valores && v.camposRCLI().includes(campo)) await mostrarRCLI[v.entidad](false);
		// Final de la rutina
		feedback(OK, errores);
	});
	v.botonSalir.addEventListener("click", () => {
		// Ruta salir
		let rutaSalir =
			v.vista() == "/rclv/agregar"
				? // Va a la vista de origen
				  v.rutaOrigen + (v.origen != "DP" ? "?entidad=" + v.prodEntidad + "&id=" + v.prodID : "")
				: // Inactivar e ir a la vista de origen
				  "/inactivar-captura/" + v.entidadID + "&origen=" + v.origen + v.prodEntidadID;
		// Va a la vista de origen sin guardar cambios
		window.location.href = rutaSalir;
	});
	v.botonSubmit.addEventListener("click", async (e) => {
		if (v.botonSubmit.classList.contains("inactivo")) {
			await validar.nombre("Completo");
			await validar.fechas();
			validar.repetido();
			if (!v.valores) {
				await validar.ano();
				await mostrarRCLI[v.entidad](true);
			}
			feedback(OK, errores);
		} else {
			// Grabar cambios e ir a la vista de origen
			v.dataEntry.submit();
		}
	});

	// Status inicial
	await startUp();
	feedback(OK, errores);
});

let cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
