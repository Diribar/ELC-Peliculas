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
	const rutaEmbeded = "/links/api/obtiene-embeded-link/?linkUrl=";
	let iframesActivos, iframesInactivos;

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
			// iframe.allow = "autoplay";
			iframe.setAttribute("allowFullScreen", "");
			div.appendChild(iframe);
		}
		// Fin
		return;
	};

	// Crea los iframes activos
	if (DOM.linksActivos) await creaLosIframes(DOM.linksActivos, "activo");
	iframesActivos = DOM.cuerpoFooter.querySelectorAll("#contIframe.activo");

	// Crea los iframes inactivos
	if (DOM.linksInactivos) await creaLosIframes(DOM.linksInactivos, "inactivo");
	iframesInactivos = DOM.cuerpoFooter.querySelectorAll("#contIframe.inactivo");

	// Eventos
	window.addEventListener("click", (e) => {
		DOM.logosActivos.forEach((logoLink, i) => {
			// Muestra/Oculta el iframe, según corresponda
			if (logoLink == e.target) iframesActivos[i].classList.remove("ocultar");
			else if (!iframesActivos[i].className.includes("ocultar")) iframesActivos[i].classList.add("ocultar");
		});
		DOM.logosInactivos.forEach((logoLink, i) => {
			// Muestra/Oculta el iframe, según corresponda
			if (logoLink == e.target) iframesInactivos[i].classList.remove("ocultar");
			else if (!iframesInactivos[i].className.includes("ocultar")) iframesInactivos[i].classList.add("ocultar");
		});
	});

	// Start-up
	const soloLinksEmbeded = DOM.logosLink.length == DOM.logosActivos.length + DOM.logosInactivos.length;
	if (iframesActivos.length && soloLinksEmbeded) iframesActivos[0].classList.remove("ocultar");
	return;
});
