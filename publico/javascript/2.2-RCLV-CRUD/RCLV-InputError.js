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
		linksClick: document.querySelectorAll("#dataEntry #fecha .links"),
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
	};
	// Otros valores
	(() => {
		// Entidades en formato booleano
		v.personajes = v.entidad == "personajes";
		v.hechos = v.entidad == "hechos";
		v.valores = v.entidad == "valores";
		// Campos por sector
		v.camposError = ["nombre", "fecha", "repetidos"];
		v.camposNombre = document.querySelectorAll("#dataEntry #nombre .input");
		v.camposNombre = Array.from(v.camposNombre).map((n) => n.name);
		v.camposFecha = document.querySelectorAll("#dataEntry #fecha .input");
		v.camposFecha = Array.from(v.camposFecha).map((n) => n.name);
		// Errores
		v.OK = {};
		v.errores = {};
	})();
	// Valores para !valores
	if (!v.valores) {
		// Valores comunes a 'personajes' y 'hechos'
		v.ano = document.querySelector("#dataEntry input[name='ano']");
		v.camposError.push("epoca", "RCLIC");
		// Campos por sector
		v.camposEpoca = document.querySelectorAll("#dataEntry #epoca .input");
		v.camposEpoca = Array.from(v.camposEpoca).map((n) => n.name);
		v.camposRCLIC = document.querySelectorAll("#dataEntry #RCLIC .input");
		v.camposRCLIC = Array.from(v.camposRCLIC).map((n) => n.name);
	}
	// Valores para personajes
	if (v.personajes) {
		// Data-Entry adicional
		v.apodo = document.querySelector("#dataEntry input[name='apodo']");
		v.sexos_id = document.querySelectorAll("#dataEntry input[name='sexo_id']");
		v.epocas_id = document.querySelectorAll("#dataEntry input[name='epoca_id']");
		v.categorias_id = document.querySelectorAll("#dataEntry input[name='categoria_id']");
		v.rol_iglesia_id = document.querySelector("#dataEntry select[name='rol_iglesia_id']");
		v.proceso_id = document.querySelector("#dataEntry select[name='proceso_id']");
		v.ap_mar_id = document.querySelector("#dataEntry select[name='ap_mar_id']");
		// Otros
		v.prefijos = await fetch("/rclv/api/prefijos").then((n) => n.json());
		v.opcionesRolIglesia = document.querySelectorAll("#dataEntry select[name='rol_iglesia_id'] option");
		v.opcionesProceso = document.querySelectorAll("#dataEntry select[name='proceso_id'] option");
	}
	// Valores para hechos
	if (v.hechos) {
		// Epoca
		v.ant = document.querySelectorAll("#dataEntry input[name='ant']");
		v.jss = document.querySelectorAll("#dataEntry input[name='jss']");
		v.cnt = document.querySelectorAll("#dataEntry input[name='cnt']");
		v.pst = document.querySelectorAll("#dataEntry input[name='pst']");
		// Otros
		v.solo_cfc = document.querySelectorAll("#dataEntry input[name='solo_cfc']");
		v.ama = document.querySelectorAll("#dataEntry input[name='ama']");
	}
	// -------------------------------------------------------
	// Funciones
	let validacs = {
		nombre: {
			nombre: async () => {
				// Verifica errores en el sector 'nombre', campo 'nombre'
				let params = "&nombre=" + encodeURIComponent(v.nombre.value);
				v.errores.nombre = await fetch(v.rutaValidacion + "nombre" + params).then((n) => n.json());
				// Si hay errores, cambia el OK a false
				if (v.errores.nombre) v.OK.nombre = false;
				// Fin
				return;
			},
			apodo: async () => {
				// Verifica errores en el sector 'nombre', campo 'apodo'
				let params = "&apodo=" + encodeURIComponent(v.apodo.value);
				v.errores.nombre = await fetch(v.rutaValidacion + "nombre" + params).then((n) => n.json());
				if (v.errores.nombre) v.OK.nombre = false;
				// Fin
				return;
			},
			nombreApodo: async () => {
				// Verifica errores en el sector 'nombre'
				let params = "&nombre=" + encodeURIComponent(v.nombre.value) + "&entidad=" + v.entidad;
				if (v.personajes) params += "&apodo=" + encodeURIComponent(v.apodo.value);
				if (v.id) params += "&id=" + v.id;
				v.errores.nombre = await fetch(v.rutaValidacion + "nombre" + params).then((n) => n.json());
				// Consolidar la info
				v.OK.nombre = !v.errores.nombre;
				// Fin
				return;
			},
		},
		fecha: async () => {
			// Si se conoce la fecha...
			if (!v.desconocida.checked) {
				// Averigua si hay un error con la fecha
				let params = "&mes_id=" + v.mes_id.value + "&dia=" + v.dia.value;
				v.errores.fecha = await fetch(v.rutaValidacion + "fecha" + params).then((n) => n.json());
				v.OK.fecha = !v.errores.fecha;
			} else {
				// Errores y OK
				v.errores.fecha = "";
				v.OK.fecha = true;
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
			v.errores.repetidos = casos && Array.from(casos).some((n) => n.checked) ? cartelDuplicado : "";
			v.OK.repetidos = !v.errores.repetidos;
			// Fin
			return;
		},
		personajes: {
			sexo: () => {},
			epoca: () => {},
			RCLIC: () => {},
		},
		hechos: {
			epoca: () => {},
			RCLIC: () => {},
		},
		muestraErrorOK: (i, ocultarOK) => {
			// Íconos de OK
			v.OK[v.camposError[i]] && !ocultarOK
				? v.iconoOK[i].classList.remove("ocultar")
				: v.iconoOK[i].classList.add("ocultar");
			// Íconos de error
			v.errores[v.camposError[i]]
				? v.iconoError[i].classList.remove("ocultar")
				: v.iconoError[i].classList.add("ocultar");
			// Mensaje de error
			v.mensajeError[i].innerHTML = v.errores[v.camposError[i]] ? v.errores[v.camposError[i]] : "";
		},
		muestraErroresOK: function () {
			// Muestra los íconos de Error y OK
			v.camposError.forEach((sector, i) => {
				this.muestraErrorOK(i);
			});
		},
		botonSubmit: () => {
			// Botón submit
			let resultado = Object.values(v.OK);
			let resultadoTrue = resultado.length ? resultado.every((n) => n == true) : false;
			resultadoTrue && resultado.length == v.camposError.length
				? v.botonSubmit.classList.remove("inactivo")
				: v.botonSubmit.classList.add("inactivo");
		},
		startup: () => {},
	};
	let impactos = {
		nombre: {
			logosWikiSantopedia: () => {
				// Mostrar logo de Wiki y Santopedia
				if (v.OK.nombre)
					v.linksClick.forEach((link, i) => {
						link.href = v.linksUrl[i] + v.nombre.value;
						link.classList.remove("ocultar");
					});
				else for (let link of v.linksClick) link.classList.add("ocultar");
				// Fin
				return;
			},
		},
		fecha: {
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
		personajes: {
			sexo: () => {
				// Deja solamente las opciones con ese sexo, descarta las demás
				// Averigua el sexo
				for (var sexo_id of v.sexos_id) if (sexo_id.checked) break;
				let sexo = sexo_id.value;
				// Función para dejar solamente las opciones con ese sexo
				let FN = (select, opciones) => {
					select.innerHTML = "";
					for (let opcion of opciones)
						if (opcion.value.slice(-1) == sexo || opcion.value <= 2) select.appendChild(opcion);
				};
				// Opciones para 'Rol en la Iglesia'
				FN(v.rol_iglesia_id, v.opcionesRolIglesia);
				// Opciones para 'Proceso de Canonización'
				FN(v.proceso_id, v.opcionesProceso);
			},
			epoca: () => {
				// Detecta cuál opción está elegida
				for (var epoca of v.epocas_id) if (epoca.checked) break;
				let ano = v.ano.value;

				// Si 'PST' y Año > 1100, muestra ama, si no lo oculta
				if (epoca.value == "PST" && ano > 1100) v.ap_mar_id.style.visibility="inherit"
				else v.ap_mar_id.style.visibility="hidden"
			},
		},
		hechos: {
			epoca: () => {
				// Si 'PST' y Año > 1100, muestra ama, si no lo oculta
			},
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
			v[campo].value = valor
				.replace(/[^a-záéíóúüñ'\s]/gi, "")
				.replace(/ +/g, " ")
				.replace(/\t/g, "")
				.replace(/\r/g, "");
			valor = v[campo].value;
			// 3. Quita el prefijo 'San'
			if (campo == "nombre" && v.entidad == "personajes")
				for (let prefijo of v.prefijos) {
					if (valor.startsWith(prefijo + " ")) {
						v[campo].value = valor.slice(prefijo.length + 1);
						valor = v[campo].value;
						break;
					}
				}
			// 4. Quita los caracteres que exceden el largo permitido
			if (valor.length > 30) v[campo].value = valor.slice(0, 30);
			// Revisa los errores y los publica si existen
			await validacs.nombre[campo]();
			validacs.muestraErrorOK(0, true);
		}
		if (campo == "ano") {
			// Sólo números en el año
			v.ano.value = v.ano.value.replace(/[^\d]/g, "");
			// Menor o igual que el año actual
			let anoIngresado = parseInt(v.ano.value);
			let anoActual = new Date().getFullYear();
			v.ano.value = Math.min(anoIngresado, anoActual);
		}
	});
	// Acciones cuando se  confirma el input
	v.dataEntry.addEventListener("change", async (e) => {
		// Variables
		let campo = e.target.name;
		// 1. Acciones si se cambia el sector Nombre
		if (v.camposNombre.includes(campo) && v.nombre.value) {
			await validacs.nombre.nombreApodo();
			if (v.OK.nombre) impactos.nombre.logosWikiSantopedia();
		}
		// 2. Acciones si se cambia el sector Fecha
		if (v.camposFecha.includes(campo)) {
			if (campo == "mes_id") impactos.fecha.muestraLosDiasDelMes();
			if ((campo == "mes_id" || campo == "dia") && v.mes_id.value && v.dia.value) {
				await validacs.fecha();
				// Acciones si la fecha está OK
				if (v.OK.fecha) {
					await impactos.fecha.muestraPosiblesDuplicados();
					validacs.repetido();
				}
			}
			if (campo == "desconocida" && v.desconocida.checked) {
				impactos.fecha.limpiezaDeFechaRepetidos();
				await validacs.fecha();
				validacs.repetido();
			}
		}
		// 3. Acciones si se cambia el sector Repetido
		if (campo == "repetido") validacs.repetido();
		// 4. Acciones si se cambia el sector Sexo
		if (campo == "sexo_id") {
			impactos.personajes.sexo();
		}
		// 5. Acciones si se cambia el sector Época
		if (v.camposEpoca.includes(campo)) {
			impactos[v.entidad].epoca();
			validacs[v.entidad].epoca();
		}

		// 6. Acciones si se cambia el sector RCLIC
		if (v.camposRCLIC.includes(campo)) {
			// Nota: sus impactos se resuelven con CSS
			validacs[v.entidad].RCLIC();
		}

		// Final de la rutina
		validacs.muestraErroresOK();
		validacs.botonSubmit();
	});
	// Botón submit
	v.botonSubmit.addEventListener("click", async (e) => {
		// Acciones si el botón está inactivo
		if (v.botonSubmit.classList.contains("inactivo")) {
			// Realiza todas las validacs
			await validacs.nombre.nombreApodo();
			await validacs.fecha();
			validacs.repetido();
			if (!v.valores) await validacs.RCLI.consolidado(true);
			// Fin
			validacs.muestraErroresOK();
		}
		// Si el botón está activo, función 'submit'
		else v.dataEntry.submit();
	});

	// Status inicial
	// await validacs.startUp();
	// validacs.muestraErroresOK();
	// validacs.botonSubmit();
});
