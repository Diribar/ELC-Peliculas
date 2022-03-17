window.addEventListener("load", () => {
	// Definir variables
	let iconos = document.querySelectorAll("header .iconoMenu");
	let menus = document.querySelectorAll("header .menuOpciones");
	let menu_usuario = document.querySelector("header #menu-usuario");
	// Otras variables
	let seccionBusquedaRapida = document.querySelector("#busquedaRapida .menuOpciones");
	let inputBusquedaRapida = document.querySelector("#busquedaRapida .menuOpciones input");

	// Add Event Listeners
	window.addEventListener("click", (e) => {
		// Visibilidad de menús
		toggleMenus(e);
		// Foco en búsqueda rápida
		if (!seccionBusquedaRapida.classList.contains("ocultar")) inputBusquedaRapida.focus();
	});

	// Funciones --------------------------------------------------------------------
	toggleMenus = (e) => {
		if (e.target != inputBusquedaRapida)
			for (let i = 0; i < menus.length; i++) {
				e.target == iconos[i]
					? menus[i].classList.toggle("ocultar")
					: menus[i].classList.add("ocultar");
			}
	};
});
