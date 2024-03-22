"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		form: document.querySelector("#datosLargos #recuadroDL form"),
		inputs: document.querySelectorAll("#motivos input"),
		comentario: document.querySelector("#comentario textarea"),
		pendiente: document.querySelector("#comentario #pendiente"),
		submit: document.querySelector("#botones button[type='submit']"),
	};
	const entidad = new URL(location.href).searchParams.get("entidad");
	const petitFamilias = ["peliculas", "colecciones", "capitulos"].includes(entidad) ? "prods" : "rclvs";

	// Busca los motivos
	const motivosStatus = await fetch("/crud/api/motivos-status")
		.then((n) => n.json())
		.then((n) => n.filter((m) => m[petitFamilias]));
	const motivosConComentario_id = motivosStatus.filter((n) => n.agregarComent).map((n) => n.id);

	// Funciones
	let contador = () => {
		DOM.pendiente.innerHTML = 100 - DOM.comentario.value.length;
		return;
	};
	let botonSubmit = () => {
		// Variables
		const checked = document.querySelector("#motivos input:checked");
		const comentNeces = checked && motivosConComentario_id.includes(Number(checked.id));

		(DOM.inputs.length &&
			checked && // hay inputs y alguno está chequeado
			((comentNeces && DOM.comentario.value && DOM.comentario.value.length > 4) || // el motivo requiere comentario y lo tiene
				(!comentNeces && !DOM.comentario.value))) || // el motivo no requiere comentario y no lo tiene
		!DOM.inputs.length // no hay inputs a chequear (para sacar de inactivar o recuperar)
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
				DOM.comentario.readOnly = !motivoRechAltas.agregarComent;
				DOM.comentario.placeholder = motivoRechAltas.agregarComent ? "Agregá un comentario" : "";
				if (motivoRechAltas.agregarComent) DOM.comentario.focus();

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
