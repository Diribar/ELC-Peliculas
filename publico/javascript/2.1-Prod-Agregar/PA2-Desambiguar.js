"use strict";
//import { hello } from '/javascript/2.1-Prod-Agregar/2-Prod-DS-Guardar.js';

window.addEventListener("load", async () => {
	// Variables
	let ruta = "api/desambiguar-form0";
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
	let cartelAlerta = document.querySelector("#cartel #alerta");
	let cartelTrabajando = document.querySelector("#cartel #trabajando");
	let lis_fa_circle;

	// Cartel - configuración
	(() => {
		// Quita los dots del 'ul'
		cartelUl.style.listStyleType = "none";
		// Cambia el color de fondo
		cartel.classList.add("trabajando");
		// Cambia el ícono de encabezado
		cartelAlerta.classList.add("ocultar");
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
			// Agrega el texto
			li.innerHTML += cont;
			cartelUl.appendChild(li);
		}
		// DOM - íconos
		lis_fa_circle = document.querySelectorAll("#cartel li i.fa-circle");
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
		let contenido = [
			"Buscando productos",
			"Reemplazando películas por su colección",
			"Completando la información",
		];
		armadoDelCartel(titulo, contenido);

		// Busca los productos
		lis_fa_circle[0].classList.replace("fa-regular", "fa-solid");
		ruta = "api/desambiguar-form1/?palabrasClave=";
		await fetch(ruta + palabrasClave);
		lis_fa_circle[0].classList.replace("fa-circle", "fa-circle-check");

		// Reemplaza las películas por su colección
		lis_fa_circle[1].classList.replace("fa-regular", "fa-solid");
		ruta = "api/desambiguar-form2/";
		await fetch(ruta);
		lis_fa_circle[1].classList.replace("fa-circle", "fa-circle-check");

		// Pule la información
		lis_fa_circle[2].classList.replace("fa-regular", "fa-solid");
		ruta = "api/desambiguar-form3/";
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
			li.children[0][4].children[0].src = prod.avatar
				? "https://image.tmdb.org/t/p/original" + prod.avatar
				: "/imagenes/0-Base/Avatar/Prod-Sin-Avatar.jpg";
			li.children[0][4].children[0].alt = prod.nombre_original;
			li.children[0][4].children[0].title = prod.nombre_original;
			// Información a mostrar
			li.children[0][4].children[1].children[0].children[0].innerHTML = prod.nombre_original;
			li.children[0][4].children[1].children[1].children[0].innerHTML = prod.nombre_castellano;
			// Completa los años
			if (prod.entidad == "colecciones") {
				li.children[0][4].children[1].children[3].innerHTML = prod.prodNombre;
				let br = document.createElement("br");
				li.children[0][4].children[1].children[3].append(br);
				let ano =
					prod.ano_fin > prod.ano_estreno
						? "(" + prod.ano_fin + "-" + prod.ano_estreno + ")"
						: "(" + prod.ano_estreno + ")";
				li.children[0][4].children[1].children[3].innerHTML += ano;
				li.children[0][4].children[1].children[4].innerHTML = "Capítulos: " + prod.capitulos;
			} else {
				let ano = " (" + prod.ano_estreno + ")";
				li.children[0][4].children[1].children[3].innerHTML = prod.prodNombre + ano;
			}

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
			let avatar = prod.avatar.startsWith("http")
				? prod.avatar
				: "/imagenes/2-Avatar-Prods-Final/" + prod.avatar;
			li.children[0].children[0].children[0].src = avatar;
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
		lis_fa_circle[2].classList.replace("fa-circle", "fa-circle-check");

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
			// Muestra el cartel
			let titulo = "Estamos procesando la información...";
			let contenido = [
				"Obteniendo más información del producto",
				"Revisando la información disponible",
			];
			armadoDelCartel(titulo, contenido);

			// 1. Obtiene más información del producto
			lis_fa_circle[0].classList.replace("fa-regular", "fa-solid");
			ruta = "api/desambiguar-guardar1/?datos=" + JSON.stringify(datos);
			await fetch(ruta); // El 'await' es para esperar a que se grabe la cookie en la controladora
			lis_fa_circle[0].classList.replace("fa-circle", "fa-circle-check");

			// 2. Revisa la información disponible, para determinar los próximos pasos
			lis_fa_circle[1].classList.replace("fa-regular", "fa-solid");
			ruta = "api/desambiguar-guardar2"
			errores = await fetch(ruta).then((n) => n.json());
			lis_fa_circle[1].classList.replace("fa-circle", "fa-circle-check");

			// Desaparece el cartel
			fondo.classList.add("ocultar");
			cartel.classList.remove("aumenta");
			cartel.classList.add("disminuye");

			// Fin
			if (errores.hay) location.href = "datos-duros";
			else location.href = "datos-personalizados";
		});
	});

	// Desplazamiento original
	desplazamHoriz();
});
