window.addEventListener("load", () => {
	window.addEventListener("click", e => {
		e.target.matches("#home-icono")
			? document.getElementById("home-menu").classList.toggle("ocultar")
			: document.getElementById("home-menu").classList.add("ocultar");
		window.location.href.includes("/peliculas/detalle/")
			? e.target.matches("#pelis-icono")
				? document
						.getElementById("pelis-menu")
						.classList.toggle("ocultar")
				: document.getElementById("pelis-menu").classList.add("ocultar")
			: "";
		e.target.matches(".usuario-iconos")
			? document
					.getElementById("usuario-menu")
					.classList.toggle("ocultar")
			: document.getElementById("usuario-menu").classList.add("ocultar");

	})
});
