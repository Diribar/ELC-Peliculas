"use strict";
window.addEventListener("load", async () => {
	// Variables
	const cuerpoFooter = document.querySelector("#cuerpoFooter");
	const linksHref = document.querySelectorAll(".yaExistentes .url a:not([href])");
	const logosLink= document.querySelectorAll(".yaExistentes .url a:not([href]) img")
	const linksUrl = document.querySelectorAll(".yaExistentes .url:not(:has(a[href])) > input[name='url']");
	const rutaEmbeded = "/links/api/obtiene-embeded-link/?linkUrl=";
	let contsIframe = [];

	// Obtiene los linksEmbeded
	if (linksUrl && linksUrl.length) {
		// Crea cada iframe
		for (let linkUrl of linksUrl) {
			// Agrega el entorno del iframe
			const div = document.createElement("div");
			div.id = "contIframe";
			div.className = "absoluteCentro ocultar";
			cuerpoFooter.appendChild(div);

			// Agrega el iframe
			const iframe = document.createElement("iframe");
			if (linkUrl.value) iframe.src = await fetch(rutaEmbeded + linkUrl.value).then((n) => n.json());
			// iframe.allow = "autoplay";
			iframe.setAttribute("allowFullScreen", "");
			div.appendChild(iframe);
		}

		// Obtiene los DOMs
		contsIframe = cuerpoFooter.querySelectorAll("#contIframe");
	} else return;

	// Eventos
	window.addEventListener("click", (e) => {
		logosLink.forEach((logoLink, i) => {
			// Muestra/Oculta el iframe, según corresponda
			if (logoLink == e.target) contsIframe[i].classList.remove("ocultar");
			else if (!contsIframe[i].className.includes("ocultar")) contsIframe[i].classList.add("ocultar");
		});
	});

	// Fin
	return;
});
