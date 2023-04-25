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
	let motivos_rech_altas = await fetch("/crud/api/motivos_rech_altas").then((n) => n.json());

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
				const motivo_rech_altas = motivos_rech_altas.find((n) => n.id == motivo.value);
				DOM.comentario.value = motivo_rech_altas.coment_aut ? motivo_rech_altas.descripcion : "";
				botonSubmit();
			});

	// Comentario
	DOM.comentario.addEventListener("keypress", (e) => {
		// Previene el uso del 'enter'
		if (e.key == "Enter") e.preventDefault();

		// Limita el uso del teclado solamente a los caracteres que nos interesan
		let formato = /^[a-záéíóúüñ ,.'"\d\-]+$/i;
		if (!formato.test(e.key)) e.preventDefault();
	});
	DOM.comentario.addEventListener("input", () => {
		if (com.length) {
			// Limita el uso del teclado solamente a los caracteres que nos interesan
			let com = DOM.comentario.value
				.replace(/[^a-záéíóúüñ ,.'"\d\-]+$/gi, "")
				.replace(/ +/g, " ")
				.replace(/\n/g, "")
				.slice(0, 100);

			// El primer caracter no puede ser un espacio
			if (com.slice(0, 1) == " ") com = com.slice(1);

			// Primera letra en mayúscula
			DOM.comentario.value = com.slice(0, 1).toUpperCase() + com.slice(1);
			DOM.pendiente.innerHTML = 100 - com.length;
		}

		// Actualiza el botón submit
		botonSubmit();
	});

	// Previene el submit si el botón está inactivo
	DOM.form.addEventListener("submit", (e) => {
		if (DOM.submit.className.includes("inactivo")) e.preventDefault();
	});
});
