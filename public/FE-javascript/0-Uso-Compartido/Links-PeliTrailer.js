"use strict";
window.addEventListener("load", () => {
	// Variables
	let tipo = document.querySelector("select#tipoLink");
	let filasExistentes = document.querySelectorAll("tr.yaExistentes");
	let filasEdicion = document.querySelectorAll("tr.edicion");
	let selects = document.querySelectorAll("tr.edicion .tipo select[name='link_tipo_id']");
	let tipoAltas = document.querySelector("tr.altas .tipo select[name='link_tipo_id']");

	// Add Event Listener
	tipo.addEventListener("change", () => {
		// Obtener el valor
		let valor = tipo.value;
		// Ocultar y mostrar las filas que correspondan
		if (selects.length)
			selects.forEach((n, i) => {
				if (n.value == valor || valor == "TD") {
					filasExistentes[i].classList.remove("ocultarTipo");
					filasEdicion[i].classList.remove("ocultarTipo");
				} else {
					filasExistentes[i].classList.add("ocultarTipo");
					filasEdicion[i].classList.add("ocultarTipo");
				}
			});
		// Cambiar el valor del 'tipo' en el input
		if (tipoAltas)
			if (valor != "TD") {
				tipoAltas.value = valor;
				tipoAltas.disabled = true;
				console.log(tipoAltas.value);
			} else {
				tipoAltas.value = "";
				tipoAltas.disabled = false;
			}
	});
});
