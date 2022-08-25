"use strict";
window.addEventListener("load", () => {
	// Producto y ID
	let prodEntidad = new URL(window.location.href).searchParams.get("entidad");
	let prodID = new URL(window.location.href).searchParams.get("id");
	let condiciones = "?prodEntidad=" + prodEntidad + "&prodID=" + prodID;
	// Variables
	let filas_yaExistentes = document.querySelectorAll(".yaExistentes");
	let botonesOut = document.querySelectorAll(".yaExistentes .out");
	let botonesEditar = document.querySelectorAll(".yaExistentes .editar");
	let taparMotivo = document.querySelectorAll(".yaExistentes .taparMotivo");
	let motivosFila = document.querySelectorAll(".yaExistentes .motivo");
	let motivosSelect = document.querySelectorAll(".yaExistentes .motivo select");
	let columnas = taparMotivo.length / filas_yaExistentes.length;
	let links_url = document.querySelectorAll(".yaExistentes input[name='url'");
	let pasivos = document.querySelector("#tabla #tags #inactivo");
	// Ruta
	let entorno = window.location.pathname;
	let ruta = entorno.startsWith("/links/")
		? "/links/api/eliminar/"
		: entorno.startsWith("/revision/")
		? "/revision/api/link-alta"
		: "";

	// Listener de 'inactivar'
	botonesOut.forEach((botonOut, fila) => {
		botonOut.addEventListener("click", async () => {
			if (botonOut.classList.contains("fa-circle-xmark")) {
				// Ocultar el botón de editar
				botonesEditar[fila].classList.add("ocultar");
				// Reemplazar por el tacho
				botonOut.classList.remove("fa-circle-xmark");
				botonOut.classList.add("fa-trash-can");
				botonOut.classList.add("inactivo");
				// Ocultar los 6 campos
				for (let columna = 0; columna < columnas; columna++)
					taparMotivo[fila * columnas + columna].classList.add("ocultar");
				// Mostrar el select
				motivosFila[fila].classList.remove("ocultar");
			} else if (
				botonOut.classList.contains("fa-trash-can") &&
				!botonOut.classList.contains("inactivo")
			) {
				let motivo_id = motivosSelect[fila].value;
				let url = condiciones;
				url += "&url=" + encodeURIComponent(links_url[fila].value);
				url += "&motivo_id=" + motivo_id;
				let respuesta = await fetch(ruta + url).then((n) => n.json());
				if (respuesta.ocultar) filas_yaExistentes[fila].classList.add("ocultar");
				if (respuesta.reload) window.location.reload();
				if (respuesta.pasivos) pasivos.innerHTML = "* Pasivos";
			}
		});
	});

	// Listener de motivo
	motivosSelect.forEach((motivoSelect, fila) => {
		motivoSelect.addEventListener("change", () => {
			let motivo = motivoSelect.value;
			if (motivo) botonesOut[fila].classList.remove("inactivo");
		});
	});
});
