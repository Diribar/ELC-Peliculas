"use strict";
window.addEventListener("load", async () => {
	// Start-up
	DOM.encabMasPelis.classList.replace("ocultar", "aparece"); // Tiene que estar en primer lugar, para no demorar su ejecución
	await cambioDeConfig_id();
	actualiza.cartelQuieroVerVisible();
	await cambioDeCampos();
	DOM.quieroVer.focus(); // foco en el cartel 'Quiero ver'
});
