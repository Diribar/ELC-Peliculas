"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let submit = document.querySelector("#dataEntry button[type='submit']");

	// Datos
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// OK/Errores
	let iconosOK = document.querySelectorAll(".input-error .fa-circle-check");
	let iconosError = document.querySelectorAll(".input-error .fa-circle-xmark");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	// Categoría y subcategoría
	let categoriaSelect = document.querySelector("select[name='categoria_id']");
	let subcategoriaSelect = document.querySelector("select[name='subcategoria_id']");
	let subcategoriaOpciones = document.querySelectorAll("select[name='subcategoria_id'] option");
	let subcategorias = await fetch("/producto/agregar/api/obtener-subcategorias").then((n) => n.json());
	let subcategoria;
	// Datos RCLV
	let etiquetasRCLV = document.querySelectorAll(".label-input.RCLV");
	let inputsRCLV = document.querySelectorAll(".input-error .input.RCLV");
	let camposRCLV = Array.from(inputsRCLV).map((n) => n.name);
	let linksEdicion = document.querySelectorAll(".input-error .linkRCLV.edicion");
	let iconosOK_RCLV = document.querySelectorAll(".RCLV .input-error .fa-circle-check");
	let iconosError_RCLV = document.querySelectorAll(".RCLV .input-error .fa-circle-xmark");
	let opcionesPersonaje = document.querySelectorAll("select[name='personaje_id'] option.RCLV");
	let opcionesHecho = document.querySelectorAll("select[name='hecho_id'] option.RCLV");
	// Ruta
	let ruta = "/producto/agregar/api/validar-datos-pers/?";

	// FUNCIONES *******************************************
	// Funciones
	let statusInicial = async (inputValue) => {
		//Buscar todos los valores
		let url = "";
		for (let input of inputs) {
			if (input != inputs[0]) url += "&";
			url += input.name + "=";
			url += encodeURIComponent(input.value);
		}
		let errores = await fetch(ruta + url).then((n) => n.json());
		inputs.forEach((input, indice) => {
			if (inputValue ? input.value : true) {
				// Averiguar si hay un error
				let campo = input.name;
				let mensaje = errores[campo];
				mensajesError[indice].innerHTML = mensaje;
				// En caso de error
				if (mensaje != undefined) {
					mensaje
						? iconosError[indice].classList.remove("ocultar")
						: iconosError[indice].classList.add("ocultar");
					mensaje
						? iconosOK[indice].classList.add("ocultar")
						: iconosOK[indice].classList.remove("ocultar");
					if (camposRCLV.includes(campo) && (campo != "personaje_id" || input.value != 11)) {
						let indiceRCLV = camposRCLV.indexOf(campo);
						mensaje
							? linksEdicion[indiceRCLV].classList.add("ocultar")
							: linksEdicion[indiceRCLV].classList.remove("ocultar");
					}
				}
			}
		});
		botonSubmit();
	};
	// Actualizar la subcategoría
	let actualizaOpsSubcat = () => {
		if (categoriaSelect.value) {
			for (let opcion of subcategoriaOpciones) {
				opcion.className.includes(categoriaSelect.value)
					? opcion.classList.remove("ocultar")
					: opcion.classList.add("ocultar");
			}
			// Si subcategoría no tiene valor, quitar 'disabled'
			if (!subcategoriaSelect.value) subcategoriaSelect.removeAttribute("disabled");
		} else {
			subcategoriaSelect.setAttribute("disabled", "disabled");
			subcategoriaSelect.value = "";
		}
		// Fin
		return;
	};
	// RCLV
	let limpiaSelectsRCLV = () => {
		// Borra el valor de los selectsRCLV
		for (let i = 0; i < inputsRCLV.length; i++) {
			inputsRCLV[i].value = "";
			iconosOK_RCLV[i].classList.add("ocultar");
			iconosError_RCLV[1].classList.add("ocultar");
		}
		// Fin
		return;
	};
	let actualizaOpsRCLV = () => {
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
					opcion.classList.contains("AM" + (inputsRCLV[0].value != "1" ? inputsRCLV[0].value : ""))
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
	let interaccionesApMar = (campo) => {
		// Cambia el contenido del Personaje o Hecho
		// Acciones si se cambia el personaje
		if (campo == "personaje_id") {
			// Obtener del personaje, el 'id' de la Aparición Mariana
			let clases = Array.from(opcionesPersonaje).find((n) => n.value == inputsRCLV[0].value).classList;
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
	let verificaUnaSolaOpcionRCLV = () => {
		// Rutina para los 2 tipos de RCLV
		let opPer = Array.from(opcionesPersonaje).filter((n) => !n.classList.contains("ocultar"));
		let opHec = Array.from(opcionesHecho).filter((n) => !n.classList.contains("ocultar"));
		// Cambios en personaje
		if (opPer.length == 1) inputsRCLV[0].value = opPer[0].value;

		// Cambios en hechos
		if (opHec.length == 1) inputsRCLV[1].value = opHec[0].value;

		//
		// Fin
		return;
	};
	let iconosEdicionRCLVs = () => {
		if (subcategoria)
			var j =
				subcategoria.rclv_necesario == "personaje"
					? 0
					: subcategoria.rclv_necesario == "hecho"
					? 1
					: null;
		let comienzo = true;
		linksEdicion.forEach((link, i) => {
			if (inputsRCLV[i].value && inputsRCLV[i].value != 1) {
				link.classList.remove("inactivo_ocultar");
				link.classList.remove("ocultar");
			}
			if ((inputsRCLV[i].value && inputsRCLV[i].value != 1) || !comienzo) {
				iconosError_RCLV[i].classList.add("ocultar");
				if (j === i || (j === null && comienzo)) {
					iconosOK_RCLV[i].classList.remove("ocultar");
					comienzo = false;
				}
			} else link.classList.add("inactivo_ocultar");
		});
	};
	// Botón submit
	let botonSubmit = () => {
		// Detectar la cantidad de 'iconosOK' que no corresponden por motivos de RCLV
		let RCLV_innecesarios = 2;

		// Detectar la cantidad de 'no aciertos'
		let OK_ocultos =
			Array.from(iconosOK)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar - RCLV_innecesarios;

		// Detectar la cantidad de 'no errores'
		let error = Array.from(iconosError)
			.map((n) => n.classList.value)
			.join(" ")
			.split(" ")
			.reduce((a, b) => {
				return a[b] ? ++a[b] : (a[b] = 1), a;
			}, {}).ocultar; // == iconosError.length;
		// Consecuencias
		console.log(OK_ocultos, error, iconosError.length);
		OK_ocultos === 0 && error ? submit.classList.remove("inactivo") : submit.classList.add("inactivo");
	};
	let funcionErrores = (errores) => {
		campos.forEach((campo, indice) => {
			if (errores[campo] !== undefined) {
				mensajesError[indice].innerHTML = errores[campo];
				errores[campo]
					? iconosOK[indice].classList.add("ocultar")
					: iconosOK[indice].classList.remove("ocultar");
				errores[campo]
					? iconosError[indice].classList.remove("ocultar")
					: iconosError[indice].classList.add("ocultar");
			}
		});
	};

	// ADD EVENT LISTENERS *********************************
	// Averiguar si hubieron cambios
	form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = e.target.value;
		let indice = campos.indexOf(campo);
		// Si se cambia la categoría --> actualiza subcategoría
		if (campo == "categoria_id") {
			subcategoriaSelect.value = "";
			actualizaOpsSubcat();
			limpiaSelectsRCLV();
			actualizaOpsRCLV();
		}
		// Si se cambia la subcategoría --> actualiza RCLV
		if (campo == "subcategoria_id") {
			limpiaSelectsRCLV();
			actualizaOpsRCLV();
			verificaUnaSolaOpcionRCLV();
			iconosEdicionRCLVs();
		}
		// Verificar interacción para RCLV
		if (Array.from(e.target.classList).includes("RCLV")) {
			if (subcategoriaSelect.value == "AMA" && valor != "1") interaccionesApMar(campo);
			iconosEdicionRCLVs();
		}
		// Para que incluya los datos de la subcategoría y RCLVs, por si se necesitan para validar RCLV
		let adicSubcategoria = "";
		if (subcategoriaSelect.value) {
			if (campo != "subcategoria_id")
				adicSubcategoria += "&subcategoria_id=" + subcategoriaSelect.value;
			if (campo != "personaje_id") adicSubcategoria += "&personaje_id=" + inputsRCLV[0].value;
			if (campo != "hecho_id") adicSubcategoria += "&hecho_id=" + inputsRCLV[1].value;
			if (campo != "valor_id") adicSubcategoria += "&valor_id=" + inputsRCLV[2].value;
		}
		// Averiguar si hay algún error
		let errores = await fetch(ruta + campo + "=" + valor + adicSubcategoria).then((n) => n.json());
		console.log(errores);
		funcionErrores(errores);

		// Fin
		botonSubmit();
	});
	// Submit
	form.addEventListener("submit", async (e) => {
		if (submit.classList.contains("inactivo")) {
			e.preventDefault();
			statusInicial(false);
		}
	});

	// STATUS INICIAL *************************************
	// Rutinas de categoría / subcategoría
	actualizaOpsSubcat();
	if (subcategoriaSelect.value) actualizaOpsRCLV();

	// Activar links RCLV
	iconosEdicionRCLVs();

	// Errores y boton 'Submit'
	statusInicial(true);
});
