"use strict";
window.addEventListener("load", async () => {
	// Variables
	const cuerpoFooter = document.querySelector("#cuerpoFooter");

	// Obtiene el link y si no existe, termina la función
	const link_id = new URL(location.href).searchParams.get("link_id");
	if (!link_id) return;
	const link = await fetch("/links/api/obtiene-embeded-link/?linkID=" + link_id).then((n) => n.json());
	if (!link) return;

	// Agrega el entorno del iframe
	const div = document.createElement("div");
	div.id = "contIframe";
	div.className = "absoluteCentro";
	cuerpoFooter.appendChild(div);

	// Agrega el iframe
	const iframe = document.createElement("iframe");
	iframe.src = link;
	iframe.allow = "autoplay";
	iframe.setAttribute("allowFullScreen", "");
	div.appendChild(iframe);

	// Fin
	return;
});
