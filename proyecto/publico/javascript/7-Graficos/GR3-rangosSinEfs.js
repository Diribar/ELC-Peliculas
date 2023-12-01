"use strict";
window.addEventListener("load", async () => {
	// Obtiene información del backend
	const datos = await fetch("/graficos/api/rangos-sin-efemerides").then((n) => n.json());
});
