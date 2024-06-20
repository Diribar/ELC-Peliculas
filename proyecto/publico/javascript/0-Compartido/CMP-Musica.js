"use strict";
window.addEventListener("load", () => {
	let iconoPlay = document.querySelector("header #icono_musica");
	let musica = document.querySelector("header audio");
	iconoPlay.addEventListener("click", () => {
		musica.paused ? musica.play() : musica.pause()
	})
})

// <!-- Música de fondo -->
// <div class="grupos">
// 	<i id="icono_musica" class="fa-solid fa-music scale iconoHeader"></i>
// 	<audio src="/publico/audio/Música-de-fondo.mp3"></audio>
// </div>
