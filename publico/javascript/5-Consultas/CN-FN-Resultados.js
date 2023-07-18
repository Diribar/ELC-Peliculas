"use strict";

let resultados = {
	obtiene: async function () {
		// Si no se cumplen las condiciones mínimas, termina la función
		if (!v.mostrar) return;

		// Variables
		const ahora = new Date();
		const dia = ahora.getDate();
		const mes = ahora.getMonth() + 1;
		let datos = {configCons};

		// Arma los datos
		if (entidad == "productos" && v.orden.valor == "momento") datos = {...datos, dia, mes};
		else if (entidad != "productos") datos.entidad = entidad;

		// Busca la información en el BE
		v.infoResultados = await fetch(ruta + "obtiene-los-resultados/?datos=" + JSON.stringify(datos)).then((n) => n.json());

		// Contador
		if (v.infoResultados) this.contador();

		// Fin
		return;
	},
	contador: () => {
		if (entidad != "productos") return;
		// Variables
		v.total = v.infoResultados ? v.infoResultados.length : 0;
		v.parcial = Math.min(4, v.total);

		// Actualiza el contador
		DOM.contadorDeProds.innerHTML = v.parcial + " / " + v.total;

		// Fin
		return;
	},
	muestra: {
		generico: async function () {
			// Cartel comencemos
			v.mostrarComencemos = false;
			DOM.comencemos.classList.add("ocultar");

			// Acciones si no hay resultados
			!v.infoResultados || !v.infoResultados.length
				? DOM.noTenemos.classList.remove("ocultar")
				: DOM.noTenemos.classList.add("ocultar");

			// Deriva a productos
			if (entidad == "productos") await this.productos();
			else console.log(v.infoResultados);

			// Fin
			DOM.vistaProds.classList.remove("ocultar");
			return;
		},
		productos: async function () {
			// Limpia los resultados anteriores
			DOM.productos.innerHTML = "";

			// Output
			if (v.infoResultados.length) {
				const tope = Math.min(4, v.infoResultados.length);
				for (let i = 0; i < tope; i++) {
					const bloqueProducto = await this.bloqueProducto(v.infoResultados[i]);
					DOM.productos.append(bloqueProducto);
				}
				DOM.ppp = DOM.productos.querySelectorAll(".producto #ppp");
				v.ppp = Array.from(DOM.ppp);
			}

			// Fin
			return;
		},
		bloqueProducto: async (producto) => {
			// Crea el elemento 'boton'. El 'true' es para incluir también a los hijos
			let bloque = DOM.producto.cloneNode(true);
			let elemento = {
				anchor: bloque.querySelector("a"),
				avatar: bloque.querySelector("img"),
				nombreCastellano: bloque.querySelector("#nombreCastellano em b"),
				anoEstreno: bloque.querySelector("#anoEstreno"),
				direccion: bloque.querySelector("#direccion"),
				ppp: bloque.querySelector("#ppp"),
			};

			// Datos
			elemento.anchor.href += producto.entidad + "&id=" + producto.id;
			elemento.nombreCastellano.innerHTML = producto.nombreCastellano;
			elemento.anoEstreno.innerHTML = producto.anoEstreno + " - " + producto.entidadNombre;
			elemento.direccion.innerHTML = "Dirección: " + producto.direccion;
			producto.pppIcono
				? elemento.ppp.classList.add(...producto.pppIcono.split(" "))
				: elemento.ppp.classList.add("fa-regular", "fa-heart");
			elemento.ppp.title = producto.pppNombre ? producto.pppNombre : "Sin preferencia personal";

			// Imagen
			const localhost = await fetch("/api/localhost").then((n) => n.json());
			let avatar = localhost + "/imagenes/2-Productos/Final/" + producto.avatar;
			elemento.avatar.src = avatar;
			elemento.avatar.alt = producto.nombreOriginal;
			elemento.avatar.title = producto.nombreOriginal;

			// Quitar la clase 'ocultar'
			bloque.classList.remove("ocultar");

			// Fin
			return bloque;
		},
	},
};
