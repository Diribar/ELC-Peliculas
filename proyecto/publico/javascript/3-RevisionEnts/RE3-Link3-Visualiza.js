"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		cuerpoFooter: document.querySelector("#cuerpoFooter"),
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
			DOM.cuerpoFooter.appendChild(div);

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
	const contIframesActivos = DOM.cuerpoFooter.querySelectorAll("#contIframe.activo");
	const iframesActivos = DOM.cuerpoFooter.querySelectorAll("#contIframe.activo iframe");

	// Crea los iframes inactivos
	if (DOM.linksInactivos) await creaLosIframes(DOM.linksInactivos, "inactivo");
	const contIframesInactivos = DOM.cuerpoFooter.querySelectorAll("#contIframe.inactivo");
	const iframesInactivos = DOM.cuerpoFooter.querySelectorAll("#contIframe.inactivo iframe");

	// Eventos
	window.addEventListener("click", (e) => {
		DOM.logosActivos.forEach((logoLink, i) => {
			// Muestra/Oculta el iframe, según corresponda
			if (logoLink == e.target) contIframesActivos[i].classList.remove("ocultar");
			else if (!contIframesActivos[i].className.includes("ocultar")) contIframesActivos[i].classList.add("ocultar");
			iframesActivos[i].src = iframesActivos[i].src;
		});
		DOM.logosInactivos.forEach((logoLink, i) => {
			// Muestra/Oculta el iframe, según corresponda
			if (logoLink == e.target) contIframesInactivos[i].classList.remove("ocultar");
			else if (!contIframesInactivos[i].className.includes("ocultar")) contIframesInactivos[i].classList.add("ocultar");
			iframesInactivos[i].src = iframesInactivos[i].src;
		});
	});

	// Start-up
	const soloLinksEmbeded = DOM.logosLink.length == DOM.logosActivos.length + DOM.logosInactivos.length;
	if (contIframesActivos.length && soloLinksEmbeded) contIframesActivos[0].classList.remove("ocultar");
	return;
});
