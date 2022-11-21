"use strict";
window.addEventListener("load", async () => {
	// Definir las variables
	// Obtener sectores
	let prodsNuevos = document.querySelector("#prodsNuevos");
	let prodsYaEnBD = document.querySelector("#prodsYaEnBD");
	// Cartel
	let fondo = document.querySelector("#tapar-el-fondo");
	let cartel = document.querySelector("#cartel");
	let cartelError = document.querySelector("#cartel #error");
	let cartelTrabajando = document.querySelector("#cartel #trabajando");
	let cartelTitulo = document.querySelector("#cartel #titulo");
	let cartelUl = document.querySelector("#cartel ul");
	// Otras
	let ruta = "producto/agregar/api/desambiguar-form";

	// Configuración inicial
	(() => {
		// Quita los dots del 'li'
		cartelUl.style.listStyleType = "none";
		// Cambia el color de fondo
		cartel.classList.add("azul");
		// Cambia el ícono de encabezado
		cartelError.classList.add("ocultar");
		cartelTrabajando.classList.remove("ocultar");
		// cartelUl.style.marginLeft = "0";
	})();

	// Muestra el cartel
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
				i.classList.add("fa-solid", "fa-check", "ocultar");
				li.appendChild(i);
				// Agrega el texto
				li.innerHTML += cont;
				cartelUl.appendChild(li);
			}
		};
		let titulo = "En proceso:";
		let contenido = ["Buscando productos", "Tareas finales"];
		armadoDelCartel(titulo, contenido);
		// Hace visible el cartel
		fondo.classList.remove("ocultar");
		cartel.classList.add("aumenta");
		cartel.classList.remove("ocultar");
	})();

	// Busca los productos
	let productos = await fetch("/producto/agregar/api/obtiene-subcategorias").then((n) => n.json());

	// entidadesTMDB.forEach(async(entidad, indice) => {
	// 	lectura = await searchTMDB(palabrasClave, TMDB_entidad, page)
	// });
});
