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
	// Variables
	let v = {
		// Variables generales
		form: document.querySelector("#dataEntry"),
		submit: document.querySelector("#dataEntry #submit"),
		// Datos
		inputs: document.querySelectorAll(".inputError .input"),
		// OK/Errores
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),
	};
	let campos = Array.from(v.inputs).map((n) => n.name);
	if (paso.PC) {
		v.resultado = document.querySelector("#dataEntry #resultado");
		v.rutaObtieneCantProds = (input) => {
			let palabrasClave = input.trim();
			// Procesando la información
			v.resultado.innerHTML = "Procesando la información...";
			v.resultado.classList.remove(...v.resultado.classList);
			v.resultado.classList.add("resultadoEnEspera");
			// Obtiene el link
			return "/producto/agregar/api/PC-cant-prods/?palabrasClave=" + palabrasClave;
		};
		v.mostrarResultados = async (resultados) => {
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
			v.resultado.innerHTML = oracion;
			v.resultado.classList.remove(...v.resultado.classList);
			v.resultado.classList.add(formatoVigente);
		};
		v.avanzar = () => {
			v.submit.classList.remove("fa-circle-question");
			v.submit.classList.add("fa-circle-check");
			v.submit.classList.remove("naranja");
			v.submit.classList.add("verde");
			v.submit.title = "Avanzar";
			return;
		};
		v.verificar = () => {
			v.submit.classList.remove("fa-circle-check");
			v.submit.classList.add("fa-circle-question");
			v.submit.classList.remove("verde");
			v.submit.classList.add("naranja");
			v.submit.title = "Verificar";
			v.submit.style = "background";
			return;
		};
	}
	if (paso.DD) {
		v.entidad = document.querySelector("#dataEntry #entidad").innerHTML;
		// Variables de país
		v.paisesSelect = document.querySelector("#paises_id select");
		if (v.paisesSelect) {
			v.paisesMostrar = document.querySelector("#paises_id #mostrarPaises"); // Lugar donde mostrar los nombres
			v.paisesID = document.querySelector("#paises_id input[name='paises_id']"); // Lugar donde almacenar los ID
			v.paisesListado = Array.from(document.querySelectorAll("#paises_id select option")).map((n) => {
				return {id: n.value, nombre: n.innerHTML};
			});
		}
		// Imagen derecha
		v.sinAvatar = document.querySelector("#imgDerecha img").src.includes("imagenes/0-Base");
	}
	if (paso.DP) {
		// Ayuda Sub-categoría
		v.iconoAyudaSubcat = document.querySelector("#ayudaSubcat .ayudaClick");
		v.mensajesAyudaSubcat = document.querySelectorAll("#ayudaSubcat ul li");
		// Categoría y subcategoría
		v.categoriaSelect = document.querySelector("select[name='categoria_id']");
		v.subcatSelect = document.querySelector("select[name='subcategoria_id']");
		v.subcategoriaOpciones = document.querySelectorAll("select[name='subcategoria_id'] option");
		v.subcategorias = await fetch("/producto/agregar/api/DP-obtiene-subcategs").then((n) => n.json());
		// Calificaciones y RCLV
		v.camposCalif = ["fe_valores_id", "entretiene_id", "calidad_tecnica_id"];
		v.camposRCLV = ["personaje_id", "hecho_id", "valor_id"];
		["Calif", "RCLV"].forEach((sector) => {
			v["inputs" + sector] = document.querySelectorAll("#" + sector + " .inputError .input");
			v["check" + sector] = document.querySelector("#" + sector + " #checkbox input");
			v["ocultar" + sector] = document.querySelector("#" + sector + " .selects");
		});
		// Datos RCLV
		v.RCLV = document.querySelector("#RCLV");
		v.iconosOK_RCLV = document.querySelectorAll("#RCLV .inputError .fa-circle-check");
		v.iconosError_RCLV = document.querySelectorAll("#RCLV .inputError .fa-circle-xmark");
		v.opcionesPersonaje = document.querySelectorAll("select[name='personaje_id'] option");
		v.opcionesHecho = document.querySelectorAll("select[name='hecho_id'] option");
		v.linkPersAlta = document.querySelector(".inputError .linkRCLV.alta");
		v.linksRCLVEdic = document.querySelectorAll(".inputError .linkRCLV.edicion");
	}
	// Ruta
	let rutaValidar = "/producto/agregar/api/valida/" + paso.paso + "/?";

	// FUNCIONES *******************************************
	let statusInicial = async (mostrarIconoError) => {
		//Buscar todos los valores
		let datosUrl = "";
		v.inputs.forEach((input, i) => {
			// Caracter de unión para i>0
			if (i) datosUrl += "&";
			// Particularidad para DD
			if (paso.DD && input.name == "avatar" && !v.sinAvatar) return;
			// Particularidades para DP
			if (paso.DP)
				for (let sector of ["Calif", "RCLV"])
					if (v["campos" + sector].includes(input.name) && v["check" + sector].checked) {
						datosUrl += input.name + "=OK";
						return;
					}
			// Agrega el campo y el valor
			datosUrl += input.name + "=" + encodeURIComponent(input.value);
		});
		// Consecuencias de las validaciones de errores
		await muestraLosErrores(datosUrl, mostrarIconoError);
		actualizaBotonSubmit();
		// Muestra u oculta el sector que corresponda
		for (let campo of ["sinCalif", "sinRCLV"]) DP.muestraOcultaElSector(campo);
		// Fin
		return;
	};
	let muestraLosErrores = async (datos, mostrarIconoError) => {
		let errores = await fetch(rutaValidar + datos).then((n) => n.json());
		campos.forEach((campo, indice) => {
			if (errores[campo] !== undefined) {
				v.mensajesError[indice].innerHTML = errores[campo];
				// Acciones en función de si hay o no mensajes de error
				errores[campo]
					? v.iconosError[indice].classList.add("error")
					: v.iconosError[indice].classList.remove("error");
				errores[campo] && mostrarIconoError
					? v.iconosError[indice].classList.remove("ocultar")
					: v.iconosError[indice].classList.add("ocultar");
				errores[campo]
					? v.iconosOK[indice].classList.add("ocultar")
					: v.iconosOK[indice].classList.remove("ocultar");
			}
		});
		// Fin
		return;
	};
	let actualizaBotonSubmit = () => {
		// Detectar la cantidad de 'errores' ocultos
		let hayErrores = Array.from(v.iconosError)
			.map((n) => n.className)
			.some((n) => n.includes("error"));
		// Consecuencias
		hayErrores ? v.submit.classList.add("inactivo") : v.submit.classList.remove("inactivo");
	};
	let submitForm = async (e) => {
		e.preventDefault();
		if (paso.PC)
			if (v.submit.classList.contains("fa-circle-question")) {
				if (!v.submit.classList.contains("inactivo")) {
					v.submit.classList.add("inactivo");
					let ruta = v.rutaObtieneCantProds(v.inputs[0].value);
					let resultados = await fetch(ruta).then((n) => n.json());
					v.mostrarResultados(resultados);
					v.submit.classList.remove("inactivo");
					v.avanzar();
				} else statusInicial(true);
			} else v.form.submit();
		else if (v.submit.classList.contains("inactivo")) statusInicial(true);
		else v.form.submit();
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
				v.inputs[indice1].value &&
				!v.mensajesError[indice1].innerHTML &&
				v.inputs[indice2].value &&
				!v.mensajesError[indice2].innerHTML
			)
				this.camposCombinados(camposComb);
			return;
		},
		camposCombinados: async (camposComb) => {
			// Armado de la ruta
			let datosUrl = "entidad=" + v.entidad;
			for (let i = 0; i < camposComb.length; i++) {
				let indice = campos.indexOf(camposComb[i]);
				datosUrl += "&" + camposComb[i] + "=" + v.inputs[indice].value;
			}
			// Obtiene el mensaje para el campo
			await muestraLosErrores(datosUrl, true);
			actualizaBotonSubmit();
			return;
		},
		actualizaPaises: () => {
			// Actualizar los ID del input
			// Variables
			let paisID = v.paisesSelect.value;
			// Si se eligió 'borrar', borra todo
			if (paisID == "borrar") {
				v.paisesSelect.value = "";
				v.paisesMostrar.value = "";
				v.paisesID.value = "";
				return;
			}
			// Verificar si figura en paisesID
			let agregar = !v.paisesID.value.includes(paisID);
			if (agregar) {
				if (v.paisesID.value.length >= 2 * 1 + 3 * 4) return; // Limita la cantidad máxima de países a 1 + 4 = 5
				v.paisesID.value += (v.paisesID.value ? " " : "") + paisID; // Actualiza el input
			} else v.paisesID.value = v.paisesID.value.replace(paisID, "").replace("  ", " ").trim(); // Quita el paisID solicitado

			// Actualizar los países a mostrar
			let paisesNombre = "";
			if (v.paisesID.value) {
				let paises_idArray = v.paisesID.value.split(" ");
				paises_idArray.forEach((pais_id) => {
					let paisNombre = v.paisesListado.find((n) => n.id == pais_id).nombre;
					paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
				});
			}
			v.paisesMostrar.value = paisesNombre;
			// Fin
			return;
		},
	};
	let DP = {
		// Actualizar la subcategoría
		actualizaOpsSubcat: () => {
			if (v.categoriaSelect.value) {
				// Actualiza las opciones de sub-categoría
				for (let opcion of v.subcategoriaOpciones) {
					opcion.className.includes(v.categoriaSelect.value)
						? opcion.classList.remove("ocultar")
						: opcion.classList.add("ocultar");
				}
				// La subcategoría puede tener un valor inicial
				if (!v.subcatSelect.value) v.subcatSelect.removeAttribute("disabled");
				// Habilita y actualiza el ayuda
				v.iconoAyudaSubcat.classList.remove("inactivo");
				// Deja visibles las ayudas correspondientes
				v.mensajesAyudaSubcat.forEach((mensaje) => {
					mensaje.className && !mensaje.className.includes(v.categoriaSelect.value)
						? mensaje.classList.add("ocultar")
						: mensaje.classList.remove("ocultar");
				});
			} else {
				// Borra la sub-categoría y la deja inactivada
				v.subcatSelect.setAttribute("disabled", "disabled");
				v.subcatSelect.value = "";
				// Inhabilita el ayuda
				v.iconoAyudaSubcat.classList.add("inactivo");
			}
			// Fin
			return;
		},
		// RCLV
		limpiaInputsRCLV: () => {
			// Borra el valor de los inputsRCLV
			v.inputsRCLV.forEach((input, i) => {
				input.value = "1";
				v.iconosOK_RCLV[i].classList.add("ocultar");
				v.iconosError_RCLV[1].classList.add("ocultar");
			});
			// Fin
			return;
		},
		actualizaOpsRCLV: () => {
			// Variables
			let clave;
			// Borra los iconosOK_RCLV y los iconosError_RCLV
			for (let icono of v.iconosOK_RCLV) icono.classList.add("ocultar");
			for (let icono of v.iconosError_RCLV) icono.classList.add("ocultar");

			// Si la subcategoría tiene valor --> restricción en las opciones
			if (v.subcatSelect.value) {
				// Actualiza las opciones de RCLV
				let categoriaValor = v.categoriaSelect.value;
				v.subcategoria = v.subcategorias.find((n) => n.id == v.subcatSelect.value);

				// Acciones para el PERSONAJE
				// 1. Restringido por subcategoría
				if (v.subcategoria.pers_codigo)
					v.opcionesPersonaje.forEach((opcion) => {
						opcion.classList.contains(v.subcategoria.id)
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});
				// 2. Restringido por categoría
				else
					v.opcionesPersonaje.forEach((opcion) => {
						opcion.classList.contains(categoriaValor)
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});

				// Acciones para el HECHO
				clave = v.subcategoria.hechos_codigo;
				// 1. Restringido por subcategoría
				if (clave)
					v.opcionesHecho.forEach((opcion) => {
						opcion.classList.contains(clave)
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});
				// 2. Restringido por categoría
				else
					v.opcionesHecho.forEach((opcion) => {
						opcion.classList.contains(categoriaValor)
							? opcion.classList.remove("ocultar")
							: opcion.classList.add("ocultar");
					});

				// Muestra los campos RCLV
				RCLV.classList.remove("invisible");
			}
			// Si la subcategoría no tiene valor --> oculta los campos RCLV
			else RCLV.classList.add("invisible");

			// Fin
			return;
		},
		verificaUnaSolaOpcionRCLV: () => {
			// Rutina para los 2 tipos de RCLV
			let opPer = Array.from(v.opcionesPersonaje).filter((n) => !n.classList.contains("ocultar"));
			let opHec = Array.from(v.opcionesHecho).filter((n) => !n.classList.contains("ocultar"));
			// Cambios en personaje
			if (opPer.length == 1) v.inputsRCLV[0].value = opPer[0].value;
			// Cambios en hechos
			if (opHec.length == 1) v.inputsRCLV[1].value = opHec[0].value;
			// Fin
			return;
		},
		particsJesusNinguno: () => {
			// 1. Acciones para Editar
			// 1.1. Acciones si el valor es 'Ninguno'
			v.inputsRCLV.forEach((inputRCLV, indice) => {
				inputRCLV.value == "1"
					? v.linksRCLVEdic[indice].classList.add("ocultar")
					: v.linksRCLVEdic[indice].classList.remove("ocultar");
			});
			// 1.2. Acciones si elvalor es 'Jesús'
			if (v.inputsRCLV[0].value == "11") v.linksRCLVEdic[0].classList.add("ocultar");

			// 2. Acciones para Agregar
			v.subcatSelect.value == "JSS"
				? v.linkPersAlta.classList.add("ocultar")
				: v.linkPersAlta.classList.remove("ocultar");

			// Fin
			return;
		},
		interaccionesApMar: function (campo) {
			// Cambia el contenido del Personaje o Hecho
			// Acciones si se cambia el personaje
			if (campo == "personaje_id") {
				// Obtiene del personaje, el 'id' de la Aparición Mariana
				for (var opcion of v.opcionesPersonaje) if (opcion.value == v.inputsRCLV[0].value) break;
				let clases = opcion.className.split(" ");
				let indice = clases.indexOf("AMA");
				clases.splice(indice, 1);
				let id = clases[indice].slice(2);
				// Cambia el contenido del Hecho
				v.inputsRCLV[1].value = id;
			}
			// Acciones si se cambia el hecho
			if (campo == "hecho_id") {
				// Muestra los personajes que hayan presenciado la aparición y oculta los demás
				v.opcionesPersonaje.forEach((opcion) => {
					if (opcion.className.includes("AM" + v.inputsRCLV[1].value))
						opcion.classList.remove("ocultar");
					else opcion.classList.add("ocultar");
				});
				// Cambia el contenido del Personaje
				this.verificaUnaSolaOpcionRCLV();
			}
		},
		datosUrl: (campo) => {
			// Obtiene el sector (todos los demás campos son del sector 'RCLV')
			let sector = campo == "sinCalif" ? "Calif" : "RCLV";
			// Otras variables
			let checked = v["check" + sector].checked;
			// Agrega el valor del campo 'sin' o todos los campos
			let url = "";
			checked
				? (url += campo + "=on" + "&")
				: v["campos" + sector].forEach((n, i) => {
						url += n + "=" + v["inputs" + sector][i].value + "&";
				  });
			// Agrega la subcategoría, si corresponde
			if (sector == "RCLV" && v.subcatSelect.value) url += "subcategoria_id=" + v.subcatSelect.value;
			// Fin
			return url;
		},
		muestraOcultaElSector: (campo) => {
			// Variables
			let sector = campo.slice(3);
			// Acción
			v["check" + sector].checked
				? v["ocultar" + sector].classList.add("ocultar")
				: v["ocultar" + sector].classList.remove("ocultar");
			// Fin
			return;
		},
	};

	// ADD EVENT LISTENERS *********************************
	// Averigua si hubieron cambios
	v.form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = encodeURIComponent(e.target.value);
		let datosUrl = "";
		// Particularidades por paso
		if (paso.PC) {
			// Cambiar submit por '?'
			v.verificar();
			// Borrar los resultados anteriores
			v.resultado.innerHTML = "<br>";
			// Borrar las clases anteriores
			v.resultado.classList.remove(...v.resultado.classList);
			v.resultado.classList.add("sinResultado");
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
			if (e.target == v.paisesSelect) {
				DD.actualizaPaises();
				// Definir los valores para 'campo' y 'valor'
				campo = v.paisesID.name;
				valor = v.paisesID.value;
			}
			datosUrl = campo + "=" + valor;
		}
		if (paso.DP) {
			// Particularidades si se cambia la categoría
			if (campo == "categoria_id") {
				v.subcatSelect.value = "";
				DP.actualizaOpsSubcat();
				DP.limpiaInputsRCLV();
				DP.actualizaOpsRCLV();
			}
			// Particularidades si se cambia la subcategoría
			if (campo == "subcategoria_id") {
				DP.limpiaInputsRCLV();
				DP.actualizaOpsRCLV();
				DP.verificaUnaSolaOpcionRCLV();
			}

			// Particularidades si se elije el personaje 'Jesús' o 'Ninguno'
			if (["subcategoria_id", ...v.camposRCLV].includes(campo)) DP.particsJesusNinguno();

			// Particularidades si la subcategoría es AMA y se elije un RCLV
			if (v.subcatSelect.value == "AMA" && v.camposRCLV.includes(campo)) DP.interaccionesApMar(campo);

			// Prepara el datosUrl con los datos a validar
			if (campo == "sinCalif" || campo == "sinRCLV") DP.muestraOcultaElSector(campo);
			if (["subcategoria_id", ...v.camposRCLV, "sinCalif", "sinRCLV"].includes(campo))
				datosUrl += DP.datosUrl(campo);
			else datosUrl += campo + "=" + valor;
		}
		// Validar errores
		await muestraLosErrores(datosUrl, true);
		// Actualiza botón Submit
		actualizaBotonSubmit();
	});
	if (paso.DP) {
		v.form.addEventListener("change", async (e) => {
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
	v.form.addEventListener("submit", async (e) => {
		submitForm(e);
	});
	v.submit.addEventListener("click", async (e) => {
		submitForm(e);
	});
	v.submit.addEventListener("keydown", async (e) => {
		if (e.key == "Enter" || e.key == "Space") submitForm(e);
	});

	// STATUS INICIAL *************************************
	if (paso.DP) {
		// Rutinas de categoría / subcategoría
		DP.actualizaOpsSubcat();
		if (v.subcatSelect.value) DP.actualizaOpsRCLV();
		// Activar links RCLV
		DP.particsJesusNinguno();
	}
	// Errores y boton 'Submit'
	let mostrarIconoError = paso.DD; // En DD se muestran los errores iniciales siempre;
	statusInicial(mostrarIconoError);
});
