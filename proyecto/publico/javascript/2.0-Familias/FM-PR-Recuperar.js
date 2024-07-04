"use strict";

window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Formulario
		form: document.querySelector("#datosLargos #recuadroDL form"),
		submit: document.querySelector("#sectorIconos button[type='submit']"),

		// inputs
		inputs: document.querySelectorAll("#historial input[type='radio']"),

		// Comentario
		comentario: document.querySelector("#comentario textarea"),
		contador: document.querySelector("#comentario #contador"),
	};

	// Funciones
	let FN = {
		botonSubmit: () => {
			// Activa o inactiva el botón submit
			DOM.comentario.value && DOM.comentario.value.length > 4 // el comentario no es necesario o está bien contestado
				? DOM.submit.classList.remove("inactivo")
				: DOM.submit.classList.add("inactivo");

			// Fin
			return;
		},
		contador: () => {
			DOM.contador.innerHTML = 100 - DOM.comentario.value.length;
			return;
		},
	};

	// Event listener - cambios en el formulario
	if (DOM.inputs) for (let input of DOM.inputs) input.addEventListener("change", () => DOM.submit.classList.remove("inactivo"));

	if (DOM.comentario) {
		DOM.comentario.addEventListener("keypress", (e) => {
			keyPressed(e);
			return;
		});
		DOM.comentario.addEventListener("input", (e) => {
			// Validaciones estándar
			amplio.restringeCaracteres(e);

			// Actualiza el contador y el botón submit
			FN.contador();
			FN.botonSubmit();

			// Fin
			return;
		});
	}
	DOM.form.addEventListener("submit", (e) => {
		if (DOM.submit.className.includes("inactivo")) e.preventDefault();
	});

	// Si no hay inputs, focus en comentario
	if (DOM.comentario) DOM.comentario.focus();
});
