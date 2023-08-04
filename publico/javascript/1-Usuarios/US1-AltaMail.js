"use strict";
window.addEventListener("load", () => {
	// Variables
	let DOM = {
		// General
		form: document.querySelector("form"),
		button: document.querySelector("form button[type='submit']"),

		// Inputs del formulario
		inputs: document.querySelectorAll(".inputError .input"),
		email: document.querySelector(".inputError .input[name='email']"),
		documNumero: document.querySelector(".inputError .input#documNumero"),
		documPais_id: document.querySelector(".inputError .input#documPais_id"),

		// Errores
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),

		// Cartel
		cartel: document.querySelector("#cartel"),
		progreso: document.querySelector("#cartel #progreso"),
	};
	let codigo = location.pathname;
	const indice = codigo.lastIndexOf("/");
	let v = {
		// Inputs
		inputs: Array.from(DOM.inputs).map((n) => n.name),
		errores: {},

		// Envío de mail
		codigo: codigo.slice(indice + 1), // código de la vista
		urlExitoso: codigo.slice(0, indice) + "/envio-exitoso-de-mail",
		urlFallido: codigo.slice(0, indice) + "/envio-fallido-de-mail",
		pendiente: true,
		feedbackEnvioMail: null,
	};

	// Funciones -----------------------------
	let mostrarErrores = () => {
		v.inputs.forEach((campo, indice) => {
			// Actualiza el mensaje de error
			DOM.mensajesError[indice].innerHTML = v.errores[campo];

			// Muestra / Oculta los íconos de OK y Error
			if (v.errores[campo]) {
				DOM.iconosError[indice].classList.remove("ocultar");
				DOM.iconosOK[indice].classList.add("ocultar");
			} else {
				DOM.iconosError[indice].classList.add("ocultar");
				DOM.iconosOK[indice].classList.remove("ocultar");
			}
		});

		// Botón Submit
		botonSubmit();

		// Fin
		return;
	};
	let botonSubmit = () => {
		let OK = Array.from(DOM.iconosOK)
			.map((n) => n.className)
			.every((n) => !n.includes("ocultar"));

		let error = Array.from(DOM.iconosError)
			.map((n) => n.className)
			.some((n) => !n.includes("ocultar"));

		OK && !error ? DOM.button.classList.remove("inactivo") : DOM.button.classList.add("inactivo");
	};
	let enviaInfoAlBE = () => {
		// Prepara la info para el BE
		const email = DOM.email.value;
		const documNumero = DOM.documNumero ? DOM.documNumero.value : "";
		const documPais_id = DOM.documPais_id ? DOM.documPais_id.value : "";
		const datos = {email, documNumero, documPais_id};
		const ruta =
			v.codigo == "alta-mail"
				? "alta-mail/?email=" + email
				: v.codigo == "olvido-contrasena"
				? "olvido-contrasena/?datos=" + JSON.stringify(datos)
				: "";

		// Envía la información al BE
		const resultado = fetch("/usuarios/api/" + ruta)
			.then((n) => n.json())
			.then((n) => {
				v.pendiente = false;
				return n;
			});

		// Fin
		return resultado;
	};
	let cartelProgreso = async () => {
		// Muestra el cartel
		DOM.cartel.classList.remove("ocultar");
		DOM.cartel.classList.remove("disminuye");
		DOM.cartel.classList.add("aumenta");

		// Progreso
		const pausa = 200;
		const tiempoEstimado = 9 * 1000;
		let duracionAcum = 0;

		// Evoluciona el progreso
		for (let repeticion = 0; repeticion < parseInt(tiempoEstimado / pausa); repeticion++) {
			duracionAcum += pausa;
			DOM.progreso.style.width = parseInt((duracionAcum / tiempoEstimado) * 100) + "%";
			if (v.pendiente) await espera(pausa);
		}
		DOM.progreso.style.width = "100%";

		// Oculta el cartel
		await espera(pausa);
		DOM.cartel.classList.remove("aumenta");
		DOM.cartel.classList.add("disminuye");

		// Fin
		return;
	};
	let consecuencias = () => {
		// Acciones si hubo errores en el data-entry
		console.log(v.errores);
		console.log(v.feedbackEnvioMail);
		if (v.errores.hay) {
			// Si el error es de documento y no exiten esos campos, se recarga la página
			if (v.errores.documento) location.reload();
			// De lo contrario, se muestran los errores
			else mostrarErrores();
		}
		// Acciones si no hubo errores en el data-entry
		else location.href = v.feedbackEnvioMail.OK ? v.urlExitoso : v.urlFallido;

		// Fin
		return;
	};

	// Acciones 'input'
	DOM.form.addEventListener("input", async (e) => {
		// Variables
		const campo = e.target.name;
		let valor = e.target.value;

		if (campo == "email")
			v.errores.email = await fetch("/usuarios/api/valida-formato-mail/?email=" + valor).then((n) => n.json());

		if (campo == "documNumero") {
			e.target.value = valor.toUpperCase().replace(/[^A-Z\d]/g, "");
			v.errores.documNumero = !e.target.value ? "Necesitamos que completes este campo" : "";
		}

		if (campo == "documPais_id") v.errores.documPais_id = !valor ? "Necesitamos que elijas un país" : "";

		// Actualiza los errores
		mostrarErrores();
	});

	// Submit
	DOM.form.addEventListener("submit", async (e) => {
		// Si el botón está inactivo interrumpe la función
		e.preventDefault();
		if (DOM.button.className.includes("inactivo")) return;
		// De lo contrario lo inactiva
		else DOM.button.classList.add("inactivo");

		// Envía la información al BE
		let resultado = enviaInfoAlBE();

		// Cartel mientras se recibe la respuesta
		await cartelProgreso();

		// Obtiene los valores recibidos
		const {errores, feedbackEnvioMail} = await resultado;
		v.errores = errores
		v.feedbackEnvioMail = feedbackEnvioMail;

		// Consecuencias
		consecuencias();
	});

	// Start-up: anula 'submit' si hay algún error
	botonSubmit();
});
