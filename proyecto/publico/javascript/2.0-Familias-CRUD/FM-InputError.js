"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		form: document.querySelector("#datosLargos #recuadro form"),
		inputs: document.querySelectorAll("#motivos input"),
		comentario: document.querySelector("#comentario textarea"),
		pendiente: document.querySelector("#comentario #pendiente"),
		submit: document.querySelector("#botones button[type='submit']"),
	};
	const motivosStatus = await fetch("/crud/api/motivos-status").then((n) => n.json());

	// Funciones
	let contador = () => {
		DOM.pendiente.innerHTML = 100 - DOM.comentario.value.length;
		return;
	};
	let botonSubmit = () => {
		// Acciones
		const checked = document.querySelector("#motivos input:checked");
		DOM.comentario.value &&
		DOM.comentario.value.length > 4 &&
		(!DOM.inputs.length || // Recuperar
			checked) // Inactivar o Rechazar
			? DOM.submit.classList.remove("inactivo")
			: DOM.submit.classList.add("inactivo");

		// Fin
		return;
	};

	// Event listeners
	if (DOM.inputs.length)
		for (let motivo of DOM.inputs)
			motivo.addEventListener("change", async () => {
				// Obtiene el detalle del motivo
				const motivoRechAltas = motivosStatus.find((n) => n.id == motivo.value);

				// Completa el comentario
				DOM.comentario.value = motivoRechAltas.descripcion;
				DOM.comentario.readOnly = !motivoRechAltas.agregarComent;
				if (motivoRechAltas.agregarComent) {
					DOM.comentario.value += ": ";
					DOM.comentario.focus();
				}

				// Actualiza el contador y el botón submit
				contador();
				botonSubmit();
			});
	DOM.comentario.addEventListener("keypress", (e) => {
		keyPressed(e);
		return;
	});
	DOM.comentario.addEventListener("input", (e) => {
		// Validaciones estándar
		amplio.restringeCaracteres(e);

		// Actualiza el contador y el botón submit
		contador();
		botonSubmit();

		// Fin
		return;
	});
	DOM.form.addEventListener("submit", (e) => {
		if (DOM.submit.className.includes("inactivo")) e.preventDefault();
	});

	// Si no hay inputs, focus en comentario
	if (!DOM.inputs.length) DOM.comentario.focus();
});
