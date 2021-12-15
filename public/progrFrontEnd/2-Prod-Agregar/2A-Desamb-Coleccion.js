window.addEventListener("load", async () => {
	// Definir las variables
	let forms = document.querySelectorAll("#resultadoDesamb form");
	let colecciones = document.querySelectorAll("#resultadoDesamb form #coleccion");
	let colec_nombre = document.querySelectorAll("#resultadoDesamb form #coleccion #colec_nombre");
	let mensaje = document.querySelectorAll("#resultadoDesamb form .fa-times-circle");
	let ruta = "/producto/agregar/api/averiguar-coleccion/?TMDB_id=";

	// Rutina para detectar si pertenece a una pelicula
	for (let i = 0; i < forms.length; i++) {
		forms[i].addEventListener("submit", async (e) => {
			e.preventDefault();
			destino = e.currentTarget;

			// Descartar las entidades que no sean películas
			if (forms[i].children[0].value != "movie") {
				destino.submit()
				return
			}

			// Obtener los datos necesarios para saber si la película pertenece a una colección
			tmdb_id = forms[i].children[1].value;
			datos = await fetch(ruta + tmdb_id).then((n) => n.json());

			// Descartar las que no pertenecen a una colección, y las que pertenecen a una colección que ya está en BD
			if (!Object.keys(datos).length || datos.colec_id) {
				destino.submit()
				return
			};

			// ****************************************************************************************
			// Sólo quedan para trabajar las películas que pertenecen a una colección que no está en BD

			// Cambiar los valores del form por los de la colección
			forms[i].children[0].value = "collection";
			forms[i].children[1].value = datos.colec_TMDB_id;

			// Avisar la situación en el form
			mensaje[i].classList.remove("ocultar");
			colec_nombre[i].innerHTML = datos.colec_nombre;
			colecciones[i].classList.remove("ocultar");
		});
	}
});
