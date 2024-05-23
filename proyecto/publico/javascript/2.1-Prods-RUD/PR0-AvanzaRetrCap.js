"use strict";
window.addEventListener("load", async () => {
	// Variables
	const prodID = new URL(location.href).searchParams.get("id");
	const codigo = location.pathname.slice(1, -1);
	const botonCapAnt = document.querySelector("#encabezado #colCap .fa-circle-left");
	const botonCapPost = document.querySelector("#encabezado #colCap .fa-circle-right");

	const origen = false
		? null
		: codigo == "producto/detalle"
		? "DTP"
		: codigo == "producto/edicion"
		? "EDP"
		: codigo == "links/abm"
		? "LK"
		: codigo == "revision/links"
		? "RL"
		: "";
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
				"&origen=" +
				origen;
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
				"&origen=" +
				origen;
		});
	} else botonCapPost.classList.add("inactivo");
});
