"use strict";
window.addEventListener("load", async () => {
	// Variables
	let form = document.querySelector("#recuadro form");
	let motivos = document.querySelectorAll("#motivos input");
	let comentario = document.querySelector("#comentario textarea");
	let pendiente = document.querySelector("#comentario #pendiente");
	let submit = document.querySelector("#botones button[type='submit']");
	const ruta = "/crud/api/averigua-si-se-requiere-comentario/?id=";
	let req_com;

	// Botón submit
	let botonSubmit = () => {
		let checked = document.querySelector("#motivos input:checked");
		(!motivos.length && comentario.value) || (motivos && checked && (!req_com || comentario.value))
			? submit.classList.remove("inactivo")
			: submit.classList.add("inactivo");
	};

	// Event listeners
	// Motivos
	if (motivos.length)
		for (let motivo of motivos)
			motivo.addEventListener("change", async () => {
				req_com = await fetch(ruta + motivo.value).then((n) => n.json());
				botonSubmit();
			});

	// Comentario
	comentario.addEventListener("keypress", (e) => {
		// Previene el uso del 'enter'
		if (e.key == "Enter") e.preventDefault();

		// Limita el uso del teclado solamente a los caracteres que nos interesan
		let formato = /^[a-záéíóúüñ ,.'"\d\-]+$/i;
		if (!formato.test(e.key)) e.preventDefault();
	});
	comentario.addEventListener("input", () => {
		// Corrige el doble espacio
		let com = comentario.value
			.replace(/ +/g, " ")
			.replace(/[^a-záéíóúüñ ,.'"\d\-]+$/gi, "")
			.replace(/\n/g, "")
			.slice(0, 100);

		if (com.length) {
			// El primer caracter no puede ser un espacio
			if (com.slice(0, 1) == " ") com = com.slice(1);

			// Primera letra en mayúscula
			comentario.value = com.slice(0, 1).toUpperCase() + com.slice(1);
			pendiente.innerHTML = 100 - com.length;
		}

		// Actualiza el botón submit
		botonSubmit();
	});

	// Previene el submit si el botón está inactivo
	form.addEventListener("submit", (e) => {
		if (submit.className.includes("inactivo")) e.preventDefault();
	});
});
