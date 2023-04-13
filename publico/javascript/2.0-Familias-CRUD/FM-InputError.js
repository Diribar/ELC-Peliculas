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
	let v = {
		ruta: "/crud/api/averigua-si-comentario-automatico/?id=",
		coment_aut: false,
	};

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
				v.coment_aut = await fetch(v.ruta + motivo.value).then((n) => n.json());
				if (v.coment_aut) console.log(motivo);
				// botonSubmit();
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
		// Corrige el doble espacio
		let com = DOM.comentario.value
			.replace(/ +/g, " ")
			.replace(/[^a-záéíóúüñ ,.'"\d\-]+$/gi, "")
			.replace(/\n/g, "")
			.slice(0, 100);

		if (com.length) {
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
