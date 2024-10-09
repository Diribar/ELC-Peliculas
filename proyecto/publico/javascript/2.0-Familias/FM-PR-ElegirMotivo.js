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
		entDupl: document.querySelector("#motivos #sectorDuplicado select[name='entDupl']"),
		idDupl: document.querySelector("#motivos #sectorDuplicado input[name='idDupl']"),
		resultadoDuplicado: document.querySelector("#motivos #sectorDuplicado #resultadoDuplicado"),

		// Comentario
		comentario: document.querySelector("#comentario textarea"),
		contador: document.querySelector("#comentario #contador"),
	};
	const {motivos: statusMotivos, largoComentario} = await fetch("/familia/api/fm-obtiene-info-del-be/?entidad=" + entidad).then((n) =>
		n.json()
	);
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
			DOM.contador.innerHTML = largoComentario - DOM.comentario.value.length;
			return;
		},
	};

	// Event listener - cambios en el formulario
	DOM.form.addEventListener("change", async (e) => {
		// Acciones que interrumpen la función
		if (!DOM.selectMotivo.value || e.target.name == "comentario") return;

		// Obtiene el detalle del motivo
		const motivoBD = statusMotivos.find((n) => n.id == DOM.selectMotivo.value);

		// Muestra u oculta el 'comentario'
		comentNeces = motivoBD.comentNeces;
		DOM.comentario.readOnly = !comentNeces;

		// Muestra u oculta el 'sectorDuplicado'
		const motivoDuplicado = motivoBD.codigo == "duplicado";
		motivoDuplicado ? DOM.sectorDuplicado.classList.remove("ocultar") : DOM.sectorDuplicado.classList.add("ocultar");

		// Si el motivo es duplicado, busca el registro
		if (motivoDuplicado) {
			// Variables
			const entDupl = DOM.entDupl.value;
			const idDupl = DOM.idDupl.value;
			const entIdOK = entDupl && idDupl;

			// Si la 'entidad' y el 'id' están ingresados, busca el registro
			if (entIdOK) {
				let innerText;
				const registro = await fetch("/familia/api/fm-obtiene-registro/?entidad=" + entDupl + "&id=" + idDupl).then((n) =>
					n.json()
				);
				if (registro) {
					const {nombre, nombreAltern, nombreCastellano, nombreOriginal} = registro;
					innerText = nombre
						? nombre
						: nombreAltern
						? nombreAltern
						: nombreCastellano
						? nombreCastellano
						: nombreOriginal
						? nombreOriginal
						: "Encontramos el registro, pero no tiene nombre";
					duplicadoOK = true;
				} else {
					innerText = "No tenemos un registro con esos datos";
					duplicadoOK = false;
				}
				DOM.resultadoDuplicado.innerHTML = "<u>Duplicado con</u>: <em>" + innerText + "</em>";
			} else duplicadoOK = false;
		} else duplicadoOK = true;

		if (motivoBD.comentNeces) DOM.comentario.focus();

		// Actualiza el botón submit
		FN.botonSubmit();
	});
	// Event listener - cambios en el comentario
	DOM.comentario.addEventListener("keypress", (e) => keyPressed(e));
	DOM.comentario.addEventListener("input", (e) => {
		// Si se excedió el largo permitido, corta el sobrante
		if (DOM.comentario.value.length > largoComentario) DOM.comentario.value = DOM.comentario.value.slice(0, largoComentario);

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
