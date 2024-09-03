"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		cuerpo: document.querySelector("#cuerpoFooter #cuerpo"),
		logosLink: document.querySelectorAll(".yaExistentes .url a img"),

		// Activos
		filasActivas: document.querySelectorAll(".yaExistentes.inactivo_false"),
		logosActivos: document.querySelectorAll(".yaExistentes.inactivo_false .url a:not([href]) img"),
		linksActivos: document.querySelectorAll(".yaExistentes.inactivo_false .url:not(:has(a[href])) > input[name='url']"),

		// Inactivos
		logosInactivos: document.querySelectorAll(".yaExistentes.inactivo_true .url a:not([href]) img"),
		linksInactivos: document.querySelectorAll(".yaExistentes.inactivo_true .url:not(:has(a[href])) > input[name='url']"),
	};

	// Funciones
	let creaLosIframes = async (domLinks, activoInactivo) => {
		// Rutina para crear todos los iframes
		for (let domLink of domLinks) {
			// Agrega el entorno del iframe
			const div = document.createElement("div");
			div.id = "contIframe";
			div.className = "absoluteCentro ocultar " + activoInactivo;
			DOM.cuerpo.appendChild(div);

			// Agrega el iframe
			const iframe = document.createElement("iframe");
			if (domLink.value) iframe.src = await fetch(rutaEmbeded + encodeURIComponent(domLink.value)).then((n) => n.json());
			iframe.setAttribute("allowFullScreen", "");
			div.appendChild(iframe);
		}
		// Fin
		return;
	};
	if (DOM.linksActivos) await creaLosIframes(DOM.linksActivos, "activo");
	DOM.contIframesActivos = DOM.cuerpo.querySelectorAll("#contIframe.activo");
	if (DOM.linksInactivos) await creaLosIframes(DOM.linksInactivos, "inactivo");
	DOM.contIframesInactivos = DOM.cuerpo.querySelectorAll("#contIframe.inactivo");

	// Muestra el iframe si se hace click sobre él, y en caso contrario lo oculta
	window.addEventListener("click", (e) => {
		DOM.logosActivos.forEach((logoLink, i) => {
			if (logoLink == e.target) DOM.contIframesActivos[i].classList.remove("ocultar");
			else if (!DOM.contIframesActivos[i].className.includes("ocultar")) DOM.contIframesActivos[i].classList.add("ocultar");
		});
		DOM.logosInactivos.forEach((logoLink, i) => {
			if (logoLink == e.target) DOM.contIframesInactivos[i].classList.remove("ocultar");
			else if (!DOM.contIframesInactivos[i].className.includes("ocultar")) DOM.contIframesInactivos[i].classList.add("ocultar");
		});
	});

	// Start-up
	if (
		location.pathname.startsWith("/revision") && // es una vista de revisión
		DOM.contIframesActivos.length // hay links activos
	)
		for (let i = 0; i < DOM.contIframesActivos.length; i++)
			if (DOM.filasActivas[i].className.includes("oscuro_false")) {
				DOM.contIframesActivos[i].classList.remove("ocultar");
				break;
			}

	// Fin
	return;
});

// Variables
const rutaEmbeded = "/revision/api/link/obtiene-embeded-link/?linkUrl=";
