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
		paisNacim_id: document.querySelector(".inputError .input#paisNacim_id"),

		// Errores
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),

		// Cartel progreso
		cartelProgreso: document.querySelector("#cartelProgreso"),
		progreso: document.querySelector("#cartelProgreso #progreso"),
	};
	let codigo = location.pathname;
	const indice = codigo.lastIndexOf("/");
	let v = {
		// Inputs
		inputs: Array.from(DOM.inputs).map((n) => n.name),
		formatoMail: /^\w+([\.-_]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
		errores: {},

		// Envío de mail
		codigo: codigo.slice(indice + 1), // código de la vista
		urlExitoso: codigo.slice(0, indice) + "/envio-exitoso-de-mail",
		urlFallido: codigo.slice(0, indice) + "/envio-fallido-de-mail",
		pendiente: true,
	};

	// Funciones -----------------------------
	let muestraErrores = () => {
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
	let validaMail = {
		altaMail: async function () {
			// Prepara la info para el BE
			const email = DOM.email.value;
			const ruta = "/usuarios/api/alta-mail/?email=";

			// Averigua si hay errores, y en caso negativo envía el mail
			v.errores = await fetch(ruta + email).then((n) => n.json());
			if (!errores.hay) await enviaMail({email});

			// Fin
			return;
		},
		olvidoContrasena: async function () {
			// Prepara la info para el BE
			const email = DOM.email.value;
			const paisNacim_id = DOM.paisNacim_id ? DOM.paisNacim_id.value : "";
			const datos = {email, paisNacim_id};
			const ruta = "/usuarios/api/olvido-contrasena/valida-mail/";

			// Averigua si hay errores, y en caso negativo envía el mail
			v.errores = await fetch(ruta + "?datos=" + JSON.stringify(datos)).then((n) => n.json());
			if (!errores.hay) await this.enviaMail(datos);

			// Fin
			return;
		},
	};
	let enviaMail = async (datos) => {
		// Cartel mientras se recibe la respuesta
		cartelProgreso();

		// Envía la información al BE
		const ruta = "/usuarios/api/" + v.codigo + "/envio-de-mail/?datos=";
		v.mailEnviado = await fetch(ruta + JSON.stringify(datos)).then((n) => n.json());

		// Fin
		return;
	};
	let cartelProgreso = async () => {
		// Muestra el cartel
		DOM.cartelProgreso.classList.remove("ocultar");
		DOM.cartelProgreso.classList.remove("disminuye");
		DOM.cartelProgreso.classList.add("aumenta");

		// Progreso
		const pausa = 200;
		const tiempoEstimado = 9 * 1000;
		let duracionAcum = 0;

		// Evoluciona el progreso
		for (let repeticion = 0; repeticion < parseInt(tiempoEstimado / pausa); repeticion++) {
			duracionAcum += pausa;
			DOM.progreso.style.width = parseInt((duracionAcum / tiempoEstimado) * 100) + "%";
			if (v.pendiente) await pierdeTiempo(pausa);
		}
		DOM.progreso.style.width = "100%";

		// Oculta el cartelProgreso
		await pierdeTiempo(pausa);
		DOM.cartelProgreso.classList.remove("aumenta");
		DOM.cartelProgreso.classList.add("disminuye");

		// Fin
		return;
	};
	let consecuencias = () => {
		// Acciones si hubo errores en el data-entry
		if (v.errores.hay) {
			// Si el error es de documento y no exiten esos campos, se recarga la página
			if (v.errores.documento) location.reload();
			// De lo contrario, se muestran los errores
			else muestraErrores();
		}
		// Acciones si no hubo errores en el data-entry
		else location.href = v.mailEnviado ? v.urlExitoso : v.urlFallido;

		// Fin
		return;
	};

	// Acciones 'input'
	DOM.form.addEventListener("input", async (e) => {
		// Variables
		e.target.value = e.target.value.toLowerCase();
		const campo = e.target.name;
		let valor = e.target.value;

		// Averigua si hay errores
		if (campo == "email") v.errores.email = !valor ? cartelMailVacio : !formato.test(valor) ? cartelMailFormato : "";
		if (camposPerennes.includes(campo)) v.errores[campo] = !valor ? "Necesitamos esta información" : "";

		// Actualiza los errores
		errores.hay = Object.values(errores).some((n) => !!n);
		muestraErrores();

		// Fin
		return;
	});

	// Submit
	DOM.form.addEventListener("submit", async (e) => {
		e.preventDefault();

		// Si el botón está inactivo interrumpe la función
		if (DOM.button.className.includes("inactivo")) return;
		else DOM.button.classList.add("inactivo"); // de lo contrario lo inactiva

		// Envía la información al BE y obtiene los valores recibidos
		if (v.codigo == "alta-mail") await validaMail.altaMail();
		if (v.codigo == "olvido-contrasena") await validaMail.olvidoContrasena();

		// Consecuencias
		consecuencias();

		// Fin
		return;
	});

	// Start-up: anula 'submit' si hay algún error
	botonSubmit();
});

// Variables
const cartelMailVacio = "Necesitamos que escribas un correo electrónico";
const cartelMailFormato = "Debes escribir un formato de correo válido";
const cartelContrasenaVacia = "Necesitamos que escribas una contraseña";
const camposPerennes = ["nombre", "apellido", "fechaNacim", "paisNacim_id"];
