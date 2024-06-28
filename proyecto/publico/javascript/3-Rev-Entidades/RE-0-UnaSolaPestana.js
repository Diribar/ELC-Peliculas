"use strict";
window.addEventListener("load", async () => {
	// Broadcast that you're opening a page
	localStorage.openpages = Date.now();

	// Funcion
	var onLocalStorageEvent = (e) => {
		// Listen if anybody else is opening the same page!
		if (e.key == "openpages") localStorage.page_available = Date.now();

		if (e.key == "page_available") location.href = "/";
	};

	// Evento
	window.addEventListener("storage", onLocalStorageEvent, false);
});
