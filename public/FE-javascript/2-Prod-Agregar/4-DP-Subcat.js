window.addEventListener("load", () => {
	let categoria = document.querySelector("select[name='categoria_id']");
	let subcategoria = document.querySelector("select[name='subcategoria_id']");
	let subcategoriaOpciones = document.querySelectorAll("select[name='subcategoria_id'] option");
	let RCLVs = document.querySelectorAll(".RCLV");

	// Aplicar cambios en la subcategoría
	funcionSubcat = () => {
		for (opcion of subcategoriaOpciones) {
			opcion.className.includes(categoria.value)
				? opcion.classList.remove("ocultar")
				: opcion.classList.add("ocultar");
		}
		if (!subcategoria.value) subcategoria.removeAttribute("disabled");
	};

	// Aplicar cambios en RCLV
	funcionRCLV = async () => {
		if (!subcategoria.value) return;
		// Averiguar qué RCLV corresponde
		let {personaje, hecho, valor} = await fetch(
			"/producto/agregar/api/obtener-RCLV-subcategoria/?id=" + subcategoria.value
		).then((n) => n.json());
		// Procesar personaje
		if (personaje) {
			RCLVs[0].classList.remove("ocultar");
		} else {
			RCLVs[0].classList.add("ocultar");
			document.querySelector("select[name='personaje_historico_id']").value = "";
		}
		// Procesar hechos
		if (hecho) {
			RCLVs[1].classList.remove("ocultar");
		} else {
			RCLVs[1].classList.add("ocultar");
			document.querySelector("select[name='hecho_historico_id']").value = "";
		}
		// Procesar valor
		if (valor) {
			RCLVs[2].classList.remove("ocultar");
		} else {
			RCLVs[2].classList.add("ocultar");
			document.querySelector("select[name='valor_id']").value = "";
		}
	};

	// Detectar cambios en categorías
	categoria.value != "" ? funcionSubcat() : subcategoria.setAttribute("disabled", "disabled");
	categoria.addEventListener("change", async () => {
		subcategoria.value = "";
		funcionSubcat();
	});

	// Detectar cambios en subcategorías
	if (subcategoria.value != "") funcionRCLV();
	subcategoria.addEventListener("change", () => {
		funcionRCLV();
	});
});
