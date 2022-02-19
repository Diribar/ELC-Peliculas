window.addEventListener("load", () => {
	// Variables
	const entidades = document.querySelectorAll("[data-entidad]");
	//console.log(entidades);
	const contenidos = document.querySelectorAll("[data-contenido]");

	for (entidad of entidades) {
		entidad.addEventListener("click", (e) => {
			contenidos.forEach((contenido) => {
				contenido.classList.add("ocultar");
			});
			console.log(e.target.dataset.entidad);
			const listado = document.querySelector(e.target.dataset.entidad);
			listado.classList.remove("ocultar");
		});
	}
});
