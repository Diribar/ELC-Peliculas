"use strict";
window.addEventListener("load", async () => {
	// Variables
	const icono = document.querySelector("#iconosDelTitulo #iconoCompartir");
	const leyenda = document.querySelector("#iconosDelTitulo .mostrarLeyenda");

	// Evento
	icono.addEventListener("click", (e) => {
		// Obtiene el 'url' y lo lleva al clipboard
		const url = location.href;
		navigator.clipboard.writeText(url);

		// Muestra la leyenda 'Consulta copiada'
		leyenda.classList.remove("ocultar");
		setTimeout(() => leyenda.classList.add("ocultar"), 1000);
	});
});
