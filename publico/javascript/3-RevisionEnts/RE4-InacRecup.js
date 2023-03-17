"use strict";
window.addEventListener("load", async () => {
	// Variables
	let form = document.querySelector("#recuadro form");
	let comentario = document.querySelector("#comentario textarea");
	let pendiente = document.querySelector("#comentario #pendiente");
	let desaprueba = document.querySelector("#botones label[for='desaprueba']");

	// Botón submit
	let botonDesaprobar = () => {
		comentario.value && comentario.value.length > 3
			? desaprueba.classList.remove("inactivo")
			: desaprueba.classList.add("inactivo");
	};

	// Event listeners
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

		// Primera letra en mayúscula
		if (com.length) comentario.value = com.slice(0, 1).toUpperCase() + com.slice(1);
		pendiente.innerHTML = 100 - com.length;

		// Actualiza el botón submit
		botonDesaprobar();
	});

	// Previene el submit si el botón está inactivo
	form.addEventListener("submit", (e) => {
		// e.preventDefault();
		if (e.submitter.id == "desaprueba" && desaprueba.className.includes("inactivo")) e.preventDefault();
	});
});
