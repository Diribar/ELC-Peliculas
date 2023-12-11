"use strict";
window.addEventListener("load", () => {
	// Variables
	const prodEntidad = new URL(location.href).searchParams.get("entidad");
	const prodID = new URL(location.href).searchParams.get("id");
	let DOM = {
		filasYaExistentes: document.querySelectorAll(".yaExistentes"),
		botonesEditar: document.querySelectorAll(".edicion"), // No lleva 'yaExistentes'
		links_url: document.querySelectorAll(".yaExistentes input[name='url'"),
		taparMotivo: document.querySelectorAll(".yaExistentes .taparMotivo"),
		motivosFila: document.querySelectorAll(".yaExistentes .motivo"),
		motivosSelect: document.querySelectorAll(".yaExistentes .motivo select"),
		botonesOut: document.querySelectorAll(".yaExistentes .out"),
		// pasivos: document.querySelector("#tabla #tags #inactivo"),
	};
	let v = {
		condiciones: "?prodEntidad=" + prodEntidad + "&prodID=" + prodID,
		columnas: DOM.taparMotivo.length / DOM.filasYaExistentes.length,
	};
	let rutas = {
		eliminar: location.pathname.startsWith("/links/")
			? "/links/api/inactiva-o-elimina/"
			: location.pathname.startsWith("/revision/")
			? "/revision/api/link/alta-baja"
			: "",
	};

	// Listener de 'inactivar'
	DOM.botonesOut.forEach((botonOut, fila) => {
		botonOut.addEventListener("click", async () => {
			// Si el ícono está inactivo, interrumpe la función
			if (botonOut.classList.contains("inactivo")) return;

			// Elimina permanentemente
			if (botonOut.classList.contains("fa-trash-can")) {
				let motivo_id = DOM.motivosSelect[fila].value;
				let url = v.condiciones;
				url += "&url=" + encodeURIComponent(DOM.links_url[fila].value);
				url += "&motivo_id=" + motivo_id;
				url += "&IN=NO";
				url += "&aprob=NO";
				let respuesta = await fetch(rutas.eliminar + url).then((n) => n.json());
				if (respuesta.ocultar) DOM.filasYaExistentes[fila].classList.add("ocultar");
				if (respuesta.reload) location.reload();
			}
			// Inactiva
			else {
				// Ocultar el botón de edicion
				if (DOM.botonesEditar.length) DOM.botonesEditar[fila].classList.add("ocultar");

				// Reemplaza por el tacho
				botonOut.classList.remove("fa-circle-xmark");
				botonOut.classList.add("fa-trash-can");
				botonOut.classList.add("inactivo");

				// Oculta los 6 campos
				for (let columna = 0; columna < v.columnas; columna++)
					DOM.taparMotivo[fila * v.columnas + columna].classList.add("ocultar");

				// Muestra el select
				DOM.motivosFila[fila].classList.remove("ocultar");
				DOM.motivosSelect[fila].focus();
			}
		});
	});

	// Listener de motivo
	DOM.motivosSelect.forEach((motivoSelect, fila) => {
		motivoSelect.addEventListener("change", () => {
			let motivo = motivoSelect.value;
			if (motivo) DOM.botonesOut[fila].classList.remove("inactivo");
		});
	});
});
