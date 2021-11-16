window.addEventListener("load", async () => {
	// Definir variables
	let resultado = document.querySelector("#resultadoGeneral");
	let form = document.querySelectorAll("#resultadoGeneral form");
	let anchoTotal = resultado.scrollWidth;
	let anchoVisible = resultado.offsetWidth;
	let anchoForm = form[0].clientWidth;
	let desplazamiento = parseInt(anchoVisible / anchoForm) * anchoForm;

	// Desplazamiento por teclado
	window.addEventListener("keydown", (e) => {
		//console.log(e.key);
		if (e.key == "Home") resultado.scrollTo(0, 0);
		if (e.key == "End") resultado.scrollTo(anchoTotal, 0);
		if (e.key == "PageDown")
			resultado.scrollTo(
				parseInt(resultado.scrollLeft / desplazamiento) *
					desplazamiento +
					desplazamiento,
				0
			);
		if (e.key == "PageUp")
			resultado.scrollTo(
				parseInt(resultado.scrollLeft / desplazamiento + 0.99) *
					desplazamiento -
					desplazamiento,
				0
			);
	});
});
