window.addEventListener("load", () => {
	iconoPlay = document.querySelector("header #musica-icono");
	musica = document.querySelector("header audio");
	iconoPlay.addEventListener("click", () => {
		musica.paused ? musica.play() : musica.pause()
	})
})