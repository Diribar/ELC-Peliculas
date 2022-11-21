"use strict";
window.addEventListener("load", async () => {
	// Variables
	let lis_fa_circle, lis_fa_check
	let ruta = "/producto/agregar/api/desambiguar-form0";
	let resultado //= await fetch(ruta).then((n) => (n ? n.json() : ""));

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
		resultado = await fetch(ruta + palabrasClave).then((n) => n.json());
		lis_fa_circle[0].classList.add("ocultar");
		lis_fa_check[0].classList.remove("ocultar");

		// Pule la información
		ruta = "/producto/agregar/api/desambiguar-form2/?resultado=";
		resultado = await fetch(ruta + JSON.stringify(resultado)).then((n) => n.json());
	}
	// {prodsNuevos, prodsYaEnBD, mensaje}
	// Despliega los productos en la vista

	// Fin
	if (lis_fa_circle) {
		// Actualiza los íconos
		lis_fa_circle[1].classList.add("ocultar");
		lis_fa_check[1].classList.remove("ocultar");
	
		// Oculta el cartel
		fondo.classList.add("ocultar");
		cartel.classList.remove("aumenta");
		cartel.classList.add("disminuye");
	}
});
