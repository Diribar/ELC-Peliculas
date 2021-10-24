window.addEventListener("load", () => {
	let categoria = document.querySelector(
		"form #cuerpo select[name='categoria_id']"
	);
	let subcategorias = document.querySelector(
		"form #cuerpo select[name='subcategoria_id']"
	);
	let subcategoriasOption = document.querySelectorAll(
		"form #cuerpo select[name='subcategoria_id'] option"
	);

	// Aplicar cambios en la subcategoría
	funcionSubcat = () => {
		for (option of subcategoriasOption) {
			option.className.includes(categoria.value)
				? option.classList.remove("ocultar")
				: option.classList.add("ocultar");
		}
		subcategorias.classList.remove("ocultar");
	};

	// Detectar cambios en categorías
	categoria.value != "" ? funcionSubcat() : "";
	categoria.addEventListener("change", () => {
		funcionSubcat();
	});
});
