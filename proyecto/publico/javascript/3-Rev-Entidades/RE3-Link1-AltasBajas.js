"use strict";
window.addEventListener("load", () => {
	// Variables
	let DOM = {
		filas: document.querySelectorAll(".yaExistentes"),

		// Íconos addEventListeners
		iconosRevision: document.querySelectorAll(".yaExistentes .revision"),
		iconosIN: document.querySelectorAll(".yaExistentes .revision.in"),
		iconosFuera: document.querySelectorAll(".yaExistentes .revision.fuera"),

		// Objetos a ocultar
		iconosOut: document.querySelectorAll(".yaExistentes .out"),
		motivos: document.querySelectorAll(".yaExistentes .motivo"),
		taparMotivo: document.querySelectorAll(".yaExistentes .taparMotivo"),

		// Otros
		linksUrl: document.querySelectorAll(".yaExistentes input[name='url'"),
		ancho_status: document.querySelectorAll(".yaExistentes .ancho_status"),
	};
	const columnas = DOM.taparMotivo.length / DOM.filas.length;

	// Acciones en función de la decisión tomada
	DOM.iconosRevision.forEach((icono, indice) => {
		const fila = parseInt(indice / 2);
		icono.addEventListener("click", async () => {
			// Variables
			let url = condicion;

			// Completa el url
			url += "&url=" + encodeURIComponent(DOM.linksUrl[fila].value);
			url += "&IN=" + (icono.className.includes("in") ? "SI" : "NO");
			url += "&aprob=" + (icono.className.includes("aprob") ? "SI" : "NO");

			// Envía la decisión
			const hayProblemas = await fetch(rutaAltaBaja + url).then((n) => n.json());

			// Consecuencias a partir de la respuesta
			if (hayProblemas) return location.reload();
			// Respuesta exitosa - Bajas
			else if (!icono.className.includes("in")) DOM.filas[fila].classList.add("ocultar");
			// Respuesta exitosa - Altas
			else {
				// Oculta objetos
				DOM.iconosIN[fila].classList.add("ocultar");
				DOM.iconosOut[fila].classList.add("ocultar");
				DOM.iconosFuera[fila].classList.add("ocultar");
				DOM.motivos[fila].classList.add("ocultar");

				// Muestra los campos que se hubieran ocultado
				for (let columna = 0; columna < columnas; columna++)
					DOM.taparMotivo[fila * columnas + columna].classList.remove("ocultar");

				// Otros cambios
				DOM.filas[fila].classList.replace("oscuro_false", "oscuro_true");
				DOM.ancho_status[fila].innerHTML = "Aprobado";
			}

			// Averigua si ya no hay más nada para revisar sobre este producto
			url = "?entidad=" + prodEntidad + "&id=" + prodId;
			sigProd = await fetch(rutaSigProd + url).then((n) => n.json());

			// Si la API devuelve un sigProd, redirecciona
			if (sigProd)
				location.href =
					"/inactivar-captura/" + url + "&prodEntidad=" + sigProd.entidad + "&prodId=" + sigProd.id + "&origen=RL";

			// Fin
			return;
		});
	});

	// Fin
	return;
});

// Variables
// const prodEntidad = new URL(location.href).searchParams.get("entidad");
// const prodId = new URL(location.href).searchParams.get("id");
// const condicion = "?prodEntidad=" + prodEntidad + "&prodId=" + prodId;
const rutaAltaBaja = "/revision/api/link/alta-baja/";
const rutaSigProd = "/revision/api/link/siguiente-producto/";
let sigProd;
