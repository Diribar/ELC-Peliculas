"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Formulario
		form: document.querySelector("#datosLargos #recuadroDL form"),
		submit: document.querySelector("#sectorIconos button[type='submit']"),

		// Motivo
		selectMotivo: document.querySelector("#motivos select[name='motivo_id']"),
		sectorDuplicado:document.querySelector("#motivos #sectorDuplicado"),
		selectEntidad: document.querySelector("#motivos #sectorDuplicado select[name='entidad']"),
		inputId: document.querySelector("#motivos #sectorDuplicado input[name='idDuplicado']"),

		// Comentario
		comentario: document.querySelector("#comentario textarea"),
		contador: document.querySelector("#comentario #contador"),
	};
	// Variables
	const entidad = new URL(location.href).searchParams.get("entidad");
	const motivosStatus = await fetch("/crud/api/motivos-status/?entidad=" + entidad).then((n) => n.json());

	// Funciones
	let FN = {
		botonSubmit: () => {
			// Variables
			const comentNeces = !DOM.comentario.readOnly;

			((DOM.selectMotivo && DOM.selectMotivo.value) || !DOM.selectMotivo) && // existe el select y se eligió un valor o no existe el select
			((comentNeces && DOM.comentario.value && DOM.comentario.value.length > 4) || !comentNeces) // se necesita un comentario y lo tiene o no se necesita un comentario
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

	// Event listeners - cambia el motivo
	if (DOM.selectMotivo)
		DOM.selectMotivo.addEventListener("change", async () => {
			// Obtiene el detalle del motivo
			const motivoBD = motivosStatus.find((n) => n.id == DOM.selectMotivo.value);

			// Muestra u oculta el 'sectorDuplicado'
			motivoBD.codigo=="duplicado"
			?
			:

			// Muestra u oculta el 'comentario'
			DOM.comentario.readOnly = !motivoBD.agregarComent;
			if (motivoBD.agregarComent) DOM.comentario.focus();

			// Actualiza el botón submit
			FN.botonSubmit();
		});
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
	DOM.form.addEventListener("submit", (e) => {
		if (DOM.submit.className.includes("inactivo")) e.preventDefault();
	});

	// Si no hay inputs, focus en comentario
	if (!DOM.selectMotivo) DOM.comentario.focus();
});
