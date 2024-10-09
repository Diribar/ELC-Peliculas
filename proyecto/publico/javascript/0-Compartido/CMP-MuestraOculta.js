"use strict";
window.addEventListener("load", () => {
	// DOM
	const DOM = {
		// Todos los lugares donde hacer click y qué mostrar
		clicks: document.querySelectorAll(".ayudaClick"),
		mostrar: document.querySelectorAll(".mostrarClick"),

		// Relacionado con búsqueda rápida
		brMostrar: document.querySelector("header #busquedaRapida .mostrarClick"),
		brInput: document.querySelector("header #busquedaRapida .mostrarClick input"),

		// Varios
		menuMobile: document.querySelector("header #menuMobile"),
	};

	// Mensajes de ayuda
	window.addEventListener("click", (e) => {
		// Si el click fue 'mmBR'
		if (typeof e.target.className == "string" && e.target.className.includes("mmSG")) return; // debe compararse con string, porque hay otros tipos que darían error

		// Si el click es fuera del input deBúsqueda Rápida => toggle u oculta
		if (![DOM.brInput].includes(e.target))
			for (let i = 0; i < DOM.clicks.length; i++)
				if (e.target.parentElement != DOM.mostrar[i])
					e.target == DOM.clicks[i] && !DOM.clicks[i].className.includes("inactivo")
						? DOM.mostrar[i].classList.toggle("ocultar")
						: DOM.mostrar[i].classList.add("ocultar");

		// Si el click fue 'menú Mobile búsqueda rápida', muestra el bloque donde escribirlo
		if (typeof e.target.className == "string" && e.target.className.includes("mmBR"))
			DOM.brMostrar.classList.remove("ocultar");

		// Foco en búsqueda rápida
		if (!DOM.brMostrar.className.includes("ocultar")) DOM.brInput.focus();
	});
});
