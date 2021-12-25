window.addEventListener("load", () => {
	let categoria = document.querySelector("form select[name='categoria_id']");
	let subcategorias = document.querySelector("select[name='subcategoria_id']");
	let subcategoriasOption = document.querySelectorAll("select[name='subcategoria_id'] option");

	// Aplicar cambios en la subcategoría
	funcionSubcat = () => {
		for (option of subcategoriasOption) {
			option.className.includes(categoria.value)
				? option.classList.remove("ocultar")
				: option.classList.add("ocultar");
		}
		subcategorias.removeAttribute("disabled");
	};

	// Detectar cambios en categorías
	categoria.value != "" ? funcionSubcat() : subcategorias.setAttribute("disabled", "disabled")
	categoria.addEventListener("change", () => {
		subcategorias.value=""
		funcionSubcat();
	});
});
