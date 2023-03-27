"use strict";
window.addEventListener("load", async () => {
	// Variables
	let v = {
		// Variables que se obtienen del url
		entidad: new URL(location.href).searchParams.get("entidad"),
		id: new URL(location.href).searchParams.get("id"),
		// Variables generales
		dataEntry: document.querySelector("#dataEntry"),
		botonSubmit: document.querySelector(".flechas button[type='submit']"),
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
		// Errores
		camposError: ["nombre", "fecha", "repetidos"],
		OK: {},
		errores: {},
		// Otros
		camposNombre: document.querySelectorAll("#dataEntry #nombre .input"),
		camposFecha: document.querySelectorAll("#dataEntry #fecha .input"),
	};
	// Otros valores
	(() => {
		// Entidades en formato booleano
		v.personajes = v.entidad == "personajes";
		v.hechos = v.entidad == "hechos";
		v.valores = v.entidad == "valores";
		// Campos por sector
		if (v.personajes) v.camposError.push("sexo_id"); // Tiene que estar antes de "época"
		v.camposNombre = Array.from(v.camposNombre).map((n) => n.name);
		v.camposFecha = Array.from(v.camposFecha).map((n) => n.name);
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
		v.sectorApMar = document.querySelector("#dataEntry #sectorApMar");
	}
	// Valores para personajes
	if (v.personajes) {
		// Data-Entry adicional
		v.apodo = document.querySelector("#dataEntry input[name='apodo']");
		v.sexos_id = document.querySelectorAll("#dataEntry input[name='sexo_id']");
		v.epocas_id = document.querySelectorAll("#dataEntry input[name='epoca_id']");
		v.categorias_id = document.querySelectorAll("#dataEntry input[name='categoria_id']");
		v.rol_iglesia_id = document.querySelector("#dataEntry select[name='rol_iglesia_id']");
		v.canon_id = document.querySelector("#dataEntry select[name='canon_id']");
		v.ap_mar_id = document.querySelector("#dataEntry select[name='ap_mar_id']");
		// Otros
		v.prefijos = await fetch("/rclv/api/prefijos").then((n) => n.json());
		v.opcionesRolIglesia = document.querySelectorAll("#dataEntry select[name='rol_iglesia_id'] option");
		v.opcionesProceso = document.querySelectorAll("#dataEntry select[name='canon_id'] option");
		v.camposCFC = document.querySelectorAll("#dataEntry #RCLIC #preguntasRCLIC .input");
		// v.camposCFC = Array.from(v.camposCFC).map((n) => n.name);
	}
	// Valores para hechos
	if (v.hechos) {
		// Inputs - Epoca
		v.ant = document.querySelector("#dataEntry #epoca input[name='ant']");
		v.jss = document.querySelector("#dataEntry #epoca input[name='jss']");
		v.cnt = document.querySelector("#dataEntry #epoca input[name='cnt']");
		v.pst = document.querySelector("#dataEntry #epoca input[name='pst']");
		v.epocas = document.querySelectorAll("#dataEntry #epoca input[type='checkbox']");
		// Inputs - RCLIC
		v.solo_cfc = document.querySelectorAll("#dataEntry input[name='solo_cfc']");
		v.ama = document.querySelectorAll("#dataEntry input[name='ama']");
	}
	// -------------------------------------------------------
	// Funciones
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
			muestraPosiblesRepetidos: async () => {
				// Variables
				let casos = [];

				if (!v.desconocida.checked) {
					// Obtiene los casos con esa fecha
					// 1. Obtiene los parámetros
					let params = "?entidad=" + v.entidad;
					if (v.id) params += "&id=" + v.id;
					params += "&mes_id=" + v.mes_id.value + "&dia=" + v.dia.value;
					// 2. Busca otros casos con esa fecha
					casos = await fetch(v.rutaRegistrosConEsaFecha + params).then((n) => n.json());
				}

				// Si no hay otros casos, mensaje de "No hay otros casos"
				if (!casos.length) {
					v.posiblesRepetidos.innerHTML = "¡No hay otros casos!";
					v.posiblesRepetidos.classList.add("sinCasos");
				}
				// Si hay otros casos, los muestra y valida 'repetidos'
				else {
					v.posiblesRepetidos.innerHTML = "";
					v.posiblesRepetidos.classList.remove("sinCasos");
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
						v.posiblesRepetidos.appendChild(li);
					});
				}

				// Valida repetidos
				validacs.repetido();

				// Fin
				return;
			},
			limpiezaDeMesDia: () => {
				// Limpia los valores de mes, día y repetidos
				v.mes_id.value = "";
				v.dia.value = "";

				// Fin
				return;
			},
		},
		sexo: async () => {
			// Obtiene la opción elegida
			let sexo_id = opcionElegida(v.sexos_id);

			// Función para dejar solamente las opciones con ese sexo
			let FN = (select, opciones) => {
				select.innerHTML = "";
				for (let opcion of opciones)
					if (opcion.value.slice(-1) == sexo_id.value || opcion.value <= 2) select.appendChild(opcion);
			};
			// Opciones de 'Rol en la Iglesia'
			FN(v.rol_iglesia_id, v.opcionesRolIglesia);
			// Opciones de 'Proceso de Canonización'
			FN(v.canon_id, v.opcionesProceso);

			// Fin
			return;
		},
		epoca: {
			personajes: async () => {
				// Obtiene la opción elegida
				let epoca_id = opcionElegida(v.epocas_id);
				// Obtiene el año
				let ano = FN_ano(v.ano.value);

				// Si 'pst' y Año > 1100, muestra sectorApMar. Si no, lo oculta
				// Es necesario dejar la condición 'pst', para que oculte  si el usuario cambia
				if (epoca_id.value == "pst" && ano > 1100) v.sectorApMar.style.visibility = "inherit";
				else v.sectorApMar.style.visibility = "hidden";

				// Fin
				return;
			},
			hechos: async () => {
				// Obtiene la opción elegida
				let epoca = opcionElegida(v.epocas);
				// Si 'jss' --> 'cnt'
				if (epoca.name == "jss") v.cnt.checked = true;

				// Obtiene el año
				let ano = FN_ano(v.ano.value);

				// Si 'pst' y Año > 1100, muestra sectorApMar. Si no, lo oculta
				// Es necesario dejar la condición 'pst', para que lo oculte si el usuario lo combina con otra opción
				if (epoca.name == "pst" && ano > 1100) v.sectorApMar.classList.remove("invisible");
				else v.sectorApMar.classList.add("invisible");

				// Fin
				return;
			},
		},
	};
	let validacs = {
		// Sectores
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

			// Acciones si la fecha está OK
			if (v.OK.fecha) await impactos.fecha.muestraPosiblesRepetidos();

			// Fin
			return;
		},
		repetido: () => {
			// Variables
			let casos = document.querySelectorAll("#posiblesRepetidos li input");
			let cartelDuplicado = "Por favor asegurate de que no coincida con ningún otro registro, y destildalos.";
			// Errores y OK
			v.errores.repetidos = casos && Array.from(casos).some((n) => n.checked) ? cartelDuplicado : "";
			v.OK.repetidos = !v.errores.repetidos;
			// Fin
			return;
		},
		sexo: async () => {
			// Obtiene la opción elegida
			let sexo_id = opcionElegida(v.sexos_id);

			// Genera la variable de parámetros
			let params = "sexo&sexo_id=" + sexo_id.value;

			// OK y Errores
			v.errores.sexo_id = await fetch(v.rutaValidacion + params).then((n) => n.json());
			v.OK.sexo_id = !v.errores.sexo_id;

			// Fin
			return;
		},
		epoca: async () => {
			// Variables
			let params = "epoca&entidad=" + v.entidad;

			// Agrega los demás parámetros
			if (v.personajes) {
				let epoca_id = opcionElegida(v.epocas_id);
				params += "&epoca_id=" + epoca_id.value;
				if (epoca_id.value == "pst") params += "&ano=" + FN_ano(v.ano.value);
			}
			if (v.hechos) {
				// Si el campo está chequeado, lo agrega a los parámetros
				for (let epoca of v.epocas) if (epoca.checked) params += "&" + epoca.name + "=on";
				if (opcionElegida(v.epocas).name == "pst") params += "&ano=" + FN_ano(v.ano.value);
			}

			// OK y Errores
			v.errores.epoca = await fetch(v.rutaValidacion + params).then((n) => n.json());
			v.OK.epoca = !v.errores.epoca;

			// Fin
			return;
		},
		RCLIC: {
			personajes: async () => {
				// Variables
				let params = "RCLIC_personajes";
				let sexo_id;

				// Obtiene la categoría
				let categoria_id = opcionElegida(v.categorias_id);
				params += "&categoria_id=" + categoria_id.value;

				if (categoria_id.value == "CFC") {
					// Obtiene el sexo_id
					if (categoria_id) sexo_id = opcionElegida(v.sexos_id);
					params += "&sexo_id=" + (sexo_id.value ? "on" : "");

					// Obtiene los valores de los camposCFC
					if (sexo_id.value) {
						// Agrega los datos de CFC
						for (let campo of v.camposCFC) if (campo.value) params += "&" + campo.name + "=" + campo.value;
						// Agrega los datos de epoca_id y año
						let epoca_id = opcionElegida(v.epocas_id);
						params += "&epoca_id=" + epoca_id.value;
						let ano = FN_ano(v.ano.value);
						if (epoca_id.value == "pst") params += "&ano=" + ano;
					}
				}

				// OK y Errores
				v.errores.RCLIC = await fetch(v.rutaValidacion + params).then((n) => n.json());
				v.OK.RCLIC = !v.errores.RCLIC;

				// Fin
				return;
			},
			hechos: async () => {
				// Variables
				let params = "RCLIC_hechos";

				// Obtiene el 'solo_cfc'
				let solo_cfc = opcionElegida(v.solo_cfc);
				params += "&solo_cfc=" + solo_cfc.value;

				if (solo_cfc.value == 1) {
					// Obtiene los datos de época y año
					let epoca = opcionElegida(v.epocas);
					params += "&epoca=" + epoca.name;

					let ano = FN_ano(v.ano.value);
					if (epoca.name == "pst") {
						params += "&ano=" + ano;
						if (ano > 1100) params += "&ama=" + opcionElegida(v.ama).value;
					}
				}

				// OK y Errores
				v.errores.RCLIC = await fetch(v.rutaValidacion + params).then((n) => n.json());
				v.OK.RCLIC = !v.errores.RCLIC;

				// Fin
				return;
			},
		},
		muestraErrorOK: (i, ocultarOK) => {
			// Íconos de OK
			v.OK[v.camposError[i]] && !ocultarOK
				? v.iconoOK[i].classList.remove("ocultar")
				: v.iconoOK[i].classList.add("ocultar");
			// Íconos de error
			v.errores[v.camposError[i]] ? v.iconoError[i].classList.remove("ocultar") : v.iconoError[i].classList.add("ocultar");
			// Mensaje de error
			v.mensajeError[i].innerHTML = v.errores[v.camposError[i]] ? v.errores[v.camposError[i]] : "";
		},
		muestraErroresOK: function () {
			// Muestra los íconos de Error y OK
			for (let i = 0; i < v.camposError.length; i++) this.muestraErrorOK(i);
		},
		botonSubmit: () => {
			// Botón submit
			let resultado = Object.values(v.OK);
			let resultadosTrue = resultado.length ? resultado.every((n) => !!n) : false;
			resultadosTrue && resultado.length == v.camposError.length
				? v.botonSubmit.classList.remove("inactivo")
				: v.botonSubmit.classList.add("inactivo");
		},
		startUp: async function () {
			// 1. Valida el nombre
			if (v.nombre.value) await this.nombre.nombreApodo();
			if (v.nombre.value && v.OK.nombre) impactos.nombre.logosWikiSantopedia();

			// 2. Valida las fechas
			if (v.desconocida.checked) impactos.fecha.limpiezaDeMesDia();
			if (v.mes_id.value) impactos.fecha.muestraLosDiasDelMes();
			if ((v.mes_id.value && v.dia.value) || v.desconocida.checked) await this.fecha();

			// 4. Valida el sexo
			if (v.personajes && opcionElegida(v.sexos_id).value) await impactos.sexo();
			if (v.personajes && opcionElegida(v.sexos_id).value) await this.sexo();

			// 5. Valida la época
			if ((v.personajes && opcionElegida(v.epocas_id).value) || (v.hechos && opcionElegida(v.epocas).name)) {
				await impactos.epoca[v.entidad]();
				await this.epoca();
			}

			// 6. Valida RCLIC
			if ((v.personajes && opcionElegida(v.categorias_id).value) || (v.hechos && opcionElegida(v.solo_cfc).value))
				await this.RCLIC[v.entidad]();

			// Fin
			this.muestraErroresOK();
			this.botonSubmit();
		},
	};

	// Correcciones mientras se escribe
	v.dataEntry.addEventListener("input", async (e) => {
		let campo = e.target.name;
		// Acciones si se cambia el nombre o apodo
		if (v.camposNombre.includes(campo)) {
			// Variables
			let valor = v[campo].value;
			// 1. Primera letra en mayúscula
			v[campo].value = valor.slice(0, 1).toUpperCase() + valor.slice(1);
			valor = v[campo].value;
			// 2. Quita los caracteres no deseados
			v[campo].value = valor
				.replace(/[^a-záéíóúüñ'.- ]/gi, "")
				.replace(/ +/g, " ")
				.replace(/\t/g, "")
				.replace(/\r/g, "");
			valor = v[campo].value;
			// 3. Quita el prefijo 'San'
			if (campo == "nombre" && v.personajes)
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
			if (v.ano.value) {
				let anoIngresado = parseInt(v.ano.value);
				let anoActual = new Date().getFullYear();
				v.ano.value = Math.min(anoIngresado, anoActual);
			}
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
				v.desconocida.checked = false;
				await validacs.fecha();
			}
			if (campo == "desconocida") {
				if (v.desconocida.checked) impactos.fecha.limpiezaDeMesDia();
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
			if (v.OK.sexo_id && opcionElegida(v.categorias_id).value == "CFC") await validacs.RCLIC.personajes();
		}
		// 5. Acciones si se cambia el sector Época
		if (v.camposEpoca.includes(campo)) {
			// Impacto y Validaciones
			await impactos.epoca[v.entidad]();
			await validacs.epoca();
			// Si se eligió el checkbox "pst", pone el cursor en 'Año'
			if (v.personajes && e.target.value == "pst") v.ano.focus();
			if (v.hechos && opcionElegida(v.epocas).name == "pst") v.ano.focus();
			// Si corresponde, valida RCLIC
			if (v.OK.epoca) {
				if (v.personajes && opcionElegida(v.categorias_id).value == "CFC") await validacs.RCLIC.personajes();
				if (v.hechos && opcionElegida(v.solo_cfc).value == 1) await validacs.RCLIC.hechos();
			}
		}
		// 6. Acciones si se cambia el sector RCLIC
		if (v.camposRCLIC.includes(campo)) {
			// Nota: sus impactos se resuelven con CSS
			await validacs.RCLIC[v.entidad]();
		}

		// Final de la rutina
		validacs.muestraErroresOK();
		validacs.botonSubmit();
	});
	// Botón submit
	v.botonSubmit.addEventListener("click", async (e) => {
		// Acciones si el botón está inactivo
		if (v.botonSubmit.classList.contains("inactivo")) await validacs.startUp();
		// Si el botón está activo, función 'submit'
		else v.dataEntry.submit();
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
