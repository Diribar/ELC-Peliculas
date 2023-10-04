"use strict";
window.addEventListener("load", () => {
	// Variables
	const clicks = document.querySelectorAll(".desplClick");
	const mostrar = document.querySelectorAll(".desplMostrar");

	// Otras variables
	const busquedaRapida_mostrar = document.querySelector("header #busquedaRapida .desplMostrar");
	const busquedaRapida_input = document.querySelector("header #busquedaRapida .desplMostrar input");

	// Mensajes de ayuda
	window.addEventListener("click", (e) => {
		// Si el click es fuera del input deBúsqueda Rápida => toggle u oculta
		if (e.target != busquedaRapida_input)
			for (let i = 0; i < clicks.length; i++)
				if (e.target.parentElement != mostrar[i])
					e.target == clicks[i] && !clicks[i].classList.contains("inactivo")
						? mostrar[i].classList.toggle("ocultar")
						: mostrar[i].classList.add("ocultar");

		// Si el click fue 'mm_busquedaRapida'
		if (e.target.className.includes("mm_busquedaRapida")){
			busquedaRapida_mostrar.classList.remove("ocultar");
		}

		// Foco en búsqueda rápida
		if (!busquedaRapida_mostrar.classList.contains("ocultar")) busquedaRapida_input.focus();
	});
});
