"use strict";
window.addEventListener("load", async () => {
	// Variables
	const compartirUrl = document.querySelector("#iconosDelTitulo #compartirUrl");
	const consCopiada = document.querySelector("#iconosDelTitulo #consCopiada");

	// Evento
	compartirUrl.addEventListener("click", (e) => {
		// Obtiene el 'url' y lo lleva al clipboard
		const url = location.href;
		navigator.clipboard.writeText(url);

		// Muestra la leyenda 'Consulta copiada'
		consCopiada.classList.remove("ocultar");
		setTimeout(() => consCopiada.classList.add("ocultar"), 1000);
	});
});
