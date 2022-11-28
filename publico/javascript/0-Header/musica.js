"use strict";
window.addEventListener("load", () => {
	let iconoPlay = document.querySelector("header #icono_musica");
	let musica = document.querySelector("header audio");
	iconoPlay.addEventListener("click", () => {
		musica.paused ? musica.play() : musica.pause()
	})
})