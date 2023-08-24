"use strict";
window.addEventListener("load", () => {
	// Variables
	let DOM = {
		header: document.querySelector("header"),
		menuCapacitac: document.querySelector("header #menuCapacitac"),
		menus: document.querySelectorAll("header #menuCapacitac .menuOpcion"),
	};

	// Crea los elementos video
	const video = document.createElement("video");
	video.className = "aparece";
	video.preload = "none";
	video.controls = true;

	// Crea el botón de "cerrar"
	const cerrar = document.createElement("i");
	cerrar.className = "fa-solid fa-circle-xmark ocultar pointer scale";
	cerrar.id = "closeVideo";

	// Acciones si se elige un video
	for (let menu of DOM.menus) {
		menu.addEventListener("click", () => {
			// Si ya existía un video, lo elimina
			if (DOM.header.querySelector("video")) DOM.header.removeChild(video);

			// Acciones finales
			video.src = "/videos/" + menu.id + ".mp4"; // Actualiza el video a mostrar
			DOM.header.appendChild(video); // Agrega el video a la vista
			video.play(); // Ejecuta el video

			if (!DOM.header.querySelector("#closeVideo")) DOM.header.appendChild(cerrar); // Agrega el botón cerrar a la vista
		});
	}

	// Botón cerrar
	cerrar.addEventListener("click", () => {
		DOM.header.removeChild(video);
		DOM.header.removeChild(cerrar);
	});

	// Muestra / Oculta el botón de "cerrar"
	video.addEventListener("pause", () => cerrar.classList.remove("ocultar"));
	video.addEventListener("ended", () => cerrar.classList.remove("ocultar"));
	video.addEventListener("play", () => cerrar.classList.add("ocultar"));
});
