"use strict";
window.addEventListener("load", async () => {
	// Variables
	const pathname = location.pathname;
	const indice = 1 + pathname.slice(1).indexOf("/");
	const codigo = pathname.slice(indice + 1) == "alta-mail" ? "alta-mail" : "olvido-contrasena"; // código de la vista
	const rutaInicio = "/usuarios/api/" + codigo;
	let rutas = {
		datosDeSession: rutaInicio + "/datosDeSession",
		valida: rutaInicio + "/validaciones/?datos=",
		envia: rutaInicio + "/envio-de-mail/?email=",
	};

	let DOM = {
		// General
		form: document.querySelector("form"),
		button: document.querySelector("form button[type='submit']"),

		// Inputs del formulario
		inputs: document.querySelectorAll(".inputError .input"),

		// Errores
		iconosError: document.querySelectorAll(".errores .fa-circle-xmark"),
		iconosOK: document.querySelectorAll(".errores .fa-circle-check"),
		mensajesError: document.querySelectorAll(".errores .mensajeError"),
		mensajeErrorCreds: document.querySelector("#credenciales.errores .mensajeError"),

		// Cartel progreso
		cartelProgreso: document.querySelector("#cartelProgreso"),
		progreso: document.querySelector("#cartelProgreso #progreso"),
	};
	for (let input of DOM.inputs) DOM[input.name] = document.querySelector(".inputError .input[name='" + input.name + "']");
	let v = {
		// Envío de mail
		urlExitoso: pathname.slice(0, indice) + "/envio-exitoso-de-mail/?codigo=" + codigo,
		urlFallido: pathname.slice(0, indice) + "/envio-fallido-de-mail/?codigo=" + codigo,
		pendiente: true,

		// Varios
		olvidoContr: codigo == "olvido-contrasena" ? await fetch(rutas.datosDeSession).then((n) => n.json()) : {},
		inputs: Array.from(DOM.inputs).map((n) => n.name),
		errores: {},
	};

	// Funciones -----------------------------
	let validaEnviaMail = async (soloErrores) => {
		// Variables
		let datos = {email: DOM.email.value};

		// Si es un alta de mail o si se deben validar los datos perennes, averigua si hay errores
		if (codigo == "alta-mail" || v.olvidoContr.mostrarCampos) {
			// Obtiene la información de los datos perennes
			if (codigo == "olvido-contrasena" && v.olvidoContr.mostrarCampos) {
				for (let campo of camposPerennes) if (DOM[campo]) datos[campo] = DOM[campo].value;
				datos.usuario = v.olvidoContr.usuario;
			}

			// Averigua los errores
			v.errores = await fetch(rutas.valida + JSON.stringify(datos)).then((n) => n.json());

			// Si se necesitan los campos 'perennes', se recarga la página
			if (v.errores.faltanCampos) return location.reload();
		}

		// Sector de envío de email
		if ((v.errores && v.errores.hay) || soloErrores) return;
		cartelProgreso(); // Cartel mientras se recibe la respuesta
		v.mailEnviado = await fetch(rutas.envia + datos.email).then((n) => n.json()); // Envía la información al BE

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
		// Acciones
		v.errores.hay
			? muestraErrores() // se muestran los errores
			: (location.href = v.mailEnviado ? v.urlExitoso : v.urlFallido); // De lo contrario redirige

		// Fin
		return;
	};
	let muestraErrores = () => {
		// Campos con 'fa-solid'
		v.inputs.forEach((campo, indice) => {
			// Si no se revisó el campo, interrumpe la función
			if (!Object.keys(v.errores).includes(campo)) return;

			// Actualiza el mensaje de error
			DOM.mensajesError[indice].innerHTML = v.errores[campo];

			// Muestra los íconos de Error
			if (v.errores[campo]) {
				DOM.iconosError[indice].classList.remove("ocultar");
				DOM.iconosOK[indice].classList.add("ocultar");
			}
			// Muestra los íconos de OK sólo si fueron revisados
			else {
				DOM.iconosError[indice].classList.add("ocultar");
				DOM.iconosOK[indice].classList.remove("ocultar");
			}
		});

		// Credenciales
		if (Object.keys(v.errores).includes("credenciales")) {
			DOM.mensajeErrorCreds.innerHTML = v.errores.credenciales;
			v.errores.credenciales
				? DOM.mensajeErrorCreds.classList.remove("ocultar")
				: DOM.mensajeErrorCreds.classList.add("ocultar");
		}

		// Botón Submit
		botonSubmit();

		// Fin
		return;
	};
	let botonSubmit = () => {
		// Variables
		let OK = Array.from(DOM.iconosOK)
			.map((n) => n.className)
			.every((n) => !n.includes("ocultar"));
		let error = Array.from(DOM.iconosError)
			.map((n) => n.className)
			.some((n) => !n.includes("ocultar"));

		// Fin
		OK && !error ? DOM.button.classList.remove("inactivo") : DOM.button.classList.add("inactivo");
		return;
	};

	// Acciones 'input'
	DOM.form.addEventListener("input", async (e) => {
		// Variables
		const campo = e.target.name;
		let valor = e.target.value;

		// Averigua si hay errores
		if (campo == "email") {
			const posicCursor = e.target.selectionStart;
			valor = valor.toLowerCase();
			e.target.value = valor;
			e.target.selectionEnd = posicCursor;
			v.errores.email = !valor ? cartelMailVacio : !formatoMail.test(valor) ? cartelMailFormato : "";
		}
		if (camposPerennes.includes(campo)) v.errores[campo] = !valor ? "Necesitamos esta información" : "";

		// Limpia las credenciales
		if (DOM.mensajeErrorCreds) v.errores.credenciales = "";

		// Actualiza los errores
		v.errores.hay = Object.values(v.errores).some((n) => !!n);
		muestraErrores();

		// Fin
		return;
	});

	// Submit
	DOM.form.addEventListener("submit", async (e) => {
		e.preventDefault();

		// Si el botón está inactivo, muestra los errores e interrumpe la función
		if (DOM.button.className.includes("inactivo")) {
			await validaEnviaMail(true);
			muestraErrores();
			return;
		}
		// De lo contrario lo inactiva
		else DOM.button.classList.add("inactivo");

		// Envía la información al BE y eventualmente el mail al usuario
		await validaEnviaMail();

		// Consecuencias
		consecuencias();

		// Fin
		return;
	});

	// Start-up
	if (codigo == "olvido-contrasena" && !v.olvidoContr) location.reload(); // si corresponde, recarga la página
	botonSubmit(); // anula 'submit' si hay algún error
});

// Variables
const cartelMailVacio = "Necesitamos que escribas un correo electrónico";
const cartelMailFormato = "Debes escribir un formato de correo válido";
const cartelContrasenaVacia = "Necesitamos que escribas una contraseña";
const camposPerennes = ["nombre", "apellido", "fechaNacim", "paisNacim_id"];
const formatoMail = /^\w+([\.-_]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
