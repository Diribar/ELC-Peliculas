"use strict";
window.addEventListener("load", () => {
	// Variables
	const prodEntidad = new URL(location.href).searchParams.get("entidad");
	const prodID = new URL(location.href).searchParams.get("id");
	let DOM = {
		// Íconos addEventListeners
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
		ruta: "/revision/api/link/alta-baja/",
	};

	// Decisión tomada
	DOM.iconosIN.forEach((icono, fila) => {
		icono.addEventListener("click", async () => {
			// Variables
			let url = v.condiciones;
			// Completar el url
			url += "&url=" + encodeURIComponent(DOM.linksUrl[fila].value);
			url += "&IN=SI";
			url += "&aprob=" + (icono.className.includes("aprob") ? "SI" : "NO");
			let respuesta = await fetch(v.ruta + url).then((n) => n.json());
			if (respuesta.reload) {
				// Oculta objetos
				icono.classList.add("ocultar");
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
		});
	});
	DOM.iconosFuera.forEach((icono, fila) => {
		icono.addEventListener("click", async () => {
			// Variables
			let url = v.condiciones;
			// Completar el url
			url += "&url=" + encodeURIComponent(DOM.linksUrl[fila].value);
			url += "&IN=NO";
			url += "&aprob=" + (icono.className.includes("aprob") ? "SI" : "NO");
			let respuesta = await fetch(v.ruta + url).then((n) => n.json());
			if (respuesta.reload) DOM.yaExistentes[fila].classList.add("ocultar");
		});
	});
});
