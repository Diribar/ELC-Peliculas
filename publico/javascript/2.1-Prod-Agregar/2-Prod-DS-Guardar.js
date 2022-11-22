"use strict";
window.addEventListener("load", async () => {
	let funcion = async () => {
		console.log("2-Guardar");
		// Definir las variables
		let forms = document.querySelectorAll("#prodsNuevos form");
		let ruta,errores

		// Rutina para detectar si pertenece a una pelicula
		for (let i = 0; i < forms.length; i++) {
			forms[i].addEventListener("submit", async (e) => {
				// Frena el POST
				e.preventDefault();
				// Obtiene los datos
				let datos = {
					TMDB_entidad: e.target[0].value,
					TMDB_id: e.target[1].value,
					nombre_original: e.target[2].value,
					idioma_original_id: e.target[3].value,
				};

				// 1. Obtiene más información del producto
				ruta = "api/desambiguar-guardar1/?datos=" + JSON.stringify(datos);
				let infoTMDB = await fetch(ruta).then((n) => n.json());
				console.log(infoTMDB);

				// 2. Averigua si pertenece a una colección y toma acciones
				ruta = "api/desambiguar-guardar2/?datos=" + JSON.stringify(infoTMDB);
				errores = await fetch(ruta).then((n) => n.json());
				console.log(errores);
				if (errores.mensaje) {
					// 2.A. Si pertenece a una colección de la BD, la agrega y avisa
					if (errores.mensaje == "agregarCapitulos") {
						ruta = "api/desambiguar-guardar3/?datos=" + JSON.stringify(errores);
						let {coleccion, capitulo} = await fetch(ruta).then((n) => n.json());
						// Cartel con la novedad
						return console.log("agregarCapitulos");
					}
					// 2.B. Si pertenece a una colección que no existe en la BD, avisa
					else if (errores.mensaje == "agregarColeccion") {
						ruta = "api/desambiguar-guardar4/?datos=" + JSON.stringify(errores);
						let coleccion = await fetch(ruta).then((n) => n.json());
						// Cartel con la novedad
						return console.log("agregarColeccion");
					}
				}

				// 3. Descarga la imagen
				ruta = "api/desambiguar-guardar5/?datos=" + JSON.stringify(infoTMDB);
				errores = await fetch(ruta).then((n) => n.json());
				console.log(errores);

				// 4. Redirige al paso siguiente
				if (errores.hay) location.href="datos-duros"
				else location.href="datos-personalizados"

			});
		}
	};

	setTimeout(await funcion, 6000);
});
