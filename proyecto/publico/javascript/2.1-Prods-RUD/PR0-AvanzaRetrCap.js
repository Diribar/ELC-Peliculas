"use strict";
window.addEventListener("load", async () => {
	// Variables
	const botonCapAnt = document.querySelector("#encabezado #colCap .fa-circle-left");
	const botonCapPost = document.querySelector("#encabezado #colCap .fa-circle-right");
	const urlOrigen = pathname.slice(0, -1);
	const ruta = "/capitulos/api/pr-obtiene-cap-ant-y-post/?id=";
	const [capAntID, capPostID] = await fetch(ruta + id).then((n) => n.json());

	// Acciones si existe "capítulo anterior"
	if (capAntID) {
		botonCapAnt.classList.remove("inactivo");
		botonCapAnt.addEventListener("click", () => {
			location.href =
				"/capitulos/inactivar-captura/?id=".concat(id) +
				"&prodEntidad=capitulos&prodId=".concat(capAntID) +
				"&urlOrigen=".concat(encodeURIComponent(urlOrigen));
		});
	} else botonCapAnt.classList.add("inactivo");

	// Acciones si existe "capítulo posterior"
	if (capPostID) {
		botonCapPost.classList.remove("inactivo");
		botonCapPost.addEventListener("click", () => {
			location.href =
				"/capitulos/inactivar-captura/?id=".concat(id) +
				"&prodEntidad=capitulos&prodId=".concat(capPostID) +
				"&urlOrigen=".concat(encodeURIComponent(urlOrigen));
		});
	} else botonCapPost.classList.add("inactivo");

	// Fin
	return;
});
