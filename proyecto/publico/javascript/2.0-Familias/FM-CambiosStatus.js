"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Formulario
		form: document.querySelector("#datosLargos #recuadroDL form"),
		submit: document.querySelector("#sectorIconos button[type='submit']"),

		// Motivo
		selectMotivo: document.querySelector("#motivos select[name='motivo_id']"),
		selectEntidad: document.querySelector("#motivos select[name='entidad']"),
		inputId: document.querySelector("#motivos input[name='idDuplicado']"),

		// Comentario
		comentario: document.querySelector("#comentario textarea"),
		pendiente: document.querySelector("#comentario #pendiente"),
	};
	// Variables
	const entidad = new URL(location.href).searchParams.get("entidad");
	const motivosStatus = await fetch("/crud/api/motivos-status/?entidad=" + entidad).then((n) => n.json());
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

	// Event listeners - cambia el motivo
	if (DOM.selectMotivo)
		DOM.selectMotivo.addEventListener("change", async () => {
			// Obtiene el detalle del motivo
			const motivoBD = motivosStatus.find((n) => n.id == motivo.value);

			// Completa el comentario
			DOM.comentario.readOnly = !motivoBD.agregarComent;
			if (motivoBD.agregarComent) DOM.comentario.focus();

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
	if (!DOM.selectMotivo) DOM.comentario.focus();
});
