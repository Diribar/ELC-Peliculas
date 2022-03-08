window.addEventListener("load", () => {
	// Variables
	let filas_yaExistentes = document.querySelectorAll(".yaExistentes");
	let botonesOut = document.querySelectorAll(".yaExistentes .out");
	let links_id = document.querySelectorAll(".yaExistentes #link_id");
	let taparMotivo = document.querySelectorAll(".yaExistentes .taparMotivo");
	let motivos = document.querySelectorAll(".yaExistentes #motivo");

	// Listener de 'edición'
	for (let i = 0; i < botonesOut.length; i++) {
		botonesOut[i].addEventListener("click", async () => {
			if (botonesOut[i].classList.contains("fa-trash-can")) {
				
				let feedback = await fetch(
					"/producto/links/eliminar/?id=" + links_id[i].innerHTML
				).then((n) => n.json());
				if (feedback.resultado == true) filas_yaExistentes[i].classList.add("ocultar");
			} else if (botonesOut[i].classList.contains("fa-circle-xmark")) {
				// Reemplazar por el tacho
				botonesOut[i].classList.add("fa-trash-can");
				botonesOut[i].classList.remove("fa-circle-xmark");
				// Ocultar los 6 campos
				for (let j = 0; j < 6; j++) {
					taparMotivo[i * 6 + j].classList.add("ocultar");
				}
				// Mostrar el select
				motivos[i].classList.remove("ocultar");
			}
		});
	}
});
