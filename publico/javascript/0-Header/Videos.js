"use strict";
window.addEventListener("load", () => {
	// Variables
	let DOM = {
		header: document.querySelector("header"),
		menuCapacitac: document.querySelector("header #menuCapacitac"),
		menus: document.querySelectorAll("header #menuCapacitac .menuOpcion"),
		tapaElFondo: document.querySelector("#tapaElFondo"),
	};
	const clasesHabituales = " ocultar pointer scale absoluteCentro";

	// Crea los elementos video
	const video = document.createElement("video");
	video.className = "aparece absoluteCentro";
	video.preload = "none";
	// video.controls = true;

	// Crea el botón de "cierraVideo"
	const cierraVideo = document.createElement("i");
	cierraVideo.className = "fa-solid fa-circle-xmark" + clasesHabituales;
	cierraVideo.id = "cierraVideo";

	// Acciones si se elige un video
	for (let menu of DOM.menus) {
		menu.addEventListener("click", () => {
			// Si ya existía un video, lo elimina
			if (DOM.header.querySelector("video")) DOM.header.removeChild(video);

			// Acciones finales
			DOM.tapaElFondo.classList.remove("ocultar")
			video.src = "/videos/" + menu.id + ".mp4"; // Actualiza el video a mostrar
			DOM.header.appendChild(video); // Agrega el video a la vista
			video.play(); // Ejecuta el video

			// Agrega íconos a la vista
			if (!DOM.header.querySelector("#cierraVideo")) DOM.header.appendChild(cierraVideo); // Cerrar el video
		});
	}

	// Botón cierraVideo
	cierraVideo.addEventListener("click", () => {
		DOM.header.removeChild(video);
		DOM.header.removeChild(cierraVideo);
		DOM.tapaElFondo.classList.add("ocultar")
	});

	// Avanza / Pausa el video
	video.addEventListener("click", () => (video.paused ? video.play() : video.pause()));

	// Muestra / Oculta el botón de "cierraVideo"
	video.addEventListener("pause", () => cierraVideo.classList.remove("ocultar"));
	video.addEventListener("ended", () => cierraVideo.classList.remove("ocultar"));
	video.addEventListener("play", () => cierraVideo.classList.add("ocultar"));
});
