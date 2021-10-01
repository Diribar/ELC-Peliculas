window.addEventListener("load", () => {
	// Menú HOME
	document
		.getElementById("home-icono")
		.addEventListener("click", () => desplegable("home-menu"));

	// Menú PRODUCTOS
	menuPelis = window.location.href.includes("/peliculas/detalle/");
	if (menuPelis) {
		document
			.getElementById("pelis-icono")
			.addEventListener("click", () => desplegable("pelis-menu"));
	}

	// Menú USUARIO
	let iconosUsuario = document.getElementsByClassName("usuario-iconos");
	for (iconoUsuario of iconosUsuario) {
		iconoUsuario.addEventListener("click", () => {
			desplegable("usuario-menu");
		});
	}

	// Cerrar los dropdowns en desuso
	window.onclick = (e) => {
		!e.target.matches("#home-icono")
			? document.getElementById("home-menu").classList.add("ocultar")
			: "";
		!e.target.matches(".usuario-iconos")
			? document.getElementById("usuario-menu").classList.add("ocultar")
			: "";
		menuPelis && !e.target.matches("#pelis-icono")
			? document.getElementById("pelis-menu").classList.add("ocultar")
			: "";
	};
});

// Alternar la visibilidad de los Menús Desplegables
const desplegable = (n) => {
	document.getElementById(n).classList.toggle("ocultar");
};
