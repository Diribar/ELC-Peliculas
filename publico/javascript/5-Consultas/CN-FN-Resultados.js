"use strict";

let resultados = {
	obtiene: async function () {
		// Fecha actual
		const ahora = new Date();
		const dia = ahora.getDate();
		const mes = ahora.getMonth() + 1;

		// Arma los datos
		let datos = {configCons};
		if (configCons.orden_id == 1) datos = {...datos, dia, mes};

		// Busca la información en el BE
		v.infoResultados =
			entidad == "productos"
				? await fetch(ruta + "obtiene-los-productos/?datos=" + JSON.stringify(datos)).then((n) => n.json())
				: await fetch(ruta + "obtiene-los-rclvs/?datos=" + JSON.stringify({configCons, entidad})).then((n) => n.json());

		// Fin
		this.contador();
		return;
	},
	contador: () => {
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

			if (configCons.layout_id == 1) await this.productos();

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
				nombreCastellano: bloque.querySelector("#nombreCastellano"),
				anoEstreno: bloque.querySelector("#anoEstreno"),
				direccion: bloque.querySelector("#direccion"),
				ppp: bloque.querySelector("#ppp"),
			};

			// Datos
			elemento.anchor.href += producto.entidad + "&id=" + producto.id;
			elemento.nombreCastellano.innerHTML = producto.nombreCastellano;
			// if (producto.nombreCastellano != producto.nombreOriginal) elemento.nombreOriginal.innerHTML = producto.nombreOriginal;
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
