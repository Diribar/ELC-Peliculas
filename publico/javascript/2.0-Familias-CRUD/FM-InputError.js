"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		form: document.querySelector("#recuadro form"),
		motivos: document.querySelectorAll("#motivos input"),
		comentario: document.querySelector("#comentario textarea"),
		pendiente: document.querySelector("#comentario #pendiente"),
		submit: document.querySelector("#botones button[type='submit']"),
	};
	let motivosStatus = await fetch("/crud/api/motivos-status").then((n) => n.json());

	// Botón submit
	let botonSubmit = () => {
		let checked = document.querySelector("#motivos input:checked");
		DOM.comentario.value && (!DOM.motivos.length || (DOM.motivos && checked))
			? DOM.submit.classList.remove("inactivo")
			: DOM.submit.classList.add("inactivo");
	};

	// Event listeners
	// Motivos
	if (DOM.motivos.length)
		for (let motivo of DOM.motivos)
			motivo.addEventListener("change", async () => {
				const motivo_rech_altas = motivosStatus.find((n) => n.id == motivo.value);
				DOM.comentario.value = motivo_rech_altas.comentAut ? motivo_rech_altas.descripcion : "";
				botonSubmit();
			});

	// Comentario
	DOM.comentario.addEventListener("keypress", (e) => {
		keyPressed(e);
		return;
	});
	DOM.comentario.addEventListener("input", (e) => {
		// Validaciones estándar
		amplio.restringeCaracteres(e);

		// Actualiza el contador
		let largo = DOM.comentario.value.length;
		if (largo) DOM.pendiente.innerHTML = 100 - largo;

		// Actualiza el botón submit
		botonSubmit();
	});

	// Previene el submit si el botón está inactivo
	DOM.form.addEventListener("submit", (e) => {
		if (DOM.submit.className.includes("inactivo")) e.preventDefault();
	});
});
