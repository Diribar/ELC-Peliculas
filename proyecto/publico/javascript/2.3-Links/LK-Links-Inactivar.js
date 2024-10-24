"use strict";
window.addEventListener("load", () => {
	// Variables
	let DOM = {
		yaExistentes: document.querySelectorAll(".yaExistentes"),
		botonesEditar: document.querySelectorAll(".edicion"), // No lleva 'yaExistentes'
		links_url: document.querySelectorAll(".yaExistentes input[name='url'"),
		taparMotivo: document.querySelectorAll(".yaExistentes .taparMotivo"),
		motivosFila: document.querySelectorAll(".yaExistentes .motivo"),
		motivosSelect: document.querySelectorAll(".yaExistentes .motivo select"),
		botonesOut: document.querySelectorAll(".yaExistentes .out"),
		// pasivos: document.querySelector("#tabla #tags #inactivo"),
	};
	let columnas = DOM.taparMotivo.length / DOM.yaExistentes.length;
	let respuesta;

	// Listener de 'inactivar'
	DOM.botonesOut.forEach((botonOut, fila) => {
		botonOut.addEventListener("click", async () => {
			// Si el ícono está inactivo, interrumpe la función
			if (botonOut.className.includes("inactivo")) return;

			// Elimina permanentemente
			if (botonOut.className.includes("fa-trash-can")) {
				// Variables
				let motivo_id = DOM.motivosSelect[fila].value;
				let url = condicion;
				url += "&url=" + encodeURIComponent(DOM.links_url[fila].value);
				url += "&motivo_id=" + motivo_id;
				url += "&IN=NO";
				url += "&aprob=NO";

				// Envía la decisión
				respuesta = await fetch(rutaEliminar + url).then((n) => n.json());

				// Consecuencias a partir de la respuesta
				if (respuesta) location.reload();
				else DOM.yaExistentes[fila].classList.add("ocultar");
			}
			// Inactiva
			else {
				// Ocultar el botón de edicion
				if (DOM.botonesEditar.length) DOM.botonesEditar[fila].classList.add("ocultar");

				// Reemplaza por el tacho
				botonOut.classList.replace("fa-circle-xmark", "fa-trash-can");
				// botonOut.classList.add("inactivo"); quitamos lo de inactivo, porque pusimos un motivo 'default'

				// Oculta los 6 campos
				for (let columna = 0; columna < columnas; columna++)
					DOM.taparMotivo[fila * columnas + columna].classList.add("ocultar");

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

// Variables
const condicion = "?prodEntidad=" + entidad + "&prodId=" + id;
const revision = location.pathname.includes("/revision/");
const rutaEliminar = revision ? "/links/api/lk-alta-baja" : "/links/api/lk-inactiva-o-elimina/";
