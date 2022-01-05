window.addEventListener("load", () => {
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
		? document.getElementById("home-menu").classList.toggle("ocultar")
		: document.getElementById("home-menu").classList.add("ocultar");

	// Menú de Quick Search
	if (e.target.matches("#busquedaRapida .fa-search"))
		document.querySelector("#busquedaRapida #inputMasResultados").classList.toggle("ocultar");

	// Menú de Producto
	e.target.matches("#prod-icono") ||
	e.target.matches("#producto-menu") ||
	e.target.matches("#producto-menu *")
		? document.getElementById("producto-menu").classList.toggle("ocultar")
		: document.getElementById("producto-menu").classList.add("ocultar")

	// Menú de usuario
	e.target.matches("#usuario-icono *") ||
	e.target.matches("#usuario-menu") ||
	e.target.matches("#usuario-menu *")
		? document.getElementById("usuario-menu").classList.toggle("ocultar")
		: document.getElementById("usuario-menu").classList.add("ocultar");
}