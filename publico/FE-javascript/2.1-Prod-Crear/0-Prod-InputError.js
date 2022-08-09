"use strict";
window.addEventListener("load", async () => {
	// Averiguar el 'paso'
	let url = window.location.pathname;
	let paso = url.slice(url.lastIndexOf("/") + 1);
	let PC = paso == "palabras-clave";
	let DD = paso == "datos-duros";
	let DP = paso == "datos-personalizados";
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let submit = document.querySelector("#dataEntry #submit");
	// Datos
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// OK/Errores
	let iconosOK = document.querySelectorAll(".input-error .fa-circle-check");
	let iconosError = document.querySelectorAll(".input-error .fa-circle-xmark");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	if (PC) {
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
	if (DD) {
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
	if (DP) {
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
	let rutaValidar = "/producto/agregar/api/validar/" + paso + "/?";

	// FUNCIONES *******************************************
	let statusInicial = async (mostrarIconoError) => {
		//Buscar todos los valores
		let datosUrl = "";
		let dato;
		inputs.forEach((input, i) => {
			if (i) datosUrl += "&";
			if (DD && input.name == "avatar") return;
			datosUrl += input.name + "=";
			datosUrl += encodeURIComponent(input.value);
			// if(i==4) console.log(input.name,input.value);
		});
		// Consecuencias de las validaciones de errores
		await validarErrores(datosUrl, mostrarIconoError);
		activarInactivarBotonSubmit();
		// Fin
		return;
	};
	let validarErrores = async (datosUrl, mostrarIconoError) => {
		let errores = await fetch(rutaValidar + datosUrl).then((n) => n.json());
		campos.forEach((campo, indice) => {
			if (errores[campo] !== undefined) {
				mensajesError[indice].innerHTML = errores[campo];
				errores[campo]
					? iconosOK[indice].classList.add("ocultar")
					: iconosOK[indice].classList.remove("ocultar");
				errores[campo] && mostrarIconoError
					? iconosError[indice].classList.remove("ocultar")
					: iconosError[indice].classList.add("ocultar");
			}
			// if(indice==4) console.log(errores[campo]);
		});
		// Fin
		return;
	};
	let activarInactivarBotonSubmit = () => {
		// Detectar la cantidad de 'iconosOK' que no corresponden por motivos de RCLV
		let OKs_innec = DP ? 2 : 0;

		// Detectar la cantidad de 'aciertos' ocultos
		let OKs_ocultos = Array.from(iconosOK)
			.map((n) => n.className)
			.join(" ")
			.split(" ")
			.reduce((a, b) => {
				return a[b] ? ++a[b] : (a[b] = 1), a;
			}, {}).ocultar;

		// Detectar la cantidad de 'errores' ocultos
		let errores_ocultos = Array.from(iconosError)
			.map((n) => n.className)
			.join(" ")
			.split(" ")
			.reduce((a, b) => {
				return a[b] ? ++a[b] : (a[b] = 1), a;
			}, {}).ocultar;

		// Consecuencias
		let OK = OKs_ocultos == OKs_innec || (!OKs_ocultos && !OKs_innec);
		let error = errores_ocultos == iconosError.length || (!errores_ocultos && !iconosError.length);
		OK && error ? submit.classList.remove("inactivo") : submit.classList.add("inactivo");
		// Pruebas
		// console.log(OKs_ocultos, OKs_innec);
		// console.log(errores_ocultos, iconosError.length);
		// console.log(OK, error);
	};
	let submitForm = async (e) => {
		e.preventDefault();
		if (PC)
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
	};
	if (DD) {
		var funcionDosCampos = async (datos, campo) => {
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
				funcionCamposCombinados(camposComb, campo1);
			return;
		};
		var funcionCamposCombinados = async (camposComb, campo) => {
			// Armado de la ruta
			let datosUrl = "entidad=" + entidad;
			let indice = [];
			for (let i = 0; i < camposComb.length; i++) {
				indice.push(campos.indexOf(camposComb[i]));
				datosUrl += "&" + camposComb[i] + "=" + inputs[indice[i]].value;
			}
			// Obtener el mensaje para el campo
			await validarErrores(datosUrl, true);
			activarInactivarBotonSubmit();
			return;
		};
		var funcionPaises = () => {
			let paisID = paisesSelect.value;
			if (paisID == "borrar") {
				paisesSelect.value = "";
				paisesMostrar.value = "";
				paisesID.value = "";
				return;
			}
			// Verificar si figura en paisesID
			let agregar = !paisesID.value.includes(paisID);
			// Si no figura en paisesID, agregárselo
			if (agregar) {
				// Limita la cantidad máxima de países a 1+4 = 5, para permitir el mensaje de error
				if (paisesID.value.length >= 2 * 1 + 4 * 4) return;
				paisesID.value += !paisesID.value ? paisID : ", " + paisID;
			} else {
				// Si sí figura, quitárselo
				let paises_idArray = paisesID.value.split(", ");
				let indice = paises_idArray.indexOf(paisID);
				paises_idArray.splice(indice, 1);
				paisesID.value = paises_idArray.join(", ");
			}
			// Agregar los países a mostrar
			let paisesNombre = "";
			if (paisesID.value) {
				let paises_idArray = paisesID.value.split(", ");
				for (let pais_id of paises_idArray) {
					let paisNombre = paisesListado.find((n) => n.id == pais_id).nombre;
					paisesNombre += (paisesNombre ? ", " : "") + paisNombre;
				}
			}
			paisesMostrar.value = paisesNombre;
			// Fin
			return;
		};
	}
	if (DP) {
		// Actualizar la subcategoría
		var actualizaOpsSubcat = () => {
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
		};
		// RCLV
		var limpiaInputsRCLV = () => {
			// Borra el valor de los inputsRCLV
			inputsRCLV.forEach((input, i) => {
				input.value = "";
				iconosOK_RCLV[i].classList.add("ocultar");
				iconosError_RCLV[1].classList.add("ocultar");
			});
			// Fin
			return;
		};
		var actualizaOpsRCLV = () => {
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
		};
		var interaccionesApMar = (campo) => {
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
		};
		var verificaUnaSolaOpcionRCLV = () => {
			// Rutina para los 2 tipos de RCLV
			let opPer = Array.from(opcionesPersonaje).filter((n) => !n.classList.contains("ocultar"));
			let opHec = Array.from(opcionesHecho).filter((n) => !n.classList.contains("ocultar"));
			// Cambios en personaje
			if (opPer.length == 1) inputsRCLV[0].value = opPer[0].value;
			// Cambios en hechos
			if (opHec.length == 1) inputsRCLV[1].value = opHec[0].value;
			// Fin
			return;
		};
		var iconosEdicionRCLVs = () => {
			// Revisar todas las entidades RCLV
			linksEdicion.forEach((link, i) => {
				// Se muestra/oculta el ícono de editar el registro
				// Para los registros de 'Jesús' y Ninguno, permanecen ocultos
				if (inputsRCLV[i].value && inputsRCLV[i].value != 1 && inputsRCLV[i].value != 11) {
					link.classList.remove("ocultar");
				} else link.classList.add("ocultar");
			});
		};
		var funcionAdicSubcat = (campo) => {
			let adicSubcategoria = "";
			if (campo != "subcategoria_id")
				adicSubcategoria += "&subcategoria_id=" + subcategoriaSelect.value;
			if (campo != "personaje_id") adicSubcategoria += "&personaje_id=" + inputsRCLV[0].value;
			if (campo != "hecho_id") adicSubcategoria += "&hecho_id=" + inputsRCLV[1].value;
			if (campo != "valor_id") adicSubcategoria += "&valor_id=" + inputsRCLV[2].value;
			return adicSubcategoria;
		};
	}

	// ADD EVENT LISTENERS *********************************
	// Averiguar si hubieron cambios
	form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = encodeURIComponent(e.target.value);
		if (PC) {
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
		if (DD) {
			if (e.target == paisesSelect) {
				// Convierte los ID de los países elegidos, en un texto
				funcionPaises();
				// Definir los valores para 'campo' y 'valor'
				campo = paisesID.name;
				valor = paisesID.value;
			}
			var datosUrl = campo + "=" + valor;
		}
		if (DP) {
			// Si se cambia la categoría --> actualiza subcategoría
			if (campo == "categoria_id") {
				subcategoriaSelect.value = "";
				actualizaOpsSubcat();
				limpiaInputsRCLV();
				actualizaOpsRCLV();
			}
			// Si se cambia la subcategoría --> actualiza RCLV
			if (campo == "subcategoria_id") {
				limpiaInputsRCLV();
				actualizaOpsRCLV();
				verificaUnaSolaOpcionRCLV();
				iconosEdicionRCLVs();
				subcategoriaSelect.value == "JSS"
					? linkAltaJSS.classList.add("ocultar")
					: linkAltaJSS.classList.remove("ocultar");
			}
			// Verificar interacción para RCLV
			if (Array.from(e.target.classList).includes("RCLV")) {
				if (subcategoriaSelect.value == "AMA" && valor != "1") interaccionesApMar(campo);
				iconosEdicionRCLVs();
			}
			// Para que incluya los datos de la subcategoría y RCLVs, por si se necesitan para validar RCLV
			let adicSubcategoria = subcategoriaSelect.value ? funcionAdicSubcat(campo) : "";
			// Prepara el datosUrl con los datos a validar
			var datosUrl = campo + "=" + valor + adicSubcategoria;
		}
		await validarErrores(datosUrl, true);
		// Fin
		activarInactivarBotonSubmit();
	});
	form.addEventListener("change", async (e) => {
		if (DP) {
			// Obtener el valor para 'campo'
			let campo = e.target.name;
			let datos;
			// (Título original / castellano) + año lanzamiento
			if (campo == "nombre_original" || campo == "nombre_castellano" || campo == "ano_estreno") {
				datos = {campo1: "nombre_original", campo2: "ano_estreno"};
				funcionDosCampos(datos, campo);
				datos = {campo1: "nombre_castellano", campo2: "ano_estreno"};
				funcionDosCampos(datos, campo);
			}
			// Año de lanzamiento + año de finalización
			if ((campo == "ano_estreno" && campos.includes("ano_fin")) || campo == "ano_fin") {
				datos = {campo1: "ano_estreno", campo2: "ano_fin"};
				funcionDosCampos(datos, campo);
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
	if (DP) {
		// Rutinas de categoría / subcategoría
		actualizaOpsSubcat();
		if (subcategoriaSelect.value) actualizaOpsRCLV();
		// Activar links RCLV
		iconosEdicionRCLVs();
	}

	// Errores y boton 'Submit'
	let mostrarIconoError = DD;
	statusInicial(mostrarIconoError);
});
