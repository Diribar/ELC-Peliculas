"use strict";
window.addEventListener("load", async () => {
	// Variables generales
	let form = document.querySelector("#dataEntry");
	let submit = document.querySelector("#dataEntry button[type='submit']");
	// Datos
	let inputs = document.querySelectorAll(".input-error .input");
	let campos = Array.from(inputs).map((n) => n.name);
	// OK/Errores
	let iconoOK = document.querySelectorAll(".fa-circle-check");
	let iconoError = document.querySelectorAll(".input-error .fa-circle-xmark");
	let mensajesError = document.querySelectorAll(".input-error .mensajeError");
	// Categoría y subcategoría
	let categoria = document.querySelector("select[name='categoria_id']");
	let subcategoria = document.querySelector("select[name='subcategoria_id']");
	let subcategoriaOpciones = document.querySelectorAll("select[name='subcategoria_id'] option");
	let RCLVs = document.querySelectorAll(".RCLV");
	// Ruta
	let ruta = "/producto/agregar/api/validar-datos-pers/?";

	// ADD EVENT LISTENERS *********************************
	// Averiguar si hubieron cambios
	form.addEventListener("input", async (e) => {
		// Definir los valores para 'campo' y 'valor'
		let campo = e.target.name;
		let valor = e.target.value;
		let indice = campos.indexOf(campo);
		// Para que incluya los datos de la subcategoría, por si necesitan para validar RCLV
		let aux = subcategoria.value ? "&subcategoria_id=" + subcategoria.value : "";

		// Averiguar si hay algún error
		let errores = await fetch(ruta + campo + "=" + valor + aux).then((n) => n.json());
		mensajesError[indice].innerHTML = errores[campo];
		errores[campo]
			? iconoOK[indice].classList.add("ocultar")
			: iconoOK[indice].classList.remove("ocultar");
		errores[campo]
			? iconoError[indice].classList.remove("ocultar")
			: iconoError[indice].classList.add("ocultar");
		// Si se cambia la categoría --> actualiza subcategoría
		if (campo == "categoria_id") {
			subcategoria.value = "";
			funcionSubcat();
		}
		// Si se cambia la subcategoría --> actualiza RCLV
		if (campo == "subcategoria_id") await funcionRCLV();
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
		for (let input of inputs) {
			if (inputValue ? input.value : true) {
				// Averiguar si hay un error
				let campo = input.name;
				let indice = campos.indexOf(campo);
				let mensaje = errores[campo];
				mensajesError[indice].innerHTML = mensaje;
				// En caso de error
				if (mensaje != undefined) {
					mensaje
						? iconoError[indice].classList.remove("ocultar")
						: iconoError[indice].classList.add("ocultar");
					mensaje
						? iconoOK[indice].classList.add("ocultar")
						: iconoOK[indice].classList.remove("ocultar");
				}
			}
		}
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
	};
	// Aplicar cambios en RCLV
	let funcionRCLV = async () => {
		if (!subcategoria.value) return;
		// Averiguar qué RCLV corresponde
		let ruta = "/producto/agregar/api/obtener-RCLV-subcategoria/?id=" + subcategoria.value;
		let registro = await fetch(ruta).then((n) => n.json());
		let campos = ["personaje", "hecho", "valor"];
		let RCLV_id = ["personaje_id", "hecho_id", "valor_id"];

		// Mostrar/Ocultar el campo RCLV
		for (let i = 0; i < campos.length; i++) {
			if (registro[campos[i]]) RCLVs[i].classList.remove("ocultar");
			else {
				RCLVs[i].classList.add("ocultar");
				// Eliminar el valor del campo que se oculta
				document.querySelector("select[name='" + RCLV_id[i] + "']").value = "";
			}
		}
	};
	let botonSubmit = () => {
		// Detectar la cantidad de 'iconoOK' que no corresponden por motivos de RCLV
		let RCLV_ocultos = document.querySelectorAll(".label-input.ocultar.RCLV").length;

		// Detectar la cantidad de 'no aciertos'
		let OK =
			Array.from(iconoOK)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar == RCLV_ocultos;

		// Detectar la cantidad de 'no errores'
		let error =
			Array.from(iconoError)
				.map((n) => n.classList.value)
				.join(" ")
				.split(" ")
				.reduce((a, b) => {
					return a[b] ? ++a[b] : (a[b] = 1), a;
				}, {}).ocultar == iconoError.length;

		// Consecuencias
		OK && error ? submit.classList.remove("inactivo") : submit.classList.add("inactivo");
	};

	// STATUS INICIAL *************************************
	// Rutinas de categoría / subcategoría
	categoria.value != "" ? funcionSubcat() : subcategoria.setAttribute("disabled", "disabled");
	if (subcategoria.value) funcionRCLV();

	// Errores y boton 'Submit'
	statusInicial(true);
});
