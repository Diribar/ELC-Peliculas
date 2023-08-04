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
		inputs: Array.from(DOM.inputs).map((n) => n.name),
		codigo: codigo.slice(indice + 1), // código de la vista
		urlExitoso: codigo.slice(0, indice) + "/envio-exitoso-de-mail",
		urlFallido: codigo.slice(0, indice) + "/envio-fallido-de-mail",
		pendiente: true,
		errores: {},
		campo: "",
		mensaje: "",
	};

	// Funciones -----------------------------
	let mostrarIconos = () => {
		const indice = v.inputs.indexOf(v.campo);
		DOM.mensajesError[indice].innerHTML = v.mensaje;
		if (v.mensaje) {
			DOM.iconosError[indice].classList.remove("ocultar");
			DOM.iconosOK[indice].classList.add("ocultar");
		} else {
			DOM.iconosError[indice].classList.add("ocultar");
			DOM.iconosOK[indice].classList.remove("ocultar");
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
		v.campo = e.target.name;
		let valor = e.target.value;

		if (campo == "email") errores = await fetch("/usuarios/api/valida-formato-mail/?email=" + valor).then((n) => n.json());

		if (v.campo == "documNumero") {
			e.target.value = valor.toUpperCase().replace(/[^A-Z\d]/g, "");
			v.mensaje = !e.target.value ? "Necesitamos que completes este campo" : "";
		}

		if (v.campo == "documPais_id") {
			v.mensaje = !valor ? "Necesitamos que elijas un país" : "";
		}

		// Actualiza los errores
		mostrarIconos();
	});

	// Submit
	DOM.form.addEventListener("submit", async (e) => {
		// Previene el envío del formulario
		e.preventDefault();

		// Variables
		let feedbackEnvioMail;

		// Si el botón está inactivo interrumpe la función
		if (DOM.button.className.includes("inactivo")) return;
		// De lo contrario lo inactiva
		else DOM.button.classList.add("inactivo");

		// Acciones si es un 'alta-mail'
		if (v.codigo == "alta-mail") {
			// Averigua si el mail está repetido
			// errores = await fetch().then((n) => n.json());
			// if (errores.email) {
			// 	mostrarIconos(errores.email, 0);
			// 	return;
			// }

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
