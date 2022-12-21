"use strict";
window.addEventListener("load", async () => {
	// Averigua el 'paso'
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
	let inputs = document.querySelectorAll(".inputError .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// OK/Errores
	let iconosError = document.querySelectorAll(".inputError .fa-circle-xmark");
	let iconosOK = document.querySelectorAll(".inputError .fa-circle-check");
	let mensajesError = document.querySelectorAll(".inputError .mensajeError");
	if (paso.PC) {
		var resultado = document.querySelector("#dataEntry #resultado");
		var rutaObtieneCantProds = (input) => {
			let palabrasClave = input.trim();
			// Procesando la información
			resultado.innerHTML = "Procesando la información...";
			resultado.classList.remove(...resultado.classList);
			resultado.classList.add("resultadoEnEspera");
			// Obtiene el link
			return "/producto/agregar/api/PC-cant-prods/?palabrasClave=" + palabrasClave;
		};
		var mostrarResultados = async (resultados) => {
			// Variables
			let {cantProds, cantProdsNuevos, hayMas} = resultados;
			// Determinar oracion y formato
			let formatoVigente, oracion;
			// Resultado exitoso
			if (cantProds > 0 && !hayMas) {
				oracion =
					"Encontramos " +
					(cantProds == 1
						? "1 sola coincidencia, que " + (cantProdsNuevos ? "no" : "ya")
						: cantProds +
						  " coincidencias, " +
						  (cantProdsNuevos == cantProds
								? "y ninguna"
								: cantProdsNuevos
								? cantProdsNuevos + " no"
								: "y todas")) +
					" está" +
					(cantProdsNuevos > 1 && cantProdsNuevos != cantProds ? "n" : "") +
					" en nuestra BD";
				formatoVigente = "resultadoExitoso";
			} else {
				// Resultados inválidos
				formatoVigente = "resultadoInvalido";
				oracion = hayMas
					? "Hay demasiadas coincidencias (+" + cantProds + "), intentá ser más específico"
					: cantProds == 0
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
		// Imagen derecha
		var sinAvatar = document.querySelector("#imagenDerecha img").src.includes("imagenes/0-Base");
	}
	if (paso.DP) {
		// Ayuda Sub-categoría
		var iconoAyudaSubcat = document.querySelector("#ayudaSubcat .ayudaClick");
		var mensajesAyudaSubcat = document.querySelectorAll("#ayudaSubcat ul li");
		// Categoría y subcategoría
		var categoriaSelect = document.querySelector("select[name='categoria_id']");
		var subcatSelect = document.querySelector("select[name='subcategoria_id']");
		var subcategoriaOpciones = document.querySelectorAll("select[name='subcategoria_id'] option");
		var subcategorias = await fetch("/producto/agregar/api/DP-obtiene-subcategs").then((n) => n.json());
		var subcategoria;
		// Datos RCLV
		var inputsRCLV = document.querySelectorAll(".inputError .input.RCLV");
		var linkPersAlta = document.querySelector(".inputError .linkRCLV.alta");
		var linksPersEdic = document.querySelectorAll(".inputError .linkRCLV.edicion");
		var iconosOK_RCLV = document.querySelectorAll(".RCLV .inputError .fa-circle-check");
		var iconosError_RCLV = document.querySelectorAll(".RCLV .inputError .fa-circle-xmark");
		var selectPersonaje = document.querySelector("select[name='personaje_id']");
		var opcionesPersonaje = document.querySelectorAll("select[name='personaje_id'] option.RCLV");
		var opcionesHecho = document.querySelectorAll("select[name='hecho_id'] option.RCLV");
		var invisibles = document.querySelectorAll(".invisible");
	}
	// Ruta
	let rutaValidar = "/producto/agregar/api/valida/" + paso.paso + "/?";

	// FUNCIONES *******************************************
	let statusInicial = async (mostrarIconoError) => {
		//Buscar todos los valores
		let datosUrl = "";
		inputs.forEach((input, i) => {
			// Caracter de unión para i>0
			if (i) datosUrl += "&";
			if (paso.DD && input.name == "avatar" && !sinAvatar) return;
			datosUrl += input.name + "=" + encodeURIComponent(input.value);
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
				errores[campo]
					? iconosOK[indice].classList.add("ocultar")
					: iconosOK[indice].classList.remove("ocultar");
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
					let ruta = rutaObtieneCantProds(inputs[0].value);
					let resultados = await fetch(ruta).then((n) => n.json());
					mostrarResultados(resultados);
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
			// Obtiene el mensaje para el campo
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
				if (!subcatSelect.value) subcatSelect.removeAttribute("disabled");
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
				subcatSelect.setAttribute("disabled", "disabled");
				subcatSelect.value = "";
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
				input.value = "1";
				iconosOK_RCLV[i].classList.add("ocultar");
				iconosError_RCLV[1].classList.add("ocultar");
			});
			// Fin
			return;
		},
		actualizaOpsRCLV: () => {
			// Variables
			let clave;
			// Borra los iconosOK_RCLV y los iconosError_RCLV
			for (let icono of iconosOK_RCLV) icono.classList.add("ocultar");
			for (let icono of iconosError_RCLV) icono.classList.add("ocultar");

			// Si la subcategoría tiene valor --> restricción en las opciones
			if (subcatSelect.value) {
				// Actualiza las opciones de RCLV
				let categoriaValor = categoriaSelect.value;
				subcategoria = subcategorias.find((n) => n.id == subcatSelect.value);

				// Acciones para el PERSONAJE
				// 1. Restringido por subcategoría
				if (subcategoria.pers_codigo)
					opcionesPersonaje.forEach((opcion) => {
						opcion.classList.contains(subcategoria.id)
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});
				// 2. Restringido por categoría
				else
					opcionesPersonaje.forEach((opcion) => {
						opcion.classList.contains(categoriaValor)
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});

				// Acciones para el HECHO
				clave = subcategoria.hechos_codigo;
				// 1. Restringido por subcategoría
				if (clave)
					opcionesHecho.forEach((opcion) => {
						opcion.classList.contains(clave)
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});
				// 2. Restringido por categoría
				else
					opcionesHecho.forEach((opcion) => {
						opcion.classList.contains(categoriaValor)
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});

				// Muestra los campos RCLV
				for (let invisible of invisibles) invisible.classList.remove("invisible");
			}
			// Si la subcategoría no tiene valor --> oculta los campos RCLV
			else for (let invisible of invisibles) invisible.classList.add("invisible");

			// Fin
			return;
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
		particsJesusNinguno: () => {
			// 1. Acciones para Editar
			// 1.1. Acciones si el valor es 'Ninguno'
			inputsRCLV.forEach((inputRCLV, indice) => {
				inputRCLV.value == "1"
					? linksPersEdic[indice].classList.add("ocultar")
					: linksPersEdic[indice].classList.remove("ocultar");
			});
			// 1.2. Acciones si elvalor es 'Jesús'
			if (inputsRCLV[0].value == "11") linksPersEdic[0].classList.add("ocultar");

			// 2. Acciones para Agregar
			subcatSelect.value == "JSS"
				? linkPersAlta.classList.add("ocultar")
				: linkPersAlta.classList.remove("ocultar");

			// Fin
			return;
		},
		interaccionesApMar: function (campo) {
			// Cambia el contenido del Personaje o Hecho
			// Acciones si se cambia el personaje
			if (campo == "personaje_id") {
				// Obtiene del personaje, el 'id' de la Aparición Mariana
				for (var opcion of opcionesPersonaje) if (opcion.value == inputsRCLV[0].value) break;
				let clases = opcion.className.split(" ");
				let indice = clases.indexOf("AMA");
				clases.splice(indice, 1);
				let id = clases[indice].slice(2);
				// Cambia el contenido del Hecho
				inputsRCLV[1].value = id;
			}
			// Acciones si se cambia el hecho
			if (campo == "hecho_id") {
				// Muestra los personajes que hayan presenciado la aparición y oculta los demás
				opcionesPersonaje.forEach((opcion) => {
					if (opcion.className.includes("AM" + inputsRCLV[1].value))
						opcion.classList.remove("ocultar");
					else opcion.classList.add("ocultar");
				});
				// Cambia el contenido del Personaje
				this.verificaUnaSolaOpcionRCLV();
			}
		},
		adicSubcat: (campo) => {
			let adicSubcategoria = "";
			if (campo != "subcategoria_id") adicSubcategoria += "&subcategoria_id=" + subcatSelect.value;
			if (campo != "personaje_id") adicSubcategoria += "&personaje_id=" + inputsRCLV[0].value;
			if (campo != "hecho_id") adicSubcategoria += "&hecho_id=" + inputsRCLV[1].value;
			if (campo != "valor_id") adicSubcategoria += "&valor_id=" + inputsRCLV[2].value;
			return adicSubcategoria;
		},
	};

	// ADD EVENT LISTENERS *********************************
	// Averigua si hubieron cambios
	form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = encodeURIComponent(e.target.value);
		let datosUrl;
		// Particularidades por paso
		if (paso.PC) {
			// Cambiar submit por '?'
			verificar();
			// Borrar los resultados anteriores
			resultado.innerHTML = "<br>";
			// Borrar las clases anteriores
			resultado.classList.remove(...resultado.classList);
			resultado.classList.add("sinResultado");
			// Prepara el datosUrl con los datos a validar
			datosUrl = campo + "=" + valor;
		}
		if (paso.DD) {
			// Primera letra en mayúscula (sólo para Datos Duros)
			if (
				(e.target.localName == "input" && e.target.type == "text") ||
				e.target.localName == "textarea"
			) {
				valor = e.target.value;
				e.target.value = valor.slice(0, 1).toUpperCase() + valor.slice(1);
				valor = encodeURIComponent(e.target.value);
			}

			// Convierte los ID de los países elegidos, en un texto
			if (e.target == paisesSelect) {
				DD.actualizaPaises();
				// Definir los valores para 'campo' y 'valor'
				campo = paisesID.name;
				valor = paisesID.value;
			}
			datosUrl = campo + "=" + valor;
		}
		if (paso.DP) {
			// Si se cambia la categoría
			if (campo == "categoria_id") {
				subcatSelect.value = "";
				DP.actualizaOpsSubcat();
				DP.limpiaInputsRCLV();
				DP.actualizaOpsRCLV();
			}
			// Si se cambia la subcategoría
			if (campo == "subcategoria_id") {
				DP.limpiaInputsRCLV();
				DP.actualizaOpsRCLV();
				DP.verificaUnaSolaOpcionRCLV();
			}

			// Particularidades si se elije el personaje 'Jesús' o 'Ninguno'
			if (campo == "subcategoria_id" || e.target.className.includes("RCLV")) DP.particsJesusNinguno();

			// Particularidades si la subcategoría es AMA y se elije un RCLV
			if (subcatSelect.value == "AMA" && e.target.className.includes("RCLV"))
				DP.interaccionesApMar(campo);

			// Datos de la subcategoría y rclvs, por si se necesitan para validar RCLV
			let adicSubcategoria = subcatSelect.value ? DP.adicSubcat(campo) : "";
			// Prepara el datosUrl con los datos a validar
			datosUrl = campo + "=" + valor + adicSubcategoria;
		}
		// Validar errores
		await muestraLosErrores(datosUrl, true);
		// Actualiza botón Submit
		actualizaBotonSubmit();
	});
	if (paso.DP) {
		form.addEventListener("change", async (e) => {
			// Obtiene el valor para 'campo'
			let campo = e.target.name;
			let datos;
			// (Título original / castellano) + año ano_estreno
			if (campo == "nombre_original" || campo == "nombre_castellano" || campo == "ano_estreno") {
				datos = {campo1: "nombre_original", campo2: "ano_estreno"};
				DD.dosCampos(datos, campo);
				datos = {campo1: "nombre_castellano", campo2: "ano_estreno"};
				DD.dosCampos(datos, campo);
			}
			// Año de ano_estreno + año de finalización
			if ((campo == "ano_estreno" && campos.includes("ano_fin")) || campo == "ano_fin") {
				datos = {campo1: "ano_estreno", campo2: "ano_fin"};
				DD.dosCampos(datos, campo);
			}
		});
	}
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
		if (subcatSelect.value) DP.actualizaOpsRCLV();
		// Activar links RCLV
		DP.particsJesusNinguno();
	}
	// Errores y boton 'Submit'
	let mostrarIconoError = paso.DD; // En DD se muestran los errores iniciales siempre;
	statusInicial(mostrarIconoError);
});
