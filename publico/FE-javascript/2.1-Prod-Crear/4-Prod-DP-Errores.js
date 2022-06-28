"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let submit = document.querySelector("#dataEntry button[type='submit']");

	// Datos
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	let inputsRCLV = document.querySelectorAll(".input-error .input.RCLV");
	let indicePersonaje = Array.from(inputsRCLV).findIndex((n) => n.name == "personaje_id");
	let camposRCLV = Array.from(inputsRCLV).map((n) => n.name);
	let linksAlta = document.querySelectorAll(".input-error .linkRCLV.alta");
	let linksEdicion = document.querySelectorAll(".input-error .linkRCLV.edicion");
	// OK/Errores
	let iconosOK = document.querySelectorAll(".input-error .fa-circle-check");
	let iconosError = document.querySelectorAll(".input-error .fa-circle-xmark");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	let iconosOK_RCLV = document.querySelectorAll(".RCLV .input-error .fa-circle-check");
	let iconosError_RCLV = document.querySelectorAll(".RCLV .input-error .fa-circle-xmark");
	// Categoría y subcategoría
	let categoria = document.querySelector("select[name='categoria_id']");
	let subcategoria = document.querySelector("select[name='subcategoria_id']");
	let subcategoriaOpciones = document.querySelectorAll("select[name='subcategoria_id'] option");
	let RCLVs = document.querySelectorAll(".label-input.RCLV");
	let opcionesRCLV = document.querySelectorAll("option.RCLV");
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
	// Aplicar cambios en la subcategoría
	let funcionSubcat = () => {
		for (let opcion of subcategoriaOpciones) {
			opcion.className.includes(categoria.value)
				? opcion.classList.remove("ocultar")
				: opcion.classList.add("ocultar");
		}
		if (!subcategoria.value) subcategoria.removeAttribute("disabled");

		// Fin
		return;
	};
	// Aplicar cambios en RCLV
	let activarIconos = (i) => {
		linksEdicion[i].classList.remove("inactivo_ocultar");
		linksEdicion[i].classList.remove("ocultar");
	};
	let inactivarIconosEdicion = (i) => {
		linksEdicion[i].classList.add("inactivo_ocultar");
	};
	let funcionRCLV = async (borrar) => {
		// Averiguar qué RCLV corresponde
		let ruta = "/producto/agregar/api/obtener-RCLV-subcategoria/?id=" + subcategoria.value;
		let registro = await fetch(ruta).then((n) => n.json());

		// Mostrar/Ocultar el campo RCLV
		camposRCLV.forEach((campoRCLV, i) => {
			if (borrar) {
				// Borra el valor de cada RCLV
				inputsRCLV[i].value = "";
				// Ocultar los íconos OK y de error
				iconosOK_RCLV[i].classList.add("ocultar");
				iconosError_RCLV[i].classList.add("ocultar");
				// Inactivar edición
				inactivarIconosEdicion(i);
			}
			// Muestra el campo
			if (registro && registro[campoRCLV]) RCLVs[i].classList.remove("ocultar");
			else {
				// Ocultar el campo
				RCLVs[i].classList.add("ocultar");
				// Eliminar el valor del campo que se oculta
				document.querySelector("select[name='" + campoRCLV + "']").value = "";
			}

			// Si la categoría es 'Jesús', pone 'Jesús' como personaje
			personajeJesus();
		});
	};
	let filtrarRCLVs = () => {
		// Obtener el id de la sub-categoría
		let subcategoria_id = subcategoria.value;
		// Ocultar las opciones distintas al id y a cero
		opcionesRCLV.forEach((opcion) => {
			let cfc = opcion.classList.contains("cfc" + subcategoria_id);
			let vpc = opcion.classList.contains("vpc" + subcategoria_id);
			let todos = opcion.classList.contains("cfc0") || opcion.classList.contains("vpc0");
			if (!cfc && !vpc && !todos) opcion.classList.add("ocultar");
			else opcion.classList.remove("ocultar");
		});

		// Si la categoría es 'Jesús', pone 'Jesús' como personaje
		personajeJesus();

		// Fin
		return;
	};
	let personajeJesus = () => {
		// Obtener el id de la sub-categoría
		let subcategoria_id = subcategoria.value;
		// Si la categoría es 'Jesús', pone 'Jesús' como personaje
		if (subcategoria_id == 1) {
			// Poner el personaje de Jesús
			inputsRCLV[indicePersonaje].value = 11;
			// Ocultar los links a RCLV
			linksAlta[indicePersonaje].classList.add("ocultar");
			linksEdicion[indicePersonaje].classList.add("ocultar");
			// Actualizar los links de OK y Error
			iconosOK_RCLV[indicePersonaje].classList.remove("ocultar");
			iconosError_RCLV[indicePersonaje].classList.add("ocultar");
		} else {
			// Mostrar el link a RCLV
			linksAlta[indicePersonaje].classList.remove("ocultar");
		}
	};
	// Botón submit
	let botonSubmit = () => {
		// Detectar la cantidad de 'iconosOK' que no corresponden por motivos de RCLV
		let RCLV_ocultos = document.querySelectorAll(".label-input.ocultar.RCLV").length;

		// Detectar la cantidad de 'no aciertos'
		let OK =
			Array.from(iconosOK)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar == RCLV_ocultos;

		// Detectar la cantidad de 'no errores'
		let error =
			Array.from(iconosError)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar == iconosError.length;
		// Consecuencias
		OK && error ? submit.classList.remove("inactivo") : submit.classList.add("inactivo");
	};

	// Activar links RCLV
	inputsRCLV.forEach((input, i) => {
		if (input.value) activarIconos(i);
		input.addEventListener("input", () => {
			if (input.value) activarIconos(i);
			else inactivarIconosEdicion(i);
		});
	});

	// ADD EVENT LISTENERS *********************************
	// Averiguar si hubieron cambios
	form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = e.target.value;
		let indice = campos.indexOf(campo);
		// Para que incluya los datos de la subcategoría, por si se necesitan para validar RCLV
		let adicSubcategoria =
			subcategoria.value && !campo.includes("subcategoria_id")
				? "&subcategoria_id=" + subcategoria.value
				: "";
		// Averiguar si hay algún error
		let errores = await fetch(ruta + campo + "=" + valor + adicSubcategoria).then((n) => n.json());
		mensajesError[indice].innerHTML = errores[campo];
		errores[campo]
			? iconosOK[indice].classList.add("ocultar")
			: iconosOK[indice].classList.remove("ocultar");
		errores[campo]
			? iconosError[indice].classList.remove("ocultar")
			: iconosError[indice].classList.add("ocultar");
		// Si se cambia la categoría --> actualiza subcategoría
		if (campo == "categoria_id") {
			subcategoria.value = "";
			funcionSubcat();
		}
		// Si se cambia la subcategoría --> actualiza RCLV
		if (campo == "categoria_id" || campo == "subcategoria_id") await funcionRCLV(true);
		// Actualizar las opciones de RCLV
		if (campo == "subcategoria_id") filtrarRCLVs();
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
	categoria.value ? funcionSubcat() : subcategoria.setAttribute("disabled", "disabled");
	if (subcategoria.value) funcionRCLV();

	// Errores y boton 'Submit'
	statusInicial(true);
});
