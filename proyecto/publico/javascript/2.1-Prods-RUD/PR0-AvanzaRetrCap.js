"use strict";
window.addEventListener("load", async () => {
	// Variables
	const prodID = new URL(location.href).searchParams.get("id");
	const origenUrl = location.pathname.slice(0, -1);
	const botonCapAnt = document.querySelector("#encabezado #colCap .fa-circle-left");
	const botonCapPost = document.querySelector("#encabezado #colCap .fa-circle-right");
	const ruta = "/crud/api/obtiene-cap-ant-y-post/?id=";
	const [capAntID, capPostID] = await fetch(ruta + prodID).then((n) => n.json());

	// Acciones si existe "capítulo anterior"
	if (capAntID) {
		botonCapAnt.classList.remove("inactivo");
		botonCapAnt.addEventListener("click", () => {
			location.href =
				"/inactivar-captura/?entidad=capitulos&id=" +
				prodID +
				"&prodEntidad=capitulos&prodID=" +
				capAntID +
				"&origenUrl=" +
				encodeURIComponent(origenUrl);
		});
	} else botonCapAnt.classList.add("inactivo");

	// Acciones si existe "capítulo posterior"
	if (capPostID) {
		botonCapPost.classList.remove("inactivo");
		botonCapPost.addEventListener("click", () => {
			location.href =
				"/inactivar-captura/?entidad=capitulos&id=" +
				prodID +
				"&prodEntidad=capitulos&prodID=" +
				capPostID +
				"&origenUrl=" +
				encodeURIComponent(origenUrl);
		});
	} else botonCapPost.classList.add("inactivo");
});
