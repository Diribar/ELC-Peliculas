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
		camposRCLI: (() => {
			// Obtiene todos los campos RCLI
			let campos = document.querySelectorAll("#dataEntry #preguntas .RCLI");
			campos = Array.from(campos).map((n) => n.name);
			// Elimina los duplicados que existan de los nombres
			for (let i = campos.length - 1; i > 0; i--)
				if (i > campos.indexOf(campos[i])) campos.splice(i, 1);
			return campos;
		})(),
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
		v.preguntas = document.querySelector("#dataEntry #preguntas");
		v.ano = document.querySelector("#dataEntry input[name='ano']");
		v.ama = document.querySelectorAll("input[name='ama']");
		v.cnt = document.querySelectorAll("input[name='cnt']");
		// Para ocultar
		v.sectorAp_mar = document.querySelector("#preguntas #sectorApMar");
		v.sector_cnt = document.querySelector("#preguntas #sector_cnt");
	}
	// Valores para personajes
	if (v.personajes) {
		v.apodo = document.querySelector("#dataEntry input[name='apodo']");
		v.campos = [
			"ano",
			"sexo_id",
			"categoria_id",
			"rol_iglesia_id",
			"enProcCan",
			"proceso_id",
			"cnt",
			"ama",
			"ap_mar_id",
		];
		// Inputs
		v.categoria_id = document.querySelectorAll("input[name='categoria_id']");
		v.sexo_id = document.querySelectorAll("input[name='sexo_id']");
		v.rol_iglesia_id = document.querySelector("select[name='rol_iglesia_id']");
		v.enProcCan = document.querySelectorAll("input[name='enProcCan']");
		v.proceso_id = document.querySelector("select[name='proceso_id']");
		v.ap_mar_id = document.querySelector("select[name='ap_mar_id']");
		// Para ocultar
		v.santosanta = document.querySelector("#dataEntry #santosanta");
	}
	// Valores para hechos
	if (v.hechos) {
		v.campos = ["solo_cfc", "jss", "cnt", "ncn", "ama"];
		// Inputs
		v.solo_cfc = document.querySelectorAll("input[name='solo_cfc']");
	}

	// Funciones
	let validaciones = {
		nombre: {
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
		RCLI:{
			personajes: async function (mostrarErrores) {
				// Variables
				let params = "&entidad=" + v.entidad;
				let inputs = {};
				// Rutina
				for (let indice = 0; indice < v.campos.length; indice++) {
					// Obtiene el campo
					let campo = v.campos[indice];
					// Obtiene el valor del campo
					[params, inputs[campo]] = this.obtieneValores(params, campo);
					// Particularidad para 'sexo_id'
					if (campo == "sexo_id" && inputs.categoria_id != "CFC") {
						this.ocultar(indice + 1);
						break;
					}
					// Particularidades para enProcCan y ama
					if ((campo == "enProcCan" || campo == "ama") && inputs[campo] == "0") {
						// Oculta el siguiente campo
						v.cfc[indice + 1].classList.add("ocultar");
						// Muestra el campo subsiguiente
						if (indice + 2 < v.campos.length) v.cfc[indice + 2].classList.remove("ocultar");
						// Saltea el campo subsiguiente
						indice++;
						// Fin
						continue;
					}
					// Particularidad para el último campo
					if (indice == v.campos.length - 1) break;
					// Caso genérico
					if (inputs[campo]) v.cfc[indice + 1].classList.remove("ocultar");
					else {
						this.ocultar(indice + 1);
						break;
					}
				}
				// OK y Errores
				errores.RCLI = await fetch(v.rutaValidacion + "RCLI_personaje" + params).then((n) => n.json());
				OK.RCLI = !errores.RCLI;
				if (!mostrarErrores) errores.RCLI = "";
	
				// Fin
				return;
			},

		}
	};
	let auxiliaresRCLI={
		obtieneValores: (params, campo) => {
			// Obtiene el inputElegido
			let input = v[campo];
			console.log(typeof input);
			let valor =
				input[0].localName == "input"
					? input[0].checked
						? input[0].value
						: input[1].checked
						? input[1].value
						: ""
					: input[0].localName == "option"
					? input.value
					: "";
			params += "&" + campo + "=" + valor;
			// Fin
			return [params, valor];
		},
		novedadesAno: async () => {
			// Consecuencias si no hay errores y el año tiene valor
			if (OK.ano && ano) {
				// Contemporáneo de Jesús
				if (ano < -50 || ano > 100) {
					v.cnt[1].checked = true;
					v.cnt[1].disabled = false;
					v.cnt[0].disabled = true;
					v.sector_cnt.classList.add("ocultarPorAno");
				} else {
					v.cnt[0].disabled = false;
					v.sector_cnt.classList.remove("ocultarPorAno");
				}
				// Aparición Mariana
				if (ano < 33) {
					v.ama[1].checked = true;
					v.ama[1].disabled = false;
					v.ama[0].disabled = true;
					v.sectorAp_mar.classList.add("ocultarPorAno");
				} else {
					v.ama[0].disabled = false;
					v.sectorAp_mar.classList.remove("ocultarPorAno");
				}
				await mostrarRCLI[v.entidad](false);
				v.preguntas.classList.remove("ocultar");
			}
			// Fin
			return;
		},
		novedadesSexo: () => {
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
					v.santosanta.innerHTML = v.santosanta.innerHTML.replace(letraAnterior, letraActual);
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
			}
			return;
		},
	}
	let muestraLosDiasDelMes = () => {
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
	};
	let startUp = async () => {
		if (v.nombre.value) await validaciones.nombreApodo(); // Valida el nombre
		if (v.mes_id.value) muestraLosDiasDelMes(v.mes_id, v.dia); // Personaliza los días del mes
		if ((v.mes_id.value && v.dia.value) || v.desconocida.checked) {
			await validaciones.fechas(); // Valida las fechas
			validaciones.repetido(); // Valida los duplicados
		}
		if (v.entidad != "valores" && v.ano.value) await validaciones.ano(); // Valida el año
		if (v.entidad != "valores") await muestraRCLI[v.entidad](true); // Muestra el RCLI
	};
	let feedback = (OK, errores, ocultarOK) => {
		// Definir las variables
		let sectores = ["nombre", "fecha", "repetidos"];
		if (!v.valores) sectores.push("RCLI");
		// Rutina
		sectores.forEach((sector, i) => {
			// Ícono de OK
			OK[sector] && !ocultarOK
				? v.iconoOK[i].classList.remove("ocultar")
				: v.iconoOK[i].classList.add("ocultar");
			// Íconos de error
			errores[sector]
				? v.iconoError[i].classList.remove("ocultar")
				: v.iconoError[i].classList.add("ocultar");
			// Mensaje de error
			v.mensajeError[i].innerHTML = errores[sector] ? errores[sector] : "";
		});
		// Mostrar logo de Wiki y Santopedia
		if (OK.nombre)
			v.linksClick.forEach((link, i) => {
				link.href = v.linksUrl[i] + v.nombre.value;
				link.classList.remove("ocultar");
			});
		else for (let link of v.linksClick) link.classList.add("ocultar");
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
			await validaciones[campo]();
			feedback(OK, errores);
		}
		// Acciones si se cambia el año
		if (campo == "ano") {
			// Sólo números
			v[campo].value = v[campo].value.replace(/[^-\d]/g, "");
			// Impide guiones en el medio
			if (v[campo].value.lastIndexOf("-") > 0) v[campo].value = v[campo].value.replace(/[-]/g, "");
		}
	});
	// Acciones cuando se  confirma el input
	v.dataEntry.addEventListener("change", async (e) => {
		// Funciones
		let limpiezaDeFechaRepetidos = () => {
			// Limpia los valores de mes, día y repetidos
			v.mes_id.value = "";
			v.dia.value = "";
			v.posiblesRepetidos.innerHTML = "";
			// Fin
			return;
		};
		let muestraPosiblesDuplicados = async () => {
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
		};
		// Variables
		let campo = e.target.name;
		// 1. Acciones si se cambia el nombre o apodo
		if ((campo == "nombre" || campo == "apodo") && v.nombre.value) await validaciones.nombreApodo();
		// 2. Acciones si se cambia la fecha
		if (campo == "mes_id" || campo == "dia" || campo == "desconocida") {
			if (campo == "mes_id") muestraLosDiasDelMes();
			if ((campo == "mes_id" || campo == "dia") && v.mes_id.value && v.dia.value) {
				await validaciones.fechas();
				if (OK.fecha) {
					await muestraPosiblesDuplicados();
					validaciones.repetido();
				}
			}
			if (campo == "desconocida" && v.desconocida.checked) {
				limpiezaDeFechaRepetidos();
				await validaciones.fechas();
				validaciones.repetido();
			}
		}
		// 3. Acciones si se cambia repetido
		if (campo == "repetido") validaciones.repetido();
		// 4. Acciones si se cambia el año
		if (campo == "ano") consecsDeNovsEnAno();
		// Acciones si se cambia el sexo
		if (campo == "sexo_id") consecsDeNovsEnElSexoElegido();
		// if (!v.valores && v.camposRCLI.includes(campo)) await muestraRCLI[v.entidad](false);
		// Final de la rutina
		feedback(OK, errores);
	});
	v.botonSubmit.addEventListener("click", async (e) => {
		// Acciones si el botón está inactivo
		if (v.botonSubmit.classList.contains("inactivo")) {
			await validaciones.nombreApodo();
			await validaciones.fechas();
			validaciones.repetido();
			if (!v.valores) {
				await validaciones.ano();
				await muestraRCLI[v.entidad](true);
			}
			// Fin
			feedback(OK, errores);
		}
		// Si el botón está activo, función 'submit'
		else v.dataEntry.submit();
	});

	// Status inicial
	// await startUp();
	feedback(OK, errores);
});
