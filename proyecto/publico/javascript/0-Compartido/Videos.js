"use strict";
window.addEventListener("load", () => {
	// Variables
	const clasesHabituales = " ocultar pointer scale absoluteCentro";
	let DOM = {
		// Menús
		menus: document.querySelectorAll("#menuCapacitac .menuOpcion"),

		// Tapa el fondo
		todoElMain: document.querySelector("main #todoElMain"),
		tapaElFondo: document.querySelector("main #todoElMain #tapaElFondo"),
	};

	// Crea los elementos video
	const video = document.createElement("video");
	video.id = "videoCapacitac";
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
			if (DOM.todoElMain.querySelector("video")) DOM.todoElMain.removeChild(video);

			// Acciones finales
			DOM.tapaElFondo.classList.remove("ocultar");
			video.src = "/publico/videos/" + menu.id + ".mp4"; // Actualiza el video a mostrar
			DOM.todoElMain.appendChild(video); // Agrega el video a la vista
			DOM.todoElMain.classList.remove("ocultar");
			video.play(); // Ejecuta el video

			// Agrega el ícono de cerrar el video a la vista
			if (!DOM.todoElMain.querySelector("#cierraVideo")) DOM.todoElMain.appendChild(cierraVideo);

			// Actualiza el campo 'videoConsVisto' del usuario con el valor 'true'
			if (menu.id == "consultas") fetch("/usuarios/api/video-de-consultas-visto");
		});
	}

	// Botón cierraVideo
	cierraVideo.addEventListener("click", () => {
		DOM.todoElMain.removeChild(video);
		DOM.todoElMain.removeChild(cierraVideo);
		DOM.tapaElFondo.classList.add("ocultar");
		DOM.todoElMain.classList.add("ocultar");
	});

	// Avanza / Pausa el video
	video.addEventListener("click", () => (video.paused ? video.play() : video.pause()));

	// Muestra / Oculta el botón de "cierraVideo"
	video.addEventListener("pause", () => cierraVideo.classList.remove("ocultar"));
	video.addEventListener("ended", () => cierraVideo.classList.remove("ocultar"));
	video.addEventListener("play", () => cierraVideo.classList.add("ocultar"));
});
