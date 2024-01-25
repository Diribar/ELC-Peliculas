"use strict";
window.addEventListener("load", async () => {
	// Variables
	let DOM = {
		cuerpoFooter: document.querySelector("#cuerpoFooter"),
		logosLink: document.querySelectorAll(".yaExistentes .url a img"),
		logosLinkEmbeded: document.querySelectorAll(".yaExistentes .url a:not([href]) img"),
		linksUrl: document.querySelectorAll(".yaExistentes .url:not(:has(a[href])) > input[name='url']"),
	};
	const rutaEmbeded = "/links/api/obtiene-embeded-link/?linkUrl=";
	let contsIframe = [];

	// Obtiene los linksEmbeded
	if (DOM.linksUrl && DOM.linksUrl.length) {
		// Crea cada iframe
		for (let linkUrl of DOM.linksUrl) {
			// Agrega el entorno del iframe
			const div = document.createElement("div");
			div.id = "contIframe";
			div.className = "absoluteCentro ocultar";
			DOM.cuerpoFooter.appendChild(div);

			// Agrega el iframe
			const iframe = document.createElement("iframe");
			if (linkUrl.value) iframe.src = await fetch(rutaEmbeded + encodeURIComponent(linkUrl.value)).then((n) => n.json());
			// iframe.allow = "autoplay";
			iframe.setAttribute("allowFullScreen", "");
			div.appendChild(iframe);
		}

		// Obtiene los DOMs
		contsIframe = DOM.cuerpoFooter.querySelectorAll("#contIframe");
	} else return;

	// Eventos
	window.addEventListener("click", (e) => {
		DOM.logosLinkEmbeded.forEach((logoLink, i) => {
			// Muestra/Oculta el iframe, según corresponda
			if (logoLink == e.target) contsIframe[i].classList.remove("ocultar");
			else if (!contsIframe[i].className.includes("ocultar")) contsIframe[i].classList.add("ocultar");
		});
	});

	// Start-up
	if (DOM.logosLink.length) contsIframe[0].classList.remove("ocultar");
});
