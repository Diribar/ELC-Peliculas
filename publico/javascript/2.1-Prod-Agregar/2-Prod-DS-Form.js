"use strict";
window.addEventListener("load", async () => {
	// Variables
	let lis_fa_circle, lis_fa_check;
	let ruta = "/producto/agregar/api/desambiguar-form0";
	let resultado = await fetch(ruta).then((n) => (n ? n.json() : ""));
	// DOM
	let ingrManual_DOM = document.querySelector("#ingrManual");
	let prodsNuevos_DOM = document.querySelector("#prodsNuevos").cloneNode(true);
	let prodsYaEnBD_DOM = document.querySelector("#prodsYaEnBD").cloneNode(true);

	// En caso que no haya un resultado...
	if (!resultado) {
		// Obtiene las palabrasClave
		let palabrasClave = document.querySelector("#palabrasClave").innerHTML;
		if (!palabrasClave) location.href = "/producto/agregar/palabras-clave";

		// Cartel - DOM
		var fondo = document.querySelector("#tapar-el-fondo");
		var cartel = document.querySelector("#cartel");
		let cartelError = document.querySelector("#cartel #error");
		let cartelTrabajando = document.querySelector("#cartel #trabajando");
		let cartelTitulo = document.querySelector("#cartel #titulo");
		let cartelUl = document.querySelector("#cartel ul");

		// Cartel - configuración inicial
		(() => {
			// Quita los dots del 'ul'
			cartelUl.style.listStyleType = "none";
			// Cambia el color de fondo
			cartel.classList.add("azul");
			// Cambia el ícono de encabezado
			cartelError.classList.add("ocultar");
			cartelTrabajando.classList.remove("ocultar");
		})();

		// Cartel - lo muestra
		(() => {
			// Función de armado del cartel
			let armadoDelCartel = (titulo, contenido) => {
				// Titulo
				cartelTitulo.innerHTML = titulo;
				// Contenido
				for (let cont of contenido) {
					// Crea el 'li'
					let li = document.createElement("li");
					let i;
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
			};
			// Armado del cartel
			let titulo = "En proceso:";
			let contenido = ["Buscando productos", "Tareas finales"];
			armadoDelCartel(titulo, contenido);
			lis_fa_circle = document.querySelectorAll("#cartel li i.fa-circle");
			lis_fa_check = document.querySelectorAll("#cartel li i.fa-circle-check");
			// Hace visible el cartel
			fondo.classList.remove("ocultar");
			cartel.classList.add("aumenta");
			cartel.classList.remove("ocultar");
		})();

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
	let listado = document.querySelector("#listado");

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
			// Agregar el form
			listado.insertBefore(li, ingrManual_DOM);
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

			// Agregar el form
			listado.append(li);
		});

	// Terminaciones
	// Agrega el mensaje
	document.querySelector("#mensaje").innerHTML = mensaje;

	// Elimina los modelos que ya no se necesitan
	prodsNuevos_DOM.remove()
	prodsYaEnBD_DOM.remove()

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

	// Fin
	return;
});
