"use strict";

window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		// Formulario
		form: document.querySelector("#datosLargos #recuadroDL form"),
		submit: document.querySelector("#sectorIconos button[type='submit']"),

		// Motivo
		selectMotivo: document.querySelector("#motivos select[name='motivo_id']"),
		sectorDuplicado: document.querySelector("#motivos #sectorDuplicado"),
		selectEntidad: document.querySelector("#motivos #sectorDuplicado select[name='entidad']"),
		inputId: document.querySelector("#motivos #sectorDuplicado input[name='idDuplicado']"),

		// Comentario
		comentario: document.querySelector("#comentario textarea"),
		contador: document.querySelector("#comentario #contador"),
	};
	// Variables
	const entidad = new URL(location.href).searchParams.get("entidad");
	const motivosStatus = await fetch("/crud/api/motivos-status/?entidad=" + entidad).then((n) => n.json());
	let comentNeces, duplicadoOK;

	// Funciones
	let FN = {
		botonSubmit: () => {
			// Activa o inactiva el botón submit
			DOM.selectMotivo.value && //  se eligió un motivo
			duplicadoOK && //el motivo no es duplicado o está contestado
			(!comentNeces || (DOM.comentario.value && DOM.comentario.value.length > 4)) // el comentario no es necesario o está bien contestado
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

	// Event listener - cambios en el formulario
	DOM.form.addEventListener("change", async (e) => {
		// Acciones que interrumpen la función
		if (!DOM.selectMotivo.value || e.target.name == "comentario") return;

		// Obtiene el detalle del motivo
		const motivoBD = motivosStatus.find((n) => n.id == DOM.selectMotivo.value);

		// Muestra u oculta el 'comentario'
		comentNeces = motivoBD.agregarComent;
		DOM.comentario.readOnly = !comentNeces;

		// Muestra u oculta el 'sectorDuplicado'
		const motivoDuplicado = motivoBD.codigo == "duplicado";
		motivoDuplicado ? DOM.sectorDuplicado.classList.remove("ocultar") : DOM.sectorDuplicado.classList.add("ocultar");
		duplicadoOK = !motivoDuplicado || (DOM.selectEntidad.value && DOM.inputId.value);

		if (motivoBD.agregarComent) DOM.comentario.focus();

		// Actualiza el botón submit
		FN.botonSubmit();
	});
	// Event listener - cambios en el comentario
	DOM.comentario.addEventListener("keypress", (e) => keyPressed(e));
	DOM.comentario.addEventListener("input", (e) => {
		// Validaciones estándar
		amplio.restringeCaracteres(e);

		// Actualiza el contador y el botón submit
		FN.contador();
		FN.botonSubmit();

		// Fin
		return;
	});
	// Event listener - cambios en el submit
	DOM.form.addEventListener("submit", (e) => {
		if (DOM.submit.className.includes("inactivo")) e.preventDefault();
	});

	// Focus en el motivo
	DOM.selectMotivo.focus();
});
