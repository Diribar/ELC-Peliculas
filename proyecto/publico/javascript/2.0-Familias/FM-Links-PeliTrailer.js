"use strict";
window.addEventListener("load", () => {
	// Variables
	const peliculaTrailer = document.querySelector("select#peliculaTrailer");
	const filasExistentes = document.querySelectorAll("tr.yaExistentes");
	const filasEdicionesCRUD = document.querySelectorAll("tr.edicion.crud");
	const filasEdicionesRevisar = document.querySelectorAll("tr.edicion.revisar");
	const tipoAltas = document.querySelector("tr.alta .tipo select[name='tipo_id']");

	// Add Event Listener
	peliculaTrailer.addEventListener("change", () => {
		// Obtiene el valor
		let valor = peliculaTrailer.value;
		// Ocultar y mostrar las filas que correspondan
		if (filasExistentes.length)
			filasExistentes.forEach((filaExistente, fila) => {
				let filaDatos = Array.from(filaExistente.classList).find((n) => n.startsWith("fila"));
				if (filaExistente.className.includes(valor) || valor == "TD") {
					// Mostrar filas de Datos
					filasExistentes[fila].classList.remove("ocultaTipo");
					// Mostrar filas de Edición - CRUD
					if (filasEdicionesCRUD.length) filasEdicionesCRUD[fila].classList.remove("ocultaTipo");
					// Mostrar filas de Edición - Revisión
					if (filasEdicionesRevisar.length)
						filasEdicionesRevisar.forEach((filaEdicionRevisar) => {
							let filaEdicion = Array.from(filaEdicionRevisar.classList).find((n) =>
								n.startsWith("fila")
							);
							if (filaDatos == filaEdicion) filaEdicionRevisar.classList.remove("ocultaTipo");
						});
				} else {
					// Ocultar filas de Datos
					filasExistentes[fila].classList.add("ocultaTipo");
					// Ocultar filas de Edición - CRUD
					if (filasEdicionesCRUD.length) filasEdicionesCRUD[fila].classList.add("ocultaTipo");
					// Ocultar filas de Edición - Revisión
					if (filasEdicionesRevisar.length)
						filasEdicionesRevisar.forEach((filaEdicionRevisar) => {
							let filaEdicion = Array.from(filaEdicionRevisar.classList).find((n) =>
								n.startsWith("fila")
							);
							if (filaDatos == filaEdicion) filaEdicionRevisar.classList.add("ocultaTipo");
						});
				}
			});
		// Cambiar el valor del 'tipo' en el input (sólo para la vista CRUD)
		if (tipoAltas)
			if (valor != "TD") {
				tipoAltas.value = valor;
				tipoAltas.disabled = true;
			} else {
				tipoAltas.value = "";
				tipoAltas.disabled = false;
			}
	});
});
