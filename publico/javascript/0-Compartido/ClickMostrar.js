"use strict";
window.addEventListener("load", () => {
	// Variables
	let clicks = document.querySelectorAll(".despl_click");
	let mostrar = document.querySelectorAll(".despl_mostrar");
	// Otras variables
	let busquedaRapida_mostrar = document.querySelector("header #busquedaRapida .despl_mostrar");
	let busquedaRapida_input = document.querySelector("header #busquedaRapida .despl_mostrar input");

	// Mensajes de ayuda
	window.addEventListener("click", (e) => {
		// Se fija que el click haya sido fuera del input deBúsqueda Rápida
		// En caso afirmativo => toggle u oculta
		// En caso negativo, no hace nada
		if (e.target != busquedaRapida_input)
			for (let i = 0; i < clicks.length; i++)
				if (e.target.parentElement != mostrar[i])
					e.target == clicks[i] && !clicks[i].classList.contains("inactivo")
						? mostrar[i].classList.toggle("ocultar")
						: mostrar[i].classList.add("ocultar");

		// Foco en búsqueda rápida
		if (!busquedaRapida_mostrar.classList.contains("ocultar")) busquedaRapida_input.focus();
	});
});
