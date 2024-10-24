"use strict";
window.addEventListener("load", async () => {
	// Variables
	const compartirIcono = document.querySelector("#iconosDelTitulo #compartirIcono");
	const compartirLeyenda = document.querySelector("#iconosDelTitulo #compartirLeyenda");

	// Evento
	compartirIcono.addEventListener("click", (e) => {
		// Obtiene el 'url' y lo lleva al clipboard
		const url = location.href;
		navigator.clipboard.writeText(url);

		// Muestra la leyenda 'Consulta copiada'
		compartirLeyenda.classList.remove("ocultar");
		setTimeout(() => compartirLeyenda.classList.add("ocultar"), 1000);
	});
});
