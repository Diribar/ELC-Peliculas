window.addEventListener("load", () => {
	iconoPlay = document.querySelector("#musicaDeFondo i");
	musica = document.querySelector("#musicaDeFondo audio");
	iconoPlay.addEventListener("click", () => {
		musica.paused ? musica.play() : musica.pause()
	})
})