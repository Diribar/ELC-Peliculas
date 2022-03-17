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
		// Íconos únicos
		if (e.target != inputBusquedaRapida)
			for (let i = 0; i < iconos.length; i++) {
				e.target == iconos[i]
					? menus[i].classList.toggle("ocultar")
					: menus[i].classList.add("ocultar");
			}

		// Íconos múltiples
		e.target.matches("header #icono-usuario *")
			? menu_usuario.classList.toggle("ocultar")
			: menu_usuario.classList.add("ocultar");
	};
});
