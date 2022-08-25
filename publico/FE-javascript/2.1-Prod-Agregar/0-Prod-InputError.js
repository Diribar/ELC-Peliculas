"use strict";
window.addEventListener("load", async () => {
	// Averiguar el 'paso'
	let url = window.location.pathname;
	let paso = url.slice(url.lastIndexOf("/") + 1);
	paso = {
		paso,
		PC: paso == "palabras-clave",
		DD: paso == "datos-duros",
		DP: paso == "datos-personalizados",
	};
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let submit = document.querySelector("#dataEntry #submit");
	// Datos
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// OK/Errores
	let iconosError = document.querySelectorAll(".input-error .fa-circle-xmark");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	if (paso.PC) {
		var resultado = document.querySelector("#dataEntry #resultado");
		var rutaObtenerCantProds = (input) => {
			let palabrasClave = input.trim();
			// Procesando la información
			resultado.innerHTML = "Procesando la información...";
			resultado.classList.remove(...resultado.classList);
			resultado.classList.add("resultadoEnEspera");
			// Obtener el link
			return "/producto/agregar/api/PC-cant-prod/?palabrasClave=" + palabrasClave;
		};
		var mostrarResultados = async (lectura) => {
			// Averiguar cantidad de coincidencias
			let prod_nuevos = lectura.resultados.filter((n) => n.YaEnBD == false).length;
			let cantResultados = lectura.cantResultados;
			let hayMas = lectura.hayMas;
			// Determinar oracion y formato
			let formatoVigente;
			let oracion;
			// Resultado exitoso
			if (cantResultados > 0 && !hayMas) {
				oracion =
					"Encontramos " +
					(cantResultados == 1
						? "1 sola coincidencia, que " + (prod_nuevos ? "no" : "ya")
						: cantResultados +
						  " coincidencias, " +
						  (prod_nuevos == cantResultados
								? "y ninguna"
								: prod_nuevos
								? prod_nuevos + " no"
								: "y todas")) +
					" está" +
					(prod_nuevos > 1 && prod_nuevos != cantResultados ? "n" : "") +
					" en nuestra BD";
				formatoVigente = "resultadoExitoso";
			} else {
				// Resultados inválidos
				formatoVigente = "resultadoInvalido";
				oracion = hayMas
					? "Hay demasiadas coincidencias (+" + cantResultados + "), intentá ser más específico"
					: cantResultados == 0
					? "No encontramos coincidencias con estas palabras"
					: oracion;
			}
			resultado.innerHTML = oracion;
			resultado.classList.remove(...resultado.classList);
			resultado.classList.add(formatoVigente);
		};
		var avanzar = () => {
			submit.classList.remove("fa-circle-question");
			submit.classList.add("fa-circle-check");
			submit.classList.remove("naranja");
			submit.classList.add("verde");
			submit.title = "Avanzar";
			return;
		};
		var verificar = () => {
			submit.classList.remove("fa-circle-check");
			submit.classList.add("fa-circle-question");
			submit.classList.remove("verde");
			submit.classList.add("naranja");
			submit.title = "Verificar";
			submit.style = "background";
			return;
		};
	}
	if (paso.DD) {
		var entidad = document.querySelector("#dataEntry #entidad").innerHTML;
		// Variables de país
		var paisesSelect = document.querySelector("#paises_id select");
		if (paisesSelect) {
			var paisesMostrar = document.querySelector("#paises_id #mostrarPaises"); // Lugar donde mostrar los nombres
			var paisesID = document.querySelector("#paises_id input[name='paises_id']"); // Lugar donde almacenar los ID
			var paisesListado = Array.from(document.querySelectorAll("#paises_id select option")).map((n) => {
				return {id: n.value, nombre: n.innerHTML};
			});
		}
	}
	if (paso.DP) {
		// Ayuda Sub-categoría
		var iconoAyudaSubcat = document.querySelector("#ayudaSubcat .fa-circle-question");
		var mensajesAyudaSubcat = document.querySelectorAll("#ayudaSubcat ul li");
		// Categoría y subcategoría
		var categoriaSelect = document.querySelector("select[name='categoria_id']");
		var subcategoriaSelect = document.querySelector("select[name='subcategoria_id']");
		var subcategoriaOpciones = document.querySelectorAll("select[name='subcategoria_id'] option");
		var subcategorias = await fetch("/producto/agregar/api/obtener-subcategorias").then((n) => n.json());
		var subcategoria;
		// Datos RCLV
		var etiquetasRCLV = document.querySelectorAll(".label-input.RCLV");
		var inputsRCLV = document.querySelectorAll(".input-error .input.RCLV");
		var linkAltaJSS = document.querySelector(".input-error .linkRCLV.alta");
		var linksEdicion = document.querySelectorAll(".input-error .linkRCLV.edicion");
		var iconosOK_RCLV = document.querySelectorAll(".RCLV .input-error .fa-circle-check");
		var iconosError_RCLV = document.querySelectorAll(".RCLV .input-error .fa-circle-xmark");
		var opcionesPersonaje = document.querySelectorAll("select[name='personaje_id'] option.RCLV");
		var opcionesHecho = document.querySelectorAll("select[name='hecho_id'] option.RCLV");
	}
	// Ruta
	let rutaValidar = "/producto/agregar/api/validar/" + paso.paso + "/?";

	// FUNCIONES *******************************************
	let statusInicial = async (mostrarIconoError) => {
		//Buscar todos los valores
		let datosUrl = "";
		inputs.forEach((input, i) => {
			if (i) datosUrl += "&";
			if (paso.DD && input.name == "avatar") return;
			datosUrl += input.name + "=";
			datosUrl += encodeURIComponent(input.value);
		});
		// Consecuencias de las validaciones de errores
		await muestraLosErrores(datosUrl, mostrarIconoError);
		actualizaBotonSubmit();
		// Fin
		return;
	};
	let muestraLosErrores = async (datosUrl, mostrarIconoError) => {
		let errores = await fetch(rutaValidar + datosUrl).then((n) => n.json());
		campos.forEach((campo, indice) => {
			if (errores[campo] !== undefined) {
				mensajesError[indice].innerHTML = errores[campo];
				// Acciones en función de si hay o no mensajes de error
				errores[campo]
					? iconosError[indice].classList.add("error")
					: iconosError[indice].classList.remove("error");
				errores[campo] && mostrarIconoError
					? iconosError[indice].classList.remove("ocultar")
					: iconosError[indice].classList.add("ocultar");
			}
		});
		// Fin
		return;
	};
	let actualizaBotonSubmit = () => {
		// Detectar la cantidad de 'errores' ocultos
		let hayErrores = Array.from(iconosError)
			.map((n) => n.className)
			.some((n) => n.includes("error"));
		// Consecuencias
		hayErrores ? submit.classList.add("inactivo") : submit.classList.remove("inactivo");
	};
	let submitForm = async (e) => {
		e.preventDefault();
		if (paso.PC)
			if (submit.classList.contains("fa-circle-question")) {
				if (!submit.classList.contains("inactivo")) {
					submit.classList.add("inactivo");
					let ruta = rutaObtenerCantProds(inputs[0].value);
					let cantProds = await fetch(ruta).then((n) => n.json());
					mostrarResultados(cantProds);
					submit.classList.remove("inactivo");
					avanzar();
				} else statusInicial(true);
			} else form.submit();
		else if (submit.classList.contains("inactivo")) statusInicial(true);
		else form.submit();
	};
	let DD = {
		dosCampos: async function (datos, campo) {
			let campo1 = datos.campo1;
			let campo2 = datos.campo2;
			let indice1 = campos.indexOf(campo1);
			let indice2 = campos.indexOf(campo2);
			let camposComb = [campo1, campo2];
			if (
				(campo == campo1 || campo == campo2) &&
				inputs[indice1].value &&
				!mensajesError[indice1].innerHTML &&
				inputs[indice2].value &&
				!mensajesError[indice2].innerHTML
			)
				this.camposCombinados(camposComb);
			return;
		},
		camposCombinados: async (camposComb) => {
			// Armado de la ruta
			let datosUrl = "entidad=" + entidad;
			for (let i = 0; i < camposComb.length; i++) {
				let indice = campos.indexOf(camposComb[i]);
				datosUrl += "&" + camposComb[i] + "=" + inputs[indice].value;
			}
			// Obtener el mensaje para el campo
			await muestraLosErrores(datosUrl, true);
			actualizaBotonSubmit();
			return;
		},
		actualizaPaises: () => {
			// Actualizar los ID del input
			// Variables
			let paisID = paisesSelect.value;
			// Si se eligió 'borrar', borra todo
			if (paisID == "borrar") {
				paisesSelect.value = "";
				paisesMostrar.value = "";
				paisesID.value = "";
				return;
			}
			// Verificar si figura en paisesID
			let agregar = !paisesID.value.includes(paisID);
			if (agregar) {
				if (paisesID.value.length >= 2 * 1 + 3 * 4) return; // Limita la cantidad máxima de países a 1 + 4 = 5
				paisesID.value += (paisesID.value ? " " : "") + paisID; // Actualiza el input
			} else paisesID.value = paisesID.value.replace(paisID, "").replace("  ", " ").trim(); // Quita el paisID solicitado

			// Actualizar los países a mostrar
			let paisesNombre = "";
			if (paisesID.value) {
				let paises_idArray = paisesID.value.split(" ");
				paises_idArray.forEach((pais_id) => {
					let paisNombre = paisesListado.find((n) => n.id == pais_id).nombre;
					paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
				});
			}
			paisesMostrar.value = paisesNombre;
			// Fin
			return;
		},
	};
	let DP = {
		// Actualizar la subcategoría
		actualizaOpsSubcat: () => {
			if (categoriaSelect.value) {
				// Actualiza las opciones de sub-categoría
				for (let opcion of subcategoriaOpciones) {
					opcion.className.includes(categoriaSelect.value)
						? opcion.classList.remove("ocultar")
						: opcion.classList.add("ocultar");
				}
				// La subcategoría puede tener un valor inicial
				if (!subcategoriaSelect.value) subcategoriaSelect.removeAttribute("disabled");
				// Habilita y actualiza el ayuda
				iconoAyudaSubcat.classList.remove("inactivo");
				// Deja visibles las ayudas correspondientes
				mensajesAyudaSubcat.forEach((mensaje) => {
					mensaje.className && !mensaje.className.includes(categoriaSelect.value)
						? mensaje.classList.add("ocultar")
						: mensaje.classList.remove("ocultar");
				});
			} else {
				// Borra la sub-categoría y la deja inactivada
				subcategoriaSelect.setAttribute("disabled", "disabled");
				subcategoriaSelect.value = "";
				// Inhabilita el ayuda
				iconoAyudaSubcat.classList.add("inactivo");
			}
			// Fin
			return;
		},
		// RCLV
		limpiaInputsRCLV: () => {
			// Borra el valor de los inputsRCLV
			inputsRCLV.forEach((input, i) => {
				input.value = "";
				iconosOK_RCLV[i].classList.add("ocultar");
				iconosError_RCLV[1].classList.add("ocultar");
			});
			// Fin
			return;
		},
		actualizaOpsRCLV: () => {
			// Borra los iconosOK_RCLV y los iconosError_RCLV
			for (let icono of iconosOK_RCLV) icono.classList.add("ocultar");
			for (let icono of iconosError_RCLV) icono.classList.add("ocultar");

			// Opciones si la subcategoría tiene valor
			if (subcategoriaSelect.value) {
				// Actualiza las opciones de RCLV
				let categID = categoriaSelect.value;
				subcategoria = subcategorias.find((n) => n.id == subcategoriaSelect.value);
				// Acciones si es una aparición mariana
				if (subcategoria.hechos_codigo == "AMA") {
					opcionesPersonaje.forEach((opcion) => {
						opcion.classList.contains("AM")
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});
					opcionesHecho.forEach((opcion) => {
						opcion.classList.contains(
							"AM" + (inputsRCLV[0].value != "1" ? inputsRCLV[0].value : "")
						)
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});
				} else {
					// Acciones para el PERSONAJE
					// Acciones si es una subcategoría selectiva
					if (subcategoria.pers_excluyente)
						opcionesPersonaje.forEach((opcion) => {
							opcion.classList.contains(subcategoria.id)
								? opcion.classList.remove("ocultar")
								: opcion.classList.add("ocultar");
						});
					// Acciones para los demás casos
					else
						opcionesPersonaje.forEach((opcion) => {
							opcion.classList.contains(categID)
								? opcion.classList.remove("ocultar")
								: opcion.classList.add("ocultar");
						});
					// Acciones para el HECHO
					// Acciones si es Jesús
					if (subcategoria.hechos_codigo == "JSS")
						opcionesHecho.forEach((opcion) => {
							opcion.classList.contains("JSS")
								? opcion.classList.remove("ocultar")
								: opcion.classList.add("ocultar");
						});
					// Acciones si es Contemporáneos de Jesús
					else if (subcategoria.hechos_codigo == "CNT")
						opcionesHecho.forEach((opcion) => {
							opcion.classList.contains("CNT")
								? opcion.classList.remove("ocultar")
								: opcion.classList.add("ocultar");
						});
					// Acciones si es no Exclusivo
					else if (subcategoria.hechos_codigo == "EXC")
						opcionesHecho.forEach((opcion) => {
							!opcion.classList.contains("EXC")
								? opcion.classList.remove("ocultar")
								: opcion.classList.add("ocultar");
						});
					// Acciones para los demás casos
					else
						opcionesHecho.forEach((opcion) => {
							opcion.classList.contains(categID)
								? opcion.classList.remove("ocultar")
								: opcion.classList.add("ocultar");
						});
				}
				// Muestra los campos RCLV
				for (let etiqueta of etiquetasRCLV) etiqueta.classList.remove("invisible");
			}
			// Opciones si la subcategoría no tiene valor
			else {
				// Oculta los campos RCLV
				for (let etiqueta of etiquetasRCLV) etiqueta.classList.add("invisible");
			}
			return;
		},
		interaccionesApMar: (campo) => {
			// Cambia el contenido del Personaje o Hecho
			// Acciones si se cambia el personaje
			if (campo == "personaje_id") {
				// Obtener del personaje, el 'id' de la Aparición Mariana
				let clases = Array.from(opcionesPersonaje).find(
					(n) => n.value == inputsRCLV[0].value
				).classList;
				clases = Array.from(clases);
				let indiceEnArray = clases.indexOf("AM") + 1;
				let id = clases[indiceEnArray].slice(2);
				// Cambia el contenido del Hecho
				inputsRCLV[1].value = id;
			}
			// Acciones si se cambia el hecho
			if (campo == "hecho_id") {
				let id = Array.from(opcionesPersonaje).find((n) =>
					n.classList.contains("AM" + inputsRCLV[1].value)
				).value;
				// Cambia el contenido del Personaje
				inputsRCLV[0].value = id;
			}
		},
		verificaUnaSolaOpcionRCLV: () => {
			// Rutina para los 2 tipos de RCLV
			let opPer = Array.from(opcionesPersonaje).filter((n) => !n.classList.contains("ocultar"));
			let opHec = Array.from(opcionesHecho).filter((n) => !n.classList.contains("ocultar"));
			// Cambios en personaje
			if (opPer.length == 1) inputsRCLV[0].value = opPer[0].value;
			// Cambios en hechos
			if (opHec.length == 1) inputsRCLV[1].value = opHec[0].value;
			// Fin
			return;
		},
		iconosEdicionRCLVs: () => {
			// Revisar todas las entidades RCLV
			linksEdicion.forEach((link, i) => {
				// Se muestra/oculta el ícono de editar el registro
				// Para los registros de 'Jesús' y Ninguno, permanecen ocultos
				if (inputsRCLV[i].value && inputsRCLV[i].value != 1 && inputsRCLV[i].value != 11) {
					link.classList.remove("ocultar");
				} else link.classList.add("ocultar");
			});
		},
		adicSubcat: (campo) => {
			let adicSubcategoria = "";
			if (campo != "subcategoria_id")
				adicSubcategoria += "&subcategoria_id=" + subcategoriaSelect.value;
			if (campo != "personaje_id") adicSubcategoria += "&personaje_id=" + inputsRCLV[0].value;
			if (campo != "hecho_id") adicSubcategoria += "&hecho_id=" + inputsRCLV[1].value;
			if (campo != "valor_id") adicSubcategoria += "&valor_id=" + inputsRCLV[2].value;
			return adicSubcategoria;
		},
	};

	// ADD EVENT LISTENERS *********************************
	// Averiguar si hubieron cambios
	form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = encodeURIComponent(e.target.value);
		if (paso.PC) {
			// Cambiar submit por '?'
			verificar();
			// Borrar los resultados anteriores
			resultado.innerHTML = "<br>";
			// Borrar las clases anteriores
			resultado.classList.remove(...resultado.classList);
			resultado.classList.add("sinResultado");
			// Prepara el datosUrl con los datos a validar
			var datosUrl = campo + "=" + valor;
		}
		if (paso.DD) {
			if (e.target == paisesSelect) {
				// Convierte los ID de los países elegidos, en un texto
				DD.actualizarPaises();
				// Definir los valores para 'campo' y 'valor'
				campo = paisesID.name;
				valor = paisesID.value;
			}
			var datosUrl = campo + "=" + valor;
		}
		if (paso.DP) {
			// Si se cambia la categoría --> actualiza subcategoría
			if (campo == "categoria_id") {
				subcategoriaSelect.value = "";
				DP.actualizaOpsSubcat();
				DP.limpiaInputsRCLV();
				DP.actualizaOpsRCLV();
			}
			// Si se cambia la subcategoría --> actualiza RCLV
			if (campo == "subcategoria_id") {
				DP.limpiaInputsRCLV();
				DP.actualizaOpsRCLV();
				DP.verificaUnaSolaOpcionRCLV();
				DP.iconosEdicionRCLVs();
				subcategoriaSelect.value == "JSS"
					? linkAltaJSS.classList.add("ocultar")
					: linkAltaJSS.classList.remove("ocultar");
			}
			// Verificar interacción para RCLV
			if (Array.from(e.target.classList).includes("RCLV")) {
				if (subcategoriaSelect.value == "AMA" && valor != "1") DP.interaccionesApMar(campo);
				DP.iconosEdicionRCLVs();
			}
			// Para que incluya los datos de la subcategoría y RCLVs, por si se necesitan para validar RCLV
			let adicSubcategoria = subcategoriaSelect.value ? DP.adicSubcat(campo) : "";
			// Prepara el datosUrl con los datos a validar
			var datosUrl = campo + "=" + valor + adicSubcategoria;
		}
		// Validar errores
		await muestraLosErrores(datosUrl, true);
		// Actualiza botón Submit
		actualizaBotonSubmit();
	});
	form.addEventListener("change", async (e) => {
		if (paso.DP) {
			// Obtener el valor para 'campo'
			let campo = e.target.name;
			let datos;
			// (Título original / castellano) + año lanzamiento
			if (campo == "nombre_original" || campo == "nombre_castellano" || campo == "ano_estreno") {
				datos = {campo1: "nombre_original", campo2: "ano_estreno"};
				DD.dosCampos(datos, campo);
				datos = {campo1: "nombre_castellano", campo2: "ano_estreno"};
				DD.dosCampos(datos, campo);
			}
			// Año de lanzamiento + año de finalización
			if ((campo == "ano_estreno" && campos.includes("ano_fin")) || campo == "ano_fin") {
				datos = {campo1: "ano_estreno", campo2: "ano_fin"};
				DD.dosCampos(datos, campo);
			}
		}
	});
	// Submit
	form.addEventListener("submit", async (e) => {
		submitForm(e);
	});
	submit.addEventListener("click", async (e) => {
		submitForm(e);
	});
	submit.addEventListener("keydown", async (e) => {
		if (e.key == "Enter" || e.key == "Space") submitForm(e);
	});

	// STATUS INICIAL *************************************
	if (paso.DP) {
		// Rutinas de categoría / subcategoría
		DP.actualizaOpsSubcat();
		if (subcategoriaSelect.value) DP.actualizaOpsRCLV();
		// Activar links RCLV
		DP.iconosEdicionRCLVs();
	}
	// Errores y boton 'Submit'
	let mostrarIconoError = paso.DD;
	statusInicial(mostrarIconoError);
});
