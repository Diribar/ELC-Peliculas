"use strict";
window.addEventListener("load", async () => {
	// Variables
	const prodID = new URL(location.href).searchParams.get("id");
	const codigo = location.pathname.slice(1,-1)
	const origen = false
		? null
		: codigo == "producto/detalle"
		? "DTP"
		: codigo == "producto/edicion"
		? "EDP"
		: codigo == "links/abm"
		? "LK"
		: codigo == "revision/links"
		? "RLK"
		: "";
	let ruta;

	// CAPÍTULOS ANTERIOR O POSTERIOR
	// Obtiene el ID del capítulo anterior y del posterior
	ruta = "/crud/api/obtiene-cap-ant-y-post/?id=";
	let [capAntID, capPostID] = await fetch(ruta + prodID).then((n) => n.json());
	// Acción si se elije "capítulo anterior"
	let botonCapAnt = document.querySelector("#cuerpo #encabezado .fa-circle-left");
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
	// Acción si se elije "capítulo posterior"
	let botonCapPost = document.querySelector("#cuerpo #encabezado .fa-circle-right");
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
