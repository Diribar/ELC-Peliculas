window.addEventListener("load", () => {
	// Definir variables
	let contador = document.querySelector("#contador");
	let tiempo = 60;

	// Timer
	let timer = setInterval(() => {
		tiempo--;
		contador.innerHTML = tiempo + " min.";
		switch (tiempo) {
			case 30:
				contador.style.backgroundColor = "var(--amarillo-oscuro)";
				contador.style.borderColor = "var(--naranja-oscuro)";
				contador.style.color = "var(--azul-oscuro)";
				break;
			case 15:
				// Rojo y Gris Claro
				contador.style.backgroundColor = "var(--rojo-oscuro)";
				contador.style.borderColor = "var(--rojo-oscuro)";
				contador.style.color = "var(--gris-claro)";
				break;
			case 0:
				clearInterval(timer);
				// Cartel de "no more time left"
				break;
		}
	}, 1000*60);
});
