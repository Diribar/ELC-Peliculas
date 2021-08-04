window.addEventListener("load", () => {
	menuPelis = (window.location.href.includes("/peliculas/detalle/"))

	document
		.getElementById("home-button")
		.addEventListener("click", () => desplegable("menu-home"));
	document
		.getElementById("usuario-button")
		.addEventListener("click", () => desplegable("menu-usuario"));
	if (menuPelis) {
		document
			.getElementById("pelis-button")
			.addEventListener("click", () => desplegable("menu-pelis"))
	}

	// Cerrar los dropdowns en desuso
	window.onclick = function (e) {
		!e.target.matches("#home-button")
			? document.getElementById("menu-home").classList.add("ocultar")
			: "";
		!e.target.matches(".desplegableUsuario")
			? document.getElementById("menu-usuario").classList.add("ocultar")
			: "";
		if (menuPelis) {
			!e.target.matches("#pelis-button")
				? document.getElementById("menu-pelis").classList.add("ocultar")
				: "";
		}
	};
});

// Alternar la visibilidad de los Menús Desplegables
const desplegable = (n) => {
	document.getElementById(n).classList.toggle("ocultar");
}
