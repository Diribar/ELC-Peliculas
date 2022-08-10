"use strict";
window.addEventListener("load", async () => {
	// Varieables que se obtienen del url
	let entidad = new URL(window.location.href).searchParams.get("entidad");
	let id = new URL(window.location.href).searchParams.get("id");
	let origen = new URL(window.location.href).searchParams.get("origen");
	let prodEntidad = new URL(window.location.href).searchParams.get("prodEntidad");
	let prodID = new URL(window.location.href).searchParams.get("prodID");
	// Obtener la entidad en formato booleano
	let personajes = entidad == "personajes";
	let hechos = entidad == "hechos";
	let valores = entidad == "valores";
	// Variables generales
	let dataEntry = document.querySelector("#dataEntry");
	let botonSalir = document.querySelector("#flechas #salir");
	let botonSubmit = document.querySelector("#flechas #submit");
	// Rutas
	let rutaValidacion = "/rclv/api/validar-sector/?sector=";
	let rutaOtrosCasos = "/rclv/api/otros-casos/";
	let rutaSalir =
		origen == "DP"
			? "/producto/agregar/datos-personalizados"
			: origen == "ED"
			? "/producto/edicion/?entidad=" + prodEntidad + "&id=" + prodID
			: "";

	// Links a otros sitios
	let wiki = document.querySelector("#dataEntry #wiki");
	let url_wiki = "https://es.wikipedia.org/wiki/";
	let santopedia = document.querySelector("#dataEntry #santopedia");
	let url_santopedia = "https://www.santopedia.com/buscar?q=";

	// Variables de errores
	let iconoOK = document.querySelectorAll("#dataEntry .OK .fa-circle-check");
	let iconoError = document.querySelectorAll("#dataEntry .OK .fa-circle-xmark");
	let mensajeError = document.querySelectorAll("#dataEntry .OK .mensajeError");
	let OK = {};
	let errores = {};

	// Campos para todos los RCLV
	let camposRCLI = document.querySelectorAll("#dataEntry #preguntas .RCLI");
	camposRCLI = Array.from(camposRCLI).map((n) => n.name);
	for (let i = camposRCLI.length - 1; i > 0; i--)
		if (i > camposRCLI.indexOf(camposRCLI[i])) camposRCLI.splice(i, 1);
	let nombre = document.querySelector("#dataEntry input[name='nombre']");
	let mes_id = document.querySelector("#dataEntry select[name='mes_id']");
	let dia = document.querySelector("#dataEntry select[name='dia']");
	let desconocida = document.querySelector("#dataEntry input[name='desconocida']");
	let posiblesRepetidos = document.querySelector("#dataEntry #posiblesRepetidos");

	// Campos para !valores
	if (!valores) {
		var ano = document.querySelector("#dataEntry input[name='ano']");
		var cfc = document.querySelectorAll("#preguntas .cfc");
		var preguntas = document.querySelector("#dataEntry #preguntas");
	}

	// Campos para personajes
	if (personajes) {
		// Inputs
		var categoria_id = document.querySelectorAll("input[name='categoria_id']");
		var genero = document.querySelectorAll("input[name='genero']");
		var rol_iglesia_id = document.querySelector("select[name='rol_iglesia_id']");
		var enProcCan = document.querySelectorAll("input[name='enProcCan']");
		var proceso_id = document.querySelector("select[name='proceso_id']");
		var cnt = document.querySelectorAll("input[name='cnt']");
		var ap_mar = document.querySelectorAll("input[name='ap_mar']");
		var ap_mar_id = document.querySelector("select[name='ap_mar_id']");
		var santosanta = document.querySelector("#dataEntry #santosanta");
		// Para ocultar
		var sectorGeneroRol = document.querySelector("#preguntas #sectorGeneroRol");
		var sectorRol_iglesia = document.querySelector("#preguntas #sectorRol_iglesia");
		var sectorEnProceso = document.querySelector("#preguntas #sectorEnProceso");
		var sector_cnt = document.querySelector("#preguntas #sector_cnt");
		var sectorAp_mar = document.querySelector("#preguntas #sectorApMar");
	}

	// Campos para hechos
	if (hechos) {
		// Inputs
		var solo_cfc = document.querySelectorAll("input[name='solo_cfc']");
		var jss = document.querySelectorAll("input[name='jss']");
		var cnt = document.querySelectorAll("input[name='cnt']");
		var exclusivo = document.querySelectorAll("input[name='exclusivo']");
		var ap_mar = document.querySelectorAll("input[name='ap_mar']");
		// Para ocultar
		var sector_jss = document.querySelector("#preguntas #sector_jss");
		var sector_cnt = document.querySelector("#preguntas #sector_cnt");
		var sectorExclusivo = document.querySelector("#preguntas #sectorExclusivo");
		var sectorApMar = document.querySelector("#preguntas #sectorApMar");
	}

	// Funciones ************************
	// Validaciones
	let validarNombre = async (tipo) => {
		// Verificar errores en el nombre
		let params = "&nombre=" + nombre.value + "&entidad=" + entidad;
		if (id) params += "&id=" + id;
		errores.nombre = await fetch(rutaValidacion + "nombre" + tipo + params).then((n) => n.json());
		// Consolidar la info
		OK.nombre = !errores.nombre;
		// Fin
		return;
	};
	let validarFechas = async () => {
		// Si se conoce la fecha...
		if (!desconocida.checked) {
			// Se averigua si hay un error con la fecha
			let params = "&mes_id=" + mes_id.value + "&dia=" + dia.value;
			errores.fecha = await fetch(rutaValidacion + "fecha" + params).then((n) => n.json());
			OK.fecha = !errores.fecha;
			// Agregar los registros que tengan esa fecha
			if (OK.fecha) {
				errores.repetidos = await registrosConEsaFecha(mes_id.value, dia.value);
				OK.repetidos = !errores.repetidos;
			} else OK.repetidos = false;
		} else {
			// OK y Errores
			errores.fecha = "";
			errores.repetidos = "";
			OK.fecha = true;
			OK.repetidos = true;
			// Limpia los valores de campos relacionados
			mes_id.value = "";
			dia.value = "";
			posiblesRepetidos.innerHTML = "";
		}
		return;
	};
	let validarRepetido = () => {
		let casos = document.querySelectorAll("#posiblesRepetidos li input");
		errores.repetidos = Array.from(casos).some((n) => n.checked) ? cartelDuplicado : "";
		OK.repetidos = !errores.repetidos;
		return;
	};
	let validarAno = async () => {
		// Se averigua si hay un error con el año
		let params = "&ano=" + ano.value;
		errores.ano = await fetch(rutaValidacion + "ano" + params).then((n) => n.json());
		OK.ano = !errores.ano;
		//
		if (OK.ano) {
			if (personajes) {
				// Contemporáneo de Jesús
				if (ano.value < -50 || ano.value > 100) {
					cnt[1].checked = true;
					cnt[1].disabled = false;
					cnt[0].disabled = true;
					sector_cnt.classList.add("ocultarPorAno");
				} else {
					cnt[0].disabled = false;
					sector_cnt.classList.remove("ocultarPorAno");
				}
				// Aparición Mariana
				if (ano.value < 0) {
					ap_mar[1].checked = true;
					ap_mar[1].disabled = false;
					ap_mar[0].disabled = true;
					sectorAp_mar.classList.add("ocultarPorAno");
				} else {
					ap_mar[0].disabled = false;
					sectorAp_mar.classList.remove("ocultarPorAno");
				}
			}
			if (hechos) {
				// Vida de Jesús
				if (ano.value > 33) {
					jss[1].checked = true;
					jss[1].disabled = false;
					jss[0].disabled = true;
					sector_jss.classList.add("ocultarPorAno");
				} else {
					jss[0].disabled = false;
					sector_jss.classList.remove("ocultarPorAno");
				}
				// Contemp. Jesús
				if (ano.value > 100) {
					cnt[1].checked = true;
					cnt[1].disabled = false;
					cnt[0].disabled = true;
					sector_cnt.classList.add("ocultarPorAno");
				} else {
					cnt[0].disabled = false;
					sector_cnt.classList.remove("ocultarPorAno");
				}
				// Aparición Mariana
				if (ano.value < 33) {
					ap_mar[1].checked = true;
					ap_mar[1].disabled = false;
					ap_mar[0].disabled = true;
					sectorApMar.classList.add("ocultarPorAno");
				} else {
					ap_mar[0].disabled = false;
					sectorApMar.classList.remove("ocultarPorAno");
				}
			}
			preguntas.classList.remove("ocultar");
		} else preguntas.classList.add("ocultar");

		// Fin
		await mostrarRCLI[entidad](false);
		return;
	};
	// Auxiliares
	let diasDelMes = () => {
		// Aplicar cambios en los días 30 y 31
		// Variables
		let dia30 = document.querySelector("select[name='dia'] option[value='30']");
		let dia31 = document.querySelector("select[name='dia'] option[value='31']");

		// Revisar para febrero
		if (mes_id.value == 2) {
			dia30.classList.add("ocultar");
			dia31.classList.add("ocultar");
			if (dia.value > 29) dia.value = "";
		} else {
			// Revisar para los demás meses de 30 días
			dia30.classList.remove("ocultar");
			if (mes_id.value == 4 || mes_id.value == 6 || mes_id.value == 9 || mes_id.value == 11) {
				dia31.classList.add("ocultar");
				if (dia.value > 30) dia.value = "";
			} else dia31.classList.remove("ocultar");
		}
	};
	let registrosConEsaFecha = async () => {
		// Buscar otros casos en esa fecha
		// Obtener los casos
		let params = "?mes_id=" + mes_id.value + "&dia=" + dia.value + "&entidad=" + entidad;
		if (id) params += "&id=" + id;
		let casos = await fetch(rutaOtrosCasos + params).then((n) => n.json());
		// Si no hay, mensaje de "no hay casos"
		if (!casos.length) {
			posiblesRepetidos.innerHTML = "¡No hay otros casos!";
			posiblesRepetidos.classList.add("sinCasos");
			return "";
		} else {
			// Si hay, mostrarlos
			posiblesRepetidos.innerHTML = "";
			posiblesRepetidos.classList.remove("sinCasos");
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
				posiblesRepetidos.appendChild(li);
			}
			return "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
		}
	};
	let funcionGenero = () => {
		// Definir variables
		let generoElegido = genero[0].checked ? genero[0].value : genero[1].checked ? genero[1].value : "";
		if (generoElegido) {
			// Actualizar el género de la leyenda 'Santo o en proceso de canonización'
			let letraActual = generoElegido == "V" ? "o" : "a";
			let letraAnterior = generoElegido == "V" ? "a" : "o";
			if (santosanta.innerHTML.includes("ant" + letraAnterior))
				santosanta.innerHTML = santosanta.innerHTML.replace(
					"ant" + letraAnterior,
					"ant" + letraActual
				);
			// Dejar solamente las opciones alineadas con el género
			let opciones_proc = document.querySelectorAll("select[name='proceso_id'] option");
			opciones_proc.forEach((n) =>
				n.value.length < 2 || n.value[2] != generoElegido
					? n.classList.add("ocultar")
					: n.classList.remove("ocultar")
			);
			let opciones_rol = document.querySelectorAll("select[name='rol_iglesia_id'] option");
			opciones_rol.forEach((n) =>
				n.value.length < 2 || n.value[2] != generoElegido
					? n.classList.add("ocultar")
					: n.classList.remove("ocultar")
			);
			// Cambiar la opción anterior por el nuevo genero
			// Proceso de canonización
			if (proceso_id.value && proceso_id.value.length != 2 && proceso_id.value[2] != generoElegido)
				proceso_id.value = proceso_id.value.slice(0, 2) + generoElegido;
			// Rol en la Iglesia
			if (
				rol_iglesia_id.value &&
				rol_iglesia_id.value.length != 2 &&
				rol_iglesia_id.value[2] != generoElegido
			) {
				rol_iglesia_id.value = rol_iglesia_id.value.slice(0, 2) + generoElegido;
				if (rol_iglesia_id.value == "") rol_iglesia_id.value = "";
			}
		}
		return;
	};
	let mostrarRCLI = {
		personajes: async function (mostrarErrores) {
			let num = -1;
			let params = "&entidad=" + entidad;
			let inputCategID, inputGenero, inputRol, inputProcCan, inputProcID, inputCnt, inputAM, AM_id;
			// categoria_id
			[params, inputCategID] = this.inputRadio(params, num, "categoria_id", categoria_id);
			// Género
			num++;
			if (inputCategID != "CFC") this.limpiar(num);
			else {
				[params, inputGenero] = this.inputRadio(params, num, "genero", genero);
				// Rol en la Iglesia
				num++;
				if (!inputGenero) this.limpiar(num);
				else {
					[params, inputRol] = this.inputSelect(params, num, "rol_iglesia_id", rol_iglesia_id);
					// En proceso de canonización
					num++;
					if (!inputRol) this.limpiar(num);
					else {
						[params, inputProcCan] = this.inputRadio(params, num, "enProcCan", enProcCan);
						// Proceso de canonizacion ID
						num++;
						if (!inputProcCan) this.limpiar(num);
						else {
							if (inputProcCan == "1")
								[params, inputProcID] = this.inputSelect(
									params,
									num,
									"proceso_id",
									proceso_id
								);
							else cfc[num].classList.add("ocultar");
							// Contemporáneo
							num++;
							if (inputProcCan != "0" && !inputProcID) this.limpiar(num);
							else {
								[params, inputCnt] = this.inputRadio(params, num, "cnt", cnt);
								// Aparición mariana - SI/NO
								num++;
								if (!inputCnt) this.limpiar(num);
								else {
									[params, inputAM] = this.inputRadio(params, num, "ap_mar", ap_mar);
									// Aparición mariana - Cuál
									num++;
									if (inputAM != "1") this.limpiar(num);
									else
										[params, AM_id] = this.inputSelect(
											params,
											num,
											"ap_mar_id",
											ap_mar_id
										);
								}
							}
						}
					}
				}
			}
			// OK y Errores
			errores.RCLI = await fetch(rutaValidacion + "RCLI_personaje" + params).then((n) => n.json());
			OK.RCLI = !errores.RCLI;
			if (!mostrarErrores) errores.RCLI = "";

			// Fin
			return;
		},
		hechos: async function (mostrarErrores) {
			let num = -1;
			let params = "&entidad=" + entidad;
			let inputCFC, inputJSS, inputCNT, inputEXC, inputAM;
			// Sólo CFC
			[params, inputCFC] = this.inputRadio(params, num, "solo_cfc", solo_cfc);
			// Jesús
			num++;
			if (inputCFC != "1") this.limpiar(num);
			else {
				[params, inputJSS] = this.inputRadio(params, num, "jss", jss);
				// Contemporaneos
				num++;
				if (!inputJSS) this.limpiar(num);
				else {
					if (inputJSS == "1") {
						cnt[0].checked = true;
						cnt[0].disabled = false;
						cnt[1].disabled = true;
						sector_cnt.classList.add("ocultarPorRCLI");
					} else {
						cnt[1].disabled = false;
						sector_cnt.classList.remove("ocultarPorRCLI");
					}
					[params, inputCNT] = this.inputRadio(params, num, "cnt", cnt);
					// Exclusivo
					num++;
					if (inputJSS != "1" && inputCNT != "1") this.limpiar(num);
					else [params, inputEXC] = this.inputRadio(params, num, "exclusivo", exclusivo);
					// Aparición Mariana
					num++;
					if (inputJSS != "0" || inputCNT != "0") this.limpiar(num);
					else [params, inputAM] = this.inputRadio(params, num, "ap_mar", ap_mar);
				}
			}
			// OK y Errores
			errores.RCLI = await fetch(rutaValidacion + "RCLI_hecho" + params).then((n) => n.json());
			OK.RCLI = !errores.RCLI;
			if (!mostrarErrores) errores.RCLI = "";

			// Fin
			return;
		},
		limpiar: (num) => {
			for (let i = num; i < cfc.length; i++) cfc[i].classList.add("ocultar");
			return;
		},
		inputRadio: (params, num, campo, input) => {
			if (num >= 0) cfc[num].classList.remove("ocultar");
			let inputElegido = input[0].checked ? input[0].value : input[1].checked ? input[1].value : "";
			params += "&" + campo + "=" + inputElegido;
			return [params, inputElegido];
		},
		inputSelect: (params, num, campo, input) => {
			cfc[num].classList.remove("ocultar");
			params += "&" + campo + "=" + input.value;
			return [params, input.value];
		},
	};
	let startUp = async () => {
		if (nombre.value) await validarNombre("Completo");
		if (mes_id.value) diasDelMes(mes_id, dia);
		if ((mes_id.value && dia.value) || desconocida.checked) {
			await validarFechas();
			validarRepetido();
		}
		if (ano && ano.value) await validarAno();
		if (!valores) {
			if (personajes && categoria_id[0].checked) funcionGenero();
			await mostrarRCLI[entidad](false);
		}
	};
	let feedback = (OK, errores, ocultarOK) => {
		// Definir las variables
		let sectores = ["nombre", "fecha", "repetidos"];
		if (!valores) sectores.push("ano", "RCLI");
		// Rutina
		sectores.forEach((sector, i) => {
			// Ícono de OK
			OK[sector] && (sector != "nombre" || !ocultarOK)
				? iconoOK[i].classList.remove("ocultar")
				: iconoOK[i].classList.add("ocultar");
			// Ícono de error
			errores[sector]
				? iconoError[i].classList.remove("ocultar")
				: iconoError[i].classList.add("ocultar");
			// Mensaje de error
			mensajeError[i].innerHTML = errores[sector] ? errores[sector] : "";
		});
		// Mostrar logo de Wikipedia
		if (OK.nombre) wiki.classList.remove("ocultar");
		else wiki.classList.add("ocultar");
		// Conclusiones
		let resultado = Object.values(OK);
		let resultadoTrue = resultado.length
			? resultado.reduce((a, b) => {
					return !!a && !!b;
			  })
			: false;
		// Alterar el botón submit
		resultadoTrue && resultado.length == sectores.length
			? botonSubmit.classList.remove("inactivo")
			: botonSubmit.classList.add("inactivo");
	};

	// Add Event Listeners - compatible RCLV x 3
	dataEntry.addEventListener("input", async (e) => {
		let campo = e.target.name;
		if (campo == "nombre") {
			nombre.value = nombre.value.replace(/[^a-záéíóúüñ'\s]/gi, "").replace(/ +/g, " ");
			if (nombre.value.length > 30) nombre.value = nombre.value.slice(0, 30);
			wiki.href = url_wiki + nombre.value;
			santopedia.href = url_santopedia + nombre.value;
			await validarNombre("Express");
			feedback(OK, errores, true);
		}
		if (campo == "ano") {
			ano.value = ano.value.replace(/[^-\d]/g, "");
			if (ano.value.lastIndexOf("-") > 0) ano.value = ano.value.replace(/[-]/g, "");
			if (parseInt(ano.value) > new Date().getFullYear()) ano.value = new Date().getFullYear();
			if (parseInt(ano.value) < -32768) ano.value = -32768;
		}
	});
	dataEntry.addEventListener("change", async (e) => {
		let campo = e.target.name;
		// Campos para todos los RCLV
		if (campo == "nombre") await validarNombre("Completo");
		if (campo == "mes_id") diasDelMes();
		if (
			(campo == "mes_id" || campo == "dia" || campo == "desconocida") &&
			((mes_id.value && dia.value) || desconocida.checked)
		)
			await validarFechas();
		if (campo == "repetido") validarRepetido();
		// Campos para !valores
		if (!valores && campo == "ano") await validarAno();
		// Campos RCLI
		if (personajes && campo == "genero") funcionGenero();
		if (!valores && camposRCLI.includes(campo)) await mostrarRCLI[entidad](false);
		// Final de la rutina
		feedback(OK, errores);
	});
	botonSubmit.addEventListener("click", async (e) => {
		if (botonSubmit.classList.contains("inactivo")) {
			await validarNombre("Completo");
			await validarFechas();
			validarRepetido();
			if (!valores) {
				await validarAno();
				await mostrarRCLI[entidad](true);
			}
			feedback(OK, errores);
		} else {
			// Grabar cambios e ir a la vista de origen
			dataEntry.submit();
		}
	});
	botonSalir.addEventListener("click", () => {
		// Ir a la vista de origen sin guardar cambios
		window.location.href = rutaSalir;
	});

	// Status inicial
	await startUp();
	feedback(OK, errores);
});

let cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
