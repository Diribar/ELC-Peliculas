window.addEventListener("load", () => {
	window.addEventListener("mouseover", (e) => {
		desplegarMenus(e)
	});

	window.addEventListener("click", (e) => {
		desplegarMenus(e)
		if (!e.target.matches("#busquedaRapida *"))
			document.querySelector("#busquedaRapida #inputMasResultados").classList.add("ocultar");
	});
});

desplegarMenus = (e)=> {
	// Menú de Home
	e.target.matches("#home-icono") ||
	e.target.matches("#home-menu") ||
	e.target.matches("#home-menu *")
		? document.getElementById("home-menu").classList.remove("ocultar")
		: document.getElementById("home-menu").classList.add("ocultar");

	// Menú de Quick Search
	if (e.target.matches("#busquedaRapida .fa-search"))
		document.querySelector("#busquedaRapida #inputMasResultados").classList.remove("ocultar");

	// Menú de Producto
	e.target.matches("#prod-icono") ||
	e.target.matches("#prod-menu") ||
	e.target.matches("#prod-menu *")
		? document.getElementById("prod-menu").classList.remove("ocultar")
		: document.getElementById("prod-menu").classList.add("ocultar")

	// Menú de usuario
	e.target.matches("#usuario-icono *") ||
	e.target.matches("#usuario-menu") ||
	e.target.matches("#usuario-menu *")
		? document.getElementById("usuario-menu").classList.remove("ocultar")
		: document.getElementById("usuario-menu").classList.add("ocultar");
}