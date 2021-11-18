window.addEventListener("load", async () => {
	// Definir variables
	let texto = document.querySelectorAll("#dataEntry #texto");

	// Sólo considerar los casos en los que hay productos nuevos
	if (texto.length) {
		// Detectar cuál es el caso con problemas
		for (i = 0; i < texto.length; i++) {
			if (texto[i].children.length > 1) {
				// Campos cuyos valores cambiar
				entidad_TMDB = document.querySelectorAll("input[name='entidad_TMDB']")[i]
				TMDB_id = document.querySelectorAll("input[name='TMDB_id']")[i]
				nombre_original = document.querySelectorAll("input[name='nombre_original']")[i]
				// Nuevos valores
				colec_TMDB_id = document.querySelector("#mensaje #colec_TMDB_id").innerHTML
				colec_nombre = document.querySelector("#mensaje #colec_nombre").innerHTML
				// Hacer los reemplazos
				entidad_TMDB.setAttribute('value', "collection")
				TMDB_id.setAttribute('value', colec_TMDB_id)
				nombre_original.setAttribute('value', colec_nombre)
			}
		}
	}

	//console.log(texto[1].children.length)
});
