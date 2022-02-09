window.addEventListener("load", () => {
	let categoria = document.querySelector("select[name='categoria_id']");
	let subcategoria = document.querySelector("select[name='subcategoria_id']");
	let subcategoriaOpciones = document.querySelectorAll("select[name='subcategoria_id'] option");
	let RCLVs = document.querySelectorAll(".RCLV");
	
	// Fórmulas ********************************************************************
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
		let ruta = "/producto/agregar/api/obtener-RCLV-subcategoria/?id=" + subcategoria.value;
		let registro = await fetch(ruta).then((n) => n.json());
		let campos = ["personaje", "hecho", "valor"];
		let nombres = ["personaje_historico_id","hecho_historico_id","valor_id"];
		for (i = 0; i < campos.length; i++) {
			// Mostrar el campo RCLV
			if (registro[campos[i]]) RCLVs[i].classList.remove("ocultar");
			else {
				// Ocultar el campo RCLV
				RCLVs[i].classList.add("ocultar");
				// Eliminar el valor del campo que se oculta
				document.querySelector("select[name='" + nombres[i] + "']").value = "";
			}
		}
	};

	// Status inicial **************************************************************
	categoria.value != "" ? funcionSubcat() : subcategoria.setAttribute("disabled", "disabled");
	if (subcategoria.value != "") funcionRCLV();

	// Rutinas on-line *********************************************************************
	// Detectar cambios en categorías
	categoria.addEventListener("change", async () => {
		subcategoria.value = "";
		funcionSubcat();
	});

	// Detectar cambios en subcategorías
	// La función de abajo se pasó a 4-DP-Errores, porque conviene que esté allí por la secuencia
	// subcategoria.addEventListener("change", () => {
	// 	funcionRCLV();
	// });
});
