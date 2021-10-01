window.addEventListener("load", () => {
	menuPelis = window.location.href.includes("/peliculas/detalle/");
	window.onclick = (e) => {
		e.target.matches("#home-icono")
			? document.getElementById("home-menu").classList.toggle("ocultar")
			: document.getElementById("home-menu").classList.add("ocultar");
		menuPelis
			? e.target.matches("#pelis-icono")
				? document.getElementById("pelis-menu").classList.toggle("ocultar")
				: document.getElementById("pelis-menu").classList.add("ocultar")
			: "";
		e.target.matches(".usuario-iconos")
			? document.getElementById("usuario-menu").classList.toggle("ocultar")
			: document.getElementById("usuario-menu").classList.add("ocultar");
	};
});
