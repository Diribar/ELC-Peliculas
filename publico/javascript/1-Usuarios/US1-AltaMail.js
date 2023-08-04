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
	};

	// Funciones -----------------------------
	let mostrarIconos = () => {
		for (let campo in v.errores) {
			// Obtiene el índice
			const indice = v.inputs.indexOf(campo);

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
		}

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

	// Acciones 'input'
	DOM.form.addEventListener("input", async (e) => {
		// Variables
		const campo = e.target.name;
		let valor = e.target.value;

		if (campo == "email") errores = await fetch("/usuarios/api/valida-formato-mail/?email=" + valor).then((n) => n.json());

		if (campo == "documNumero") {
			e.target.value = valor.toUpperCase().replace(/[^A-Z\d]/g, "");
			errores.documNumero = !e.target.value ? "Necesitamos que completes este campo" : "";
		}

		if (campo == "documPais_id") errores.documPais_id = !valor ? "Necesitamos que elijas un país" : "";

		// Actualiza los errores
		mostrarIconos();
	});

	// Submit
	DOM.form.addEventListener("submit", async (e) => {
		// Variables
		let feedbackEnvioMail;

		// Si el botón está inactivo interrumpe la función
		e.preventDefault();
		if (DOM.button.className.includes("inactivo")) return;
		// De lo contrario lo inactiva
		else DOM.button.classList.add("inactivo");

		// Acciones si es un 'alta-mail'
		if (v.codigo == "alta-mail") {
			// Averigua si el mail está repetido
			errores = await fetch().then((n) => n.json());
			if (errores.email) {
				mostrarIconos(errores.email, 0);
				return;
			}

			// Envía la información al BE
			feedbackEnvioMail = fetch("/usuarios/api/envio-de-mail/?email=" + DOM.email.value)
				.then((n) => n.json())
				.then((n) => {
					v.pendiente = false;
					return n;
				});
		}

		// Acciones si es un 'olvido-contraseña'
		if (v.codigo == "olvido-contrasena") {
			// Genera la información
			const datos = {email: DOM.email.value, documNumero: DOM.documNumero.value, documPais_id: DOM.documPais_id, codigo};
		}

		// Muestra el cartel
		DOM.cartel.classList.remove("ocultar");
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

		// Hace una nueva pausa para que se vea el progreso terminado
		await espera(pausa);

		// Verifica que se haya enviado
		feedbackEnvioMail = await feedbackEnvioMail;

		// Redirige a la siguiente vista
		location.href = feedbackEnvioMail.OK ? v.urlExitoso : v.urlFallido;
	});

	// Start-up: anula 'submit' si hay algún error
	botonSubmit();
});
