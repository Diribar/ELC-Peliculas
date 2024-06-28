"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		cuerpo: document.querySelector("#cuerpoFooter #cuerpo"),
		logosLink: document.querySelectorAll(".yaExistentes .url a img"),

		// Activos
		logosActivos: document.querySelectorAll(".yaExistentes.inactivo_false .url a:not([href]) img"),
		linksActivos: document.querySelectorAll(".yaExistentes.inactivo_false .url:not(:has(a[href])) > input[name='url']"),

		// Inactivos
		logosInactivos: document.querySelectorAll(".yaExistentes.inactivo_true .url a:not([href]) img"),
		linksInactivos: document.querySelectorAll(".yaExistentes.inactivo_true .url:not(:has(a[href])) > input[name='url']"),
	};
	const rutaEmbeded = "/revision/api/link/obtiene-embeded-link/?linkUrl=";

	// Funciones
	let creaLosIframes = async (links, activoInactivo) => {
		// Rutina para crear todos los iframes
		for (let link of links) {
			// Agrega el entorno del iframe
			const div = document.createElement("div");
			div.id = "contIframe";
			div.className = "absoluteCentro ocultar " + activoInactivo;
			DOM.cuerpo.appendChild(div);

			// Agrega el iframe
			const iframe = document.createElement("iframe");
			if (link.value) iframe.src = await fetch(rutaEmbeded + encodeURIComponent(link.value)).then((n) => n.json());
			iframe.setAttribute("allowFullScreen", "");
			div.appendChild(iframe);
		}
		// Fin
		return;
	};

	// Crea los iframes activos
	if (DOM.linksActivos) await creaLosIframes(DOM.linksActivos, "activo");
	const contIframesActivos = DOM.cuerpo.querySelectorAll("#contIframe.activo");
	const iframesActivos = DOM.cuerpo.querySelectorAll("#contIframe.activo iframe");

	// Crea los iframes inactivos
	if (DOM.linksInactivos) await creaLosIframes(DOM.linksInactivos, "inactivo");
	const contIframesInactivos = DOM.cuerpo.querySelectorAll("#contIframe.inactivo");
	const iframesInactivos = DOM.cuerpo.querySelectorAll("#contIframe.inactivo iframe");

	// Muestra el iframe si se hace click sobre él, y en caso contrario lo oculta
	window.addEventListener("click", (e) => {
		DOM.logosActivos.forEach((logoLink, i) => {
			if (logoLink == e.target) contIframesActivos[i].classList.remove("ocultar");
			else if (!contIframesActivos[i].className.includes("ocultar")) contIframesActivos[i].classList.add("ocultar");
			iframesActivos[i].src = iframesActivos[i].src;
		});
		DOM.logosInactivos.forEach((logoLink, i) => {
			if (logoLink == e.target) contIframesInactivos[i].classList.remove("ocultar");
			else if (!contIframesInactivos[i].className.includes("ocultar")) contIframesInactivos[i].classList.add("ocultar");
			iframesInactivos[i].src = iframesInactivos[i].src;
		});
	});

	// Start-up
	const soloLinksEmbededActivos = DOM.logosLink.length == DOM.logosActivos.length;
	if (
		location.pathname.startsWith("/revision") && // es una vista de revisión
		contIframesActivos.length &&
		soloLinksEmbededActivos // sólo existen links embeded
	)
		contIframesActivos[0].classList.remove("ocultar");

	// Fin
	return;
});
