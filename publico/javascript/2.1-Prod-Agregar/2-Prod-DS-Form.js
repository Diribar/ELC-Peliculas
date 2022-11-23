"use strict";
//import { hello } from '/javascript/2.1-Prod-Agregar/2-Prod-DS-Guardar.js';

window.addEventListener("load", async () => {
	// Variables
	let ruta = "/producto/agregar/api/desambiguar-form0";
	let resultado = await fetch(ruta).then((n) => (n ? n.json() : ""));

	// DOM - Opciones
	let listado = document.querySelector("#listado");
	let ingrManual_DOM = document.querySelector("#listado #ingrManual");
	let prodsNuevos_DOM = document.querySelector("#listado #prodsNuevos");
	let prodsYaEnBD_DOM = document.querySelector("#listado #prodsYaEnBD");

	// DOM - Cartel
	var fondo = document.querySelector("#tapar-el-fondo");
	var cartel = document.querySelector("#cartel");
	let cartelTitulo = document.querySelector("#cartel #titulo");
	let cartelUl = document.querySelector("#cartel ul");
	let cartelError = document.querySelector("#cartel #error");
	let cartelTrabajando = document.querySelector("#cartel #trabajando");
	let lis_fa_circle, lis_fa_check;

	// Cartel - configuración
	(() => {
		// Quita los dots del 'ul'
		cartelUl.style.listStyleType = "none";
		// Cambia el color de fondo
		cartel.classList.add("azul");
		// Cambia el ícono de encabezado
		cartelError.classList.add("ocultar");
		cartelTrabajando.classList.remove("ocultar");
	})();

	// Función de armado del cartel
	let armadoDelCartel = (titulo, contenido) => {
		// Titulo
		cartelTitulo.innerHTML = titulo;
		cartelUl.innerHTML = "";
		// Contenido
		for (let cont of contenido) {
			let i;
			// Crea el 'li'
			let li = document.createElement("li");
			// Crea el círculo y lo agrega
			i = document.createElement("i");
			i.classList.add("fa-regular", "fa-circle");
			li.appendChild(i);
			// Crea el check y lo agrega
			i = document.createElement("i");
			i.classList.add("fa-solid", "fa-circle-check", "ocultar");
			li.appendChild(i);
			// Agrega el texto
			li.innerHTML += cont;
			cartelUl.appendChild(li);
		}
		// DOM - íconos
		lis_fa_circle = document.querySelectorAll("#cartel li i.fa-circle");
		lis_fa_check = document.querySelectorAll("#cartel li i.fa-circle-check");
		// Hace visible el cartel
		fondo.classList.remove("ocultar");
		cartel.classList.remove("ocultar");
		cartel.classList.remove("disminuye");
		cartel.classList.add("aumenta");
	};

	// Acciones si no hay un resultado en 'session'
	if (!resultado) {
		// Obtiene las palabrasClave y si no existe, redirige
		let palabrasClave = document.querySelector("#palabrasClave").innerHTML;
		if (!palabrasClave) location.href = "palabras-clave";

		// Muestra el cartel
		let titulo = "En proceso...";
		let contenido = ["Buscando productos", "Tareas finales"];
		armadoDelCartel(titulo, contenido);

		// Busca los productos
		ruta = "/producto/agregar/api/desambiguar-form1/?palabrasClave=";
		await fetch(ruta + palabrasClave);
		lis_fa_circle[0].classList.add("ocultar");
		lis_fa_check[0].classList.remove("ocultar");

		// Pule la información
		ruta = "/producto/agregar/api/desambiguar-form2/";
		resultado = await fetch(ruta).then((n) => n.json());
	}
	// Agrega los productos
	let {prodsNuevos, prodsYaEnBD, mensaje} = resultado;

	// Productos nuevos
	if (prodsNuevos.length)
		prodsNuevos.forEach((prod) => {
			// Crea el elemento 'li'
			let li = prodsNuevos_DOM.cloneNode(true);
			// Información a enviar al BE
			li.children[0][0].value = prod.TMDB_entidad;
			li.children[0][1].value = prod.TMDB_id;
			li.children[0][2].value = prod.nombre_original;
			li.children[0][3].value = prod.idioma_original_id;
			// Imagen
			li.children[0][4].children[0].src = "https://image.tmdb.org/t/p/original" + prod.avatar;
			li.children[0][4].children[0].alt = prod.nombre_original;
			li.children[0][4].children[0].title = prod.nombre_original;
			// Información a mostrar
			li.children[0][4].children[1].children[0].children[0].innerHTML = prod.nombre_original;
			li.children[0][4].children[1].children[1].children[0].innerHTML = prod.nombre_castellano;
			li.children[0][4].children[1].children[3].innerHTML = prod.ano_estreno + " - " + prod.prodNombre;
			// Quitar la clase 'ocultar'
			li.classList.remove("ocultar");
			// Agrega el form
			listado.insertBefore(li, ingrManual_DOM);
			// Elimina el form modelo, que ya no se necesita
			prodsNuevos_DOM.remove();
		});

	// Productos ya en BD
	if (prodsYaEnBD.length)
		prodsYaEnBD.forEach((prod) => {
			// Crea el elemento 'li'
			let li = prodsYaEnBD_DOM.cloneNode(true);
			// Información a enviar al BE
			li.children[0].href += prod.entidad + "&id=" + prod.yaEnBD_id;

			// Imagen
			li.children[0].children[0].children[0].src = "https://image.tmdb.org/t/p/original" + prod.avatar;
			li.children[0].children[0].children[0].alt = prod.nombre_original;
			li.children[0].children[0].children[0].title = prod.nombre_original;
			// Información a mostrar
			li.children[0].children[0].children[1].children[0].children[0].innerHTML = prod.nombre_original;
			li.children[0].children[0].children[1].children[1].children[0].innerHTML = prod.nombre_castellano;
			li.children[0].children[0].children[1].children[3].innerHTML =
				prod.ano_estreno + " - " + prod.prodNombre;
			// Quitar la clase 'ocultar'
			li.classList.remove("ocultar");

			// Agrega el form
			listado.append(li);
			// Elimina el form modelo, que ya no se necesita
			prodsYaEnBD_DOM.remove();
		});

	// Terminaciones
	// Agrega el mensaje
	document.querySelector("#mensaje").innerHTML = mensaje;

	// Hace foco en el primer resultado
	document.querySelector("#listado li button").focus();

	// Desaparece el cartel
	if (lis_fa_circle) {
		// Actualiza los íconos
		lis_fa_circle[1].classList.add("ocultar");
		lis_fa_check[1].classList.remove("ocultar");

		// Oculta el cartel
		fondo.classList.add("ocultar");
		cartel.classList.remove("aumenta");
		cartel.classList.add("disminuye");
	}

	// Comienzo de Back-end
	// Acciones apartir del click en una opción
	let forms = document.querySelectorAll("#prodsNuevos form");
	let errores, yaEligio;
	forms.forEach((form) => {
		form.addEventListener("submit", async (e) => {
			// Frena el POST
			e.preventDefault();
			// Pasa/no pasa
			if (yaEligio) return;
			else yaEligio = true;
			// Obtiene los datos
			let datos = {
				TMDB_entidad: e.target[0].value,
				TMDB_id: e.target[1].value,
				nombre_original: e.target[2].value,
				idioma_original_id: e.target[3].value,
			};
			let movie = datos.TMDB_entidad == "movie" ? 1 : 0;
			// 0. Muestra el cartel
			let titulo = "Estamos procesando la información...";
			let contenido = [
				"Obteniendo más información del producto",
				"Descargando la imagen",
				"Revisando la información disponible",
			];
			// Si es una película, agrega un paso más
			if (movie) contenido.splice(1, 0, "Averiguando si pertenece a una colección");
			// Armado del cartel
			armadoDelCartel(titulo, contenido);

			// 1. Obtiene más información del producto
			ruta = "api/desambiguar-guardar1/?datos=" + JSON.stringify(datos);
			datos = await fetch(ruta).then((n) => n.json());
			lis_fa_circle[0].classList.add("ocultar");
			lis_fa_check[0].classList.remove("ocultar");

			// 2. Averigua si pertenece a una colección y toma acciones
			if (movie) {
				ruta = "api/desambiguar-guardar2/?datos=" + JSON.stringify(datos);
				errores = await fetch(ruta).then((n) => n.json());
				lis_fa_circle[1].classList.add("ocultar");
				lis_fa_check[1].classList.remove("ocultar");
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
			}

			// 3. Descarga la imagen
			ruta = "api/desambiguar-guardar5/?datos=" + JSON.stringify(datos);
			datos = await fetch(ruta).then((n) => n.json());
			lis_fa_circle[1 + movie].classList.add("ocultar");
			lis_fa_check[1 + movie].classList.remove("ocultar");

			// 4. Revisa la información disponible, para determinar los próximos pasos
			ruta = "api/desambiguar-guardar6/?datos=" + JSON.stringify(datos);
			errores = await fetch(ruta).then((n) => n.json());
			lis_fa_circle[2 + movie].classList.add("ocultar");
			lis_fa_check[2 + movie].classList.remove("ocultar");

			// Desaparece el cartel
			fondo.classList.add("ocultar");
			cartel.classList.remove("aumenta");
			cartel.classList.add("disminuye");

			// Fin
			if (errores.hay) location.href = "datos-duros";
			else location.href = "datos-personalizados";
		});
	});
});
