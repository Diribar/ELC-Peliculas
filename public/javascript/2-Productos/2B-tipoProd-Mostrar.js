window.addEventListener("load", async () => {
	// Variables de sectores
	let sectEnColeccion = document.querySelector("#dataEntry #en_coleccion");
	let sectColeccion_id = document.querySelector("#dataEntry #coleccion_id");
	let sectResto = document.querySelector("#dataEntry #resto");
	// Variables de inputs
	let form = document.querySelector("#dataEntry form");
	let entidad = document.querySelector("select[name='entidad']");
	let enColeccion = document.querySelector("select[name='en_coleccion']");
	let coleccion_id = document.querySelector("select[name='coleccion_id']");

	form.addEventListener("change", () => {
		// Entidad = ""
		if (!entidad.value) {
			sectEnColeccion.classList.add("ocultar");
			sectColeccion_id.classList.add("ocultar");
			sectResto.classList.add("ocultar");
		} else if (entidad.value == "peliculas") {
			// Entidad = "peliculas"
			enColeccion.removeAttribute("disabled")
			sectEnColeccion.style.opacity="100%";
			sectEnColeccion.classList.remove("ocultar");
			// enColeccion = ""
			if (!enColeccion.value) {
				sectColeccion_id.classList.add("ocultar");
				sectResto.classList.add("ocultar");
			} else sectColeccion_id.classList.remove("ocultar");
			if (enColeccion.value == "0") {
				// enColeccion = "NO"
				sectColeccion_id.style.opacity="30%";
				coleccion_id.value=""
				coleccion_id.setAttribute("disabled", "disabled");
				sectResto.classList.remove("ocultar");
			} else if (enColeccion.value == "1") {
				// enColeccion = "SI"
				sectColeccion_id.style.opacity="100%";
				coleccion_id.removeAttribute("disabled")
				sectResto.classList.add("ocultar");
				// coleccion_id != ""
				if (coleccion_id.value != "") sectResto.classList.remove("ocultar");
			}
		} else if (entidad.value == "colecciones") {
			// Entidad = "colecciones"
			enColeccion.value=""
			enColeccion.setAttribute("disabled", "disabled");
			sectEnColeccion.style.opacity="30%";
			sectEnColeccion.classList.remove("ocultar");
			coleccion_id.value=""
			coleccion_id.setAttribute("disabled", "disabled");
			sectColeccion_id.style.opacity="30%";
			sectColeccion_id.classList.remove("ocultar");
			sectResto.classList.remove("ocultar");
		}
	});
});
