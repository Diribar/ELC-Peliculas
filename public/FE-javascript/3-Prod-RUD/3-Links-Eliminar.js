window.addEventListener("load", () => {
	// Variables
	let filas_yaExistentes = document.querySelectorAll(".yaExistentes");
	let botonesOut = document.querySelectorAll(".yaExistentes .out");
	let links_id = document.querySelectorAll(".yaExistentes #link_id");

	// Listener de 'edición'
	for (let i = 0; i < botonesOut.length; i++) {
		botonesOut[i].addEventListener("click", async () => {
			if (botonesOut[i].classList.contains("fa-trash-can")) {
				let feedback = await fetch(
					"/producto/links/eliminar/?id=" + links_id[i].innerHTML
				).then((n) => n.json());
				if (feedback.resultado == true) filas_yaExistentes[i].classList.add("ocultar");
			}
		});
	}
});
// botón input 'submit'
