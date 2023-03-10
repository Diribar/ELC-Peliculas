"use strict";
window.addEventListener("load", async () => {
	// Variables
	let motivos = document.querySelectorAll("#motivos input");
	let comentario = document.querySelector("#comentario textarea");
	let pendiente = document.querySelector("#comentario #pendiente");
	let submit = document.querySelector("#botones button[type='submit']");
	const ruta = "/crud/api/averigua-si-se-requiere-explicacion/?id=";
	let explicacion;

	// Botón submit
	let botonSubmit = () => {
		let checked = document.querySelector("#motivos input:checked");
		(!motivos.length && comentario.value) || (motivos && checked && (!explicacion || comentario.value))
			? submit.classList.remove("inactivo")
			: submit.classList.add("inactivo");
	};

	// Event listeners
	// Motivos
	if (motivos.length)
		for (let motivo of motivos)
			motivo.addEventListener("click", async () => {
				explicacion = await fetch(ruta + motivo.value).then((n) => n.json());
				botonSubmit();
			});

	// Comentario
	comentario.addEventListener("input", () => {
		let com = comentario.value;
		if (com.length) comentario.value = com.slice(0, 1).toUpperCase() + com.slice(1);
		pendiente.innerHTML = 170 - com.length;
		botonSubmit();
	});
});
