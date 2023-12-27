"use strict";
window.addEventListener("load", async () => {
	// Variables
	const cuerpoFooter = document.querySelector("#cuerpoFooter");
	const linksHref = document.querySelectorAll(".yaExistentes .url a:not([href])");
	const linksUrl = document.querySelectorAll(".yaExistentes .url:not(:has(a[href])) > input[name='url']");
	let linksEmbeded = [];

	// linksHref
	for (let link_href of linksHref) if (!link_href.href) link_href.classList.add("pointer");

	// Obtiene los linksEmbeded
	if (linksUrl && linksUrl.length)
		for (let linkUrl of linksUrl)
			linksEmbeded.push(
				linkUrl.value ? fetch("/links/api/obtiene-embeded-link/?linkUrl=" + linkUrl.value).then((n) => n.json()) : ""
			);
	else return;
	linksEmbeded = await Promise.all(linksEmbeded);

	// Agrega el entorno del iframe
	const div = document.createElement("div");
	div.id = "videoDetPeli";
	div.className = "absoluteCentro";
	cuerpoFooter.appendChild(div);

	// Agrega el iframe
	const iframe = document.createElement("iframe");
	iframe.src = "";
	iframe.allow = "autoplay";
	iframe.setAttribute("allowFullScreen", "");
	div.appendChild(iframe);

	// Eventos
	linksHref.forEach((linkHref, i) => linkHref.addEventListener("click", () => (iframe.src = linksEmbeded[i])));
	window.addEventListener("click", (e) => {
		if (!e.target.className.includes("imgProvLink")) iframe.src = "";
	});

	// Fin
	return;
});
