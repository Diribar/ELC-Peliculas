"use strict";
window.addEventListener("load", () => {
	// Variables
	const prodEntidad = new URL(location.href).searchParams.get("entidad");
	const prodID = new URL(location.href).searchParams.get("id");
	let DOM = {
		// Íconos addEventListeners
		iconosRevision: document.querySelectorAll(".yaExistentes .revision"),
		iconosIN: document.querySelectorAll(".yaExistentes .in"),
		iconosFuera: document.querySelectorAll(".yaExistentes .fuera"),

		// Objetos a ocultar
		iconosOut: document.querySelectorAll(".yaExistentes .out"),
		motivos: document.querySelectorAll(".yaExistentes .motivo"),
		taparMotivo: document.querySelectorAll(".yaExistentes .taparMotivo"),

		// Otros
		yaExistentes: document.querySelectorAll(".yaExistentes"),
		linksUrl: document.querySelectorAll(".yaExistentes input[name='url'"),
		ancho_status: document.querySelectorAll(".yaExistentes .ancho_status"),
	};
	let v = {
		condiciones: "?prodEntidad=" + prodEntidad + "&prodID=" + prodID,
		columnas: DOM.taparMotivo.length / DOM.yaExistentes.length,
		rutaFetch: "/revision/api/link/alta-baja/",
	};

	// Decisión tomada
	DOM.iconosRevision.forEach((icono, indice) => {
		const fila = parseInt(indice / 2);
		icono.addEventListener("click", async () => {
			// Variables
			let url = v.condiciones;

			// Completa el url
			url += "&url=" + encodeURIComponent(DOM.linksUrl[fila].value);
			url += "&IN=" + (icono.className.includes("in") ? "SI" : "NO");
			url += "&aprob=" + (icono.className.includes("aprob") ? "SI" : "NO");

			// Envía la acción
			const respuesta = await fetch(v.rutaFetch + url).then((n) => n.json());

			// Consecuencias a partir de la respuesta
			if (respuesta && typeof respuesta == "string") return location.reload();
			// Respuesta exitosa - Altas
			else if (!icono.className.includes("in")) DOM.yaExistentes[fila].classList.add("ocultar");
			// Respuesta exitosa - Bajas
			else {
				// Oculta objetos
				DOM.iconosIN[fila].classList.add("ocultar");
				DOM.iconosOut[fila].classList.add("ocultar");
				DOM.iconosFuera[fila].classList.add("ocultar");
				DOM.motivos[fila].classList.add("ocultar");

				// Muestra los 6 campos
				for (let columna = 0; columna < v.columnas; columna++)
					DOM.taparMotivo[fila * v.columnas + columna].classList.remove("ocultar");

				// Otros cambios
				DOM.yaExistentes[fila].classList.replace("oscuro_false", "oscuro_true");
				DOM.ancho_status[fila].innerHTML = "Aprobado";
			}

			// Respuesta exitosa - si la API devuelve un objeto literal, redirecciona
			if (respuesta)
				location.href =
					"/inactivar-captura/" +
					("?entidad=" + prodEntidad + "&id=" + prodID) +
					("&prodEntidad=" + respuesta.entidad + "&prodID=" + respuesta.id) +
					"&origen=RLK";
		});
	});

	// Fin
	return;
});
