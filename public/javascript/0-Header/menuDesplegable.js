window.addEventListener("load", () => {
	window.addEventListener("mouseover", (e) => {
		e.target.matches("#home-icono") ||
		e.target.matches("#home-menu") ||
		e.target.matches("#home-menu *")
			? document.getElementById("home-menu").classList.remove("ocultar")
			: document.getElementById("home-menu").classList.add("ocultar");
		window.location.href.includes("/peliculas/detalle/")
			? e.target.matches("#pelis-icono")
				? document.getElementById("pelis-menu").classList.toggle("ocultar")
				: document.getElementById("pelis-menu").classList.add("ocultar")
			: "";
		e.target.matches("#usuario-icono *") ||
		e.target.matches("#usuario-menu") ||
		e.target.matches("#usuario-menu *")
			? document.getElementById("usuario-menu").classList.remove("ocultar")
			: document.getElementById("usuario-menu").classList.add("ocultar");
	});
});
