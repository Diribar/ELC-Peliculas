// window.addEventListener("load", async () => {
// 	// Definir las variables
// 	let forms = document.querySelectorAll("#resultadoDesamb form");
// 	let ruta = "/producto/agregar/api/averiguar-coleccion/?TMDB_id=";

// 	// Rutina para detectar si pertenece a una pelicula
// 	for (let i = 0; i < forms.length; i++) {
// 		forms[i].addEventListener("submit", async (e) => {
// 			if (forms[i].children[0].value == "movie") {
// 				e.preventDefault();

// 				// Averiguar si la película pertenece a una colección
// 				tmdb_id = forms[i].children[1].value;
// 				datos = await fetch(ruta + tmdb_id).then((n) => n.json());
// 				// Si pertenece a una colección,
// 				if (Object.keys(datos).length) {
// 					// Si la colección ya estaba en la BD y faltaba actualizarla, continuar con el submit
// 					if (datos.colec_id) {
// 						e.currentTarget.submit();
// 						return;
// 					}
// 					// Cambiar los valores del form por los de la colección

// 					// Avisar del error en el form
// 					// Interrumpir la rutina
// 				}
// 				// Si no pertenece, continuar con el submit
// 			}
// 		});
// 	}
// });
