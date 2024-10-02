"use strict";
window.addEventListener("load", async () => {
	// Variables
	const botonCapAnt = document.querySelector("#encabezado #colCap .fa-circle-left");
	const botonCapPost = document.querySelector("#encabezado #colCap .fa-circle-right");
	const origenUrl = pathname.slice(0, -1);
	const ruta = "/capitulos/api/obtiene-cap-ant-y-post/?id=";
	const [capAntID, capPostID] = await fetch(ruta + id).then((n) => n.json());

	// Acciones si existe "capítulo anterior"
	if (capAntID) {
		botonCapAnt.classList.remove("inactivo");
		botonCapAnt.addEventListener("click", () => {
			location.href =
				"/inactivar-captura/capitulos/?id=".concat(id) +
				"&prodEntidad=capitulos&prodId=".concat(capAntID) +
				"&origenUrl=".concat(encodeURIComponent(origenUrl));
		});
	} else botonCapAnt.classList.add("inactivo");

	// Acciones si existe "capítulo posterior"
	if (capPostID) {
		botonCapPost.classList.remove("inactivo");
		botonCapPost.addEventListener("click", () => {
			location.href =
				"/inactivar-captura/capitulos/?id=".concat(id) +
				"&prodEntidad=capitulos&prodId=".concat(capPostID) +
				"&origenUrl=".concat(encodeURIComponent(origenUrl));
		});
	} else botonCapPost.classList.add("inactivo");

	// Fin
	return;
});
