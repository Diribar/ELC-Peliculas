window.addEventListener("load", () => {
	document
		.getElementById("rubro-contenedor")
		.addEventListener("click", () => desplegable("menu-rubro"));
	document
		.getElementById("usuario-contenedor")
		.addEventListener("click", () => desplegable("menu-usuario"));

	// Cerrar los dropdowns en desuso
	window.onclick = function (e) {
		!e.target.matches("#rubro-button")
			? document.getElementById("menu-rubro").classList.remove("mostrar")
			: "";
		!e.target.matches(".desplegableUsuario")
			? document.getElementById("menu-usuario").classList.remove("mostrar")
			: "";
	};
});

// Alternar la visibilidad de los Menús Desplegables
const desplegable = (n) => {
	document.getElementById(n).classList.toggle("mostrar");
}
