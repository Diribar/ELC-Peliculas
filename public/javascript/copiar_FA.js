window.addEventListener("load", () => {
	// Declarar las variables de Input
	let rubroAPI = document.querySelector('select[name="rubroAPI"]');
	let direccion = document.querySelector('input[name="direccion"]');
	let contenido = document.querySelector('textarea[name="contenido"]');

	// Declarar las variables de Error
	let iconoError = document.querySelectorAll(".fa-times-circle");
	let mensajeError = document.querySelectorAll(".mensajeError");

	// Comportamientos cuando se hace click
	window.onclick = (e) => {
		ayuda(e);
		//errorRubroApi(e)
	};

});

let ayuda = (e) => {
	const mensajeAyuda = document.querySelectorAll(".mensajeAyuda");
	e.target.matches("#ayuda_direccion")
	 	? mensajeAyuda[0].classList.toggle("ocultar")
	 	: mensajeAyuda[0].classList.add("ocultar");
	e.target.matches("#ayuda_contenido")
	 	? mensajeAyuda[1].classList.toggle("ocultar")
	 	: mensajeAyuda[1].classList.add("ocultar");
}