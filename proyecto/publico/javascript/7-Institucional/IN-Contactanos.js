"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Variables generales
		form: document.querySelector("form"),
		submit: document.querySelector("form #submit"),

		// Datos
		inputs: document.querySelectorAll(".inputError .input"),
		textArea: document.querySelector(".inputError textarea.input"),
		pendiente: document.querySelector(".inputError #pendiente"),

		// OK/Errores
		iconosError: document.querySelectorAll(".inputError .fa-circle-xmark"),
		iconosOK: document.querySelectorAll(".inputError .fa-circle-check"),
		mensajesError: document.querySelectorAll(".inputError .mensajeError"),
	};
	let v = {
		campos: ["asunto", "comentario"],
		validaDatos: "/institucional/api/valida-contactanos/?",
	};

	// Funciones
	let FN = {
		actualizaVarios: async function () {
			this.contador();
			this.obtieneLosValores();
			await this.averiguaMuestraLosErrores();
			this.actualizaBotonSubmit();

			// Fin
			return;
		},
		contador: () => {
			DOM.pendiente.innerHTML = Math.max(500 - DOM.textArea.value.length, 0);

			// Fin
			return;
		},
		obtieneLosValores: () => {
			v.datosUrl = "";
			DOM.inputs.forEach((input, i) => {
				if (i) v.datosUrl += "&";
				v.datosUrl += input.name + "=" + encodeURIComponent(input.value);
			});

			return;
		},
		averiguaMuestraLosErrores: async () => {
			// Obtiene los errores
			let errores = await fetch(v.validaDatos + v.datosUrl).then((n) => n.json());

			// Acciones en función de si hay errores o no
			v.campos.forEach((campo, indice) => {
				// Actualiza los mensajes de error
				DOM.mensajesError[indice].innerHTML = errores[campo];

				// Acciones si hay mensaje de error
				if (errores[campo]) {
					DOM.iconosOK[indice].classList.add("ocultar");
					DOM.iconosError[indice].classList.remove("ocultar");
				}
				// Acciones si no hay mensaje de error
				else {
					DOM.iconosOK[indice].classList.remove("ocultar");
					DOM.iconosError[indice].classList.add("ocultar");
				}
			});

			// Fin
			return;
		},
		actualizaBotonSubmit: () => {
			// Detecta la cantidad de 'errores' ocultos
			let hayErrores = Array.from(DOM.iconosOK)
				.map((n) => n.className)
				.some((n) => n.includes("ocultar"));
			// Consecuencias
			hayErrores ? DOM.submit.classList.add("inactivo") : DOM.submit.classList.remove("inactivo");
		},
		submitForm: async function (e) {
			e.preventDefault();
			if (DOM.submit.className.includes("inactivo")) await this.actualizaVarios();
			else DOM.form.submit();
			return;
		},
	};

	// Eventos
	DOM.inputs.forEach((input, i) => {
		input.addEventListener("input", (e) => {
			// Acciones
			amplio.restringeCaracteres(e); // restringe caracteres indeseados
			DOM.iconosError[i].classList.add("ocultar"); // oculta los íconos de error
			FN.contador(); // actualiza el contador
			if (!input.value) FN.actualizaVarios(); // busca el mensaje de error

			// Fin
			return;
		});
	});

	DOM.form.addEventListener("change", async (e) => {
		FN.actualizaVarios();
	});

	// Submit
	DOM.form.addEventListener("submit", async (e) => {
		FN.submitForm(e);
	});
	DOM.submit.addEventListener("click", async (e) => {
		FN.submitForm(e);
	});
	DOM.submit.addEventListener("keydown", async (e) => {
		if (e.key == "Enter" || e.key == "Space") FN.submitForm(e);
	});

	// Status inicial
	if (Array.from(DOM.inputs).some((n) => n.value)) await FN.actualizaVarios();
});
