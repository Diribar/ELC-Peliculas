"use strict";
window.addEventListener("load", () => {
	iconoPlay = document.querySelector("header #icono-musica");
	musica = document.querySelector("header audio");
	iconoPlay.addEventListener("click", () => {
		musica.paused ? musica.play() : musica.pause()
	})
})