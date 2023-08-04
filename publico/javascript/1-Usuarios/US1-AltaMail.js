"use strict";
window.addEventListener("load", () => {
	// Variables
	let DOM = {
		// General
		form: document.querySelector("form"),
		button: document.querySelector("form button[type='submit']"),

		// Campos del formulario
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

	// Obtiene el código de la vista
	let codigo = location.pathname;
	const indice = codigo.lastIndexOf("/");
	codigo = codigo.slice(indice + 1);

	// Funciones -----------------------------
	let mostrarIconos = (mensaje, i) => {
		DOM.mensajesError[i].innerHTML = mensaje;
		if (mensaje) {
			DOM.iconosError[i].classList.remove("ocultar");
			DOM.iconosOK[i].classList.add("ocultar");
		} else {
			DOM.iconosError[i].classList.add("ocultar");
			DOM.iconosOK[i].classList.remove("ocultar");
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
			.every((n) => n.includes("ocultar"));

		OK && error ? DOM.button.classList.remove("inactivo") : DOM.button.classList.add("inactivo");
	};

	// Acciones si se realizan cambios en el mail
	DOM.email.addEventListener("input", async () => {
		let campo = DOM.email.name;
		let valor = DOM.email.value;
		let errores = await fetch("/usuarios/api/valida-mail/?" + campo + "=" + valor).then((n) => n.json());
		let mensaje = errores[campo];
		mostrarIconos(mensaje, 0);
	});

	// Acciones si se realizan cambios en el n° de codumento o país
	if (DOM.documNumero && DOM.documPais_id) {
		DOM.documNumero.addEventListener("input", () => {
			// Impide los caracteres que no son válidos
			DOM.documNumero.value = DOM.documNumero.value.toUpperCase().replace(/[^A-Z\d]/g, "");
			let mensaje = !DOM.documNumero.value ? "Necesitamos que completes este campo" : "";
			mostrarIconos(mensaje, 1);
		});
		DOM.documPais_id.addEventListener("input", () => {
			let mensaje = !DOM.documPais_id.value ? "Necesitamos que elijas un país" : "";
			mostrarIconos(mensaje, 2);
		});
	}

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
		if (codigo == "alta-mail") {
			// Averigua si el mail está repetido
			// errores = await fetch().then((n) => n.json());
			// if (errores.email) {
			// 	mostrarIconos(errores.email, 0);
			// 	return;
			// }

			// Envía la información al BE
			feedbackEnvioMail = fetch("/usuarios/api/envio-de-mail/?email=" + DOM.email.value).then((n) => n.json());
		}

		// Acciones si es un 'olvido-contraseña'
		if (codigo == "olvido-contrasena") {
			// Genera la información
			const datos = {email: DOM.email.value, documNumero: DOM.documNumero.value, documPais_id: DOM.documPais_id, codigo};
		}

		// Muestra el cartel
		DOM.cartel.classList.remove("ocultar");
		DOM.cartel.classList.remove("disminuye");
		DOM.cartel.classList.add("aumenta");

		// Progreso
		const pausa = 200;
		const tiempoEstimado = 10 * 1000;
		const inicio = Date.now();
		let duracionAcum = 0;

		// Evoluciona el progreso
		for (let repeticion = 0; repeticion < parseInt(tiempoEstimado / pausa); repeticion++) {
			duracionAcum += pausa;
			DOM.progreso.style.width = parseInt((duracionAcum / tiempoEstimado) * 100) + "%";
			await espera(200);
		}

		// Verifica que se haya enviado
		feedbackEnvioMail = await feedbackEnvioMail;

		// Redirige a la siguiente vista
		console.log(feedbackEnvioMail);
	});

	// Start-up: anula 'submit' si hay algún error
	botonSubmit();
});
let espera = (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
