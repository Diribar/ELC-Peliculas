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
		rutaOtrosCasos: "/rclv/api/otros-casos/",
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
			"categoria_id",
			"sexo_id",
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
	let valida = {
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
				if (v.ano.value < 33) {
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
			} else v.preguntas.classList.add("ocultar");

			// Fin
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
		// Obtiene los casos
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
		hechos: async function (mostrarErrores) {
			// Variables
			let params = "&entidad=" + v.entidad;
			let inputs = {};
			// Rutina
			for (let indice = 0; indice < v.campos.length; indice++) {
				// Obtiene el campo
				let campo = v.campos[indice];
				// Obtiene el valor del campo
				[params, inputs[campo]] = this.obtieneValores(params, campo);
				// Particularidad para 'solo_cfc'
				if (campo == "solo_cfc" && inputs[campo] != "1") {
					this.ocultar(indice + 1);
					break;
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
			errores.RCLI = await fetch(v.rutaValidacion + "RCLI_hecho" + params).then((n) => n.json());
			OK.RCLI = !errores.RCLI;
			if (!mostrarErrores) errores.RCLI = "";

			// Fin
			return;
		},
		ocultar: (indice) => {
			for (let i = indice; i < v.cfc.length; i++) v.cfc[i].classList.add("ocultar");
			return;
		},
		obtieneValores: (params, campo) => {
			// Obtiene el inputElegido
			let input = v[campo];
			let inputElegido =
				v[campo][0].localName == "input"
					? input[0].checked
						? input[0].value
						: input[1].checked
						? input[1].value
						: ""
					: v[campo][0].localName == "option"
					? input.value
					: "";
			params += "&" + campo + "=" + inputElegido;
			// Fin
			return [params, inputElegido];
		},
	};
	let startUp = async () => {
		if (v.nombre.value && (!v.apodo || v.apodo.value)) await valida.nombreApodo();
		if (v.mes_id.value) diasDelMes(v.mes_id, v.dia);
		if ((v.mes_id.value && v.dia.value) || v.desconocida.checked) {
			await valida.fechas();
			valida.repetido();
		}
		if (v.entidad != "valores" && v.ano.value) await valida.ano();
	};
	let feedback = (OK, errores, ocultarOK) => {
		// Definir las variables
		let sectores = ["nombre", "fecha", "repetidos"];
		if (!v.valores) sectores.push("ano", "RCLI");
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

	// Add Event Listeners - compatible RCLV x 3
	v.dataEntry.addEventListener("input", async (e) => {
		let campo = e.target.name;
		if (campo == "nombre" || campo == "apodo") {
			// Primera letra en mayúscula
			let aux = e.target.value;
			e.target.value = aux.slice(0, 1).toUpperCase() + aux.slice(1);
			// Quita los caracteres no deseados
			v[campo].value = v[campo].value.replace(/[^a-záéíóúüñ'\s\d]/gi, "").replace(/ +/g, " ");
			// Quita los caracteres que exceden el largo permitido
			if (v[campo].value.length > 30) v[campo].value = v[campo].value.slice(0, 30);
			// Revisa los errores y los publica si existen
			await valida[campo]();
			feedback(OK, errores);
		}
		if (campo == "ano" || campo == "hasta") {
			// Sólo números
			v[campo].value = v[campo].value.replace(/[^-\d]/g, "");
			// Impide guiones en el medio
			if (v[campo].value.lastIndexOf("-") > 0) v[campo].value = v[campo].value.replace(/[-]/g, "");
			// Revisa los errores y los publica si existen
			// await valida[campo]();
			// feedback(OK, errores, true);
		}
	});
	v.dataEntry.addEventListener("change", async (e) => {
		let campo = e.target.name;
		// Campos para todos los RCLV
		if ((campo == "nombre" || campo == "apodo") && v.nombre.value && (!v.apodo || v.apodo.value))
			await valida.nombreApodo();
		if (campo == "mes_id") diasDelMes();
		if ((campo == "mes_id" || campo == "dia") && v.mes_id.value && v.dia.value) await valida.fechas();
		if (campo == "desconocida") await valida.fechas();
		if (campo == "repetido") valida.repetido();
		if (v.entidad != "valores" && campo == "ano") await valida.ano();
		// Campos RCLI
		if (v.personajes && campo == "sexo_id") funcionSexo();
		if (!v.valores && v.camposRCLI.includes(campo)) await mostrarRCLI[v.entidad](false);
		// Final de la rutina
		feedback(OK, errores);
	});
	v.botonSubmit.addEventListener("click", async (e) => {
		// Acciones si el botón está inactivo
		if (v.botonSubmit.classList.contains("inactivo")) {
			await valida.nombreApodo();
			await valida.fechas();
			valida.repetido();
			if (!v.valores) {
				await valida.ano();
				await mostrarRCLI[v.entidad](true);
			}
			// Fin
			feedback(OK, errores);
		}
		// Si el botón está activo, función 'submit'
		else v.dataEntry.submit();
	});

	// Status inicial
	await startUp();
	feedback(OK, errores);
});

let cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
