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

	// Armar el cartel
	let armadoDelCartel = (titulo, contenido) => {
		console.log("hola");
		// Ícono inicial
		cartelError.classList.add("ocultar");
		cartelTrabajando.classList.remove("ocultar");
		// Titulo
		cartelTitulo.innerHTML = titulo;
		// Contenido
		for (let cont of contenido) {
			// Crear el 'li'
			let li = document.createElement("li");
			li.style.marginLeft = "20px";
			li.innerHTML = cont;
			cartelUl.appendChild(li);
		}
	};

	// Start-up
	cartel.classList.add("azul");
	cartel.classList.add("aparec");
	cartelUl.style.listStyleType = "none";
	cartelUl.style.marginLeft = "0";

	// Cartel buscando productos
	let titulo = "Buscando productos";
	let contenido = ["Películas", "Colecciones", "Series de TV"];
	cartel.classList.remove("ocultar");
	armadoDelCartel(titulo, contenido);
	fondo.classList.remove("ocultar");
	cartel.classList.remove("ocultar");
	let lis = document.querySelectorAll("#cartel #mensajes li");
	// Crea la barra
	let barra = document.createElement("i");
	barra.classList.add("fa-solid");
	barra.classList.add("fa-minus");
	// Rutina por entidadTMDB
	let entidadesTMDB = [
		"movie",//, "collection", "tv"
	];
	entidadesTMDB.forEach((entidad, indice) => {
		// Crea un li con la barra
		let li = document.createElement("li");
		li.classList.add("rotar");
		li.appendChild(barra);
		// Reemplaza el li que está en acción
		li.innerHTML += lis[indice].innerHTML;
		lis[indice].classList.add("oculta");
		cartelUl.appendChild(li);
		let angulo = 0;
		let vuelta = 0;
		console.log("fin");
	});
});
