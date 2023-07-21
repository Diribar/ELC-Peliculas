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
		if (entidad == "productos" && v.ordenBD.valor == "momento") datos = {...datos, dia, mes};
		else if (entidad != "productos") datos.entidad = entidad;

		// Busca la información en el BE
		v.infoResultados = await fetch(ruta + "obtiene-los-resultados/?datos=" + JSON.stringify(datos)).then((n) => n.json());

		// Contador
		if (v.infoResultados) this.contador();

		// Fin
		return;
	},
	contador: () => {
		if (entidad == "productos") {
			// Variables
			const total = v.infoResultados ? v.infoResultados.length : 0;
			const parcial = Math.min(4, total);

			// Actualiza el contador
			DOM.contadorDeProds.innerHTML = parcial + " de " + total;
		} else {
			// Variables
			const cantRCLVs = v.infoResultados ? v.infoResultados.length : 0;
			let cantProds = 0;
			if (v.infoResultados) for (let rclv of v.infoResultados) cantProds += rclv.productos.length;

			// Actualiza el contador
			DOM.contadorDeProds.innerHTML = cantRCLVs + " x " + cantProds;
		}

		// Fin
		return;
	},
	muestra: {
		generico: function () {
			// Cartel comencemos
			v.mostrarComencemos = false;
			DOM.comencemos.classList.add("ocultar");

			// Acciones si no hay resultados
			!v.infoResultados || !v.infoResultados.length
				? DOM.noTenemos.classList.remove("ocultar")
				: DOM.noTenemos.classList.add("ocultar");

			// Deriva a productos
			if (entidad == "productos") this.productos();
			else this.pelisPor();

			// Pone visibles los resultados
			entidad == "productos" ? DOM.productos.classList.remove("ocultar") : DOM.pelisPor.classList.remove("ocultar");

			// Fin
			return;
		},
		productos: function () {
			// Limpia los resultados anteriores
			DOM.pelisPor.classList.add("ocultar");
			DOM.productos.innerHTML = "";

			// Output
			if (v.infoResultados.length) {
				const tope = Math.min(4, v.infoResultados.length);
				for (let i = 0; i < tope; i++) {
					const bloqueProducto = this.auxiliares.bloqueProducto(v.infoResultados[i]);
					DOM.productos.append(bloqueProducto);
				}
				DOM.ppp = DOM.productos.querySelectorAll(".producto #ppp");
				v.ppp = Array.from(DOM.ppp);
			}

			// Fin
			return;
		},
		pelisPor: function () {
			// Variables
			let rclvAnt = {};
			let tabla;

			// Limpia los resultados anteriores
			DOM.productos.classList.add("ocultar");
			DOM.pelisPor.innerHTML = "";

			// Rutina por registro RCLV
			v.infoResultados.forEach((rclv, indice) => {
				// Averigua si hay un cambio de agrupamiento
				const titulo = this.auxiliares.titulo({rclv, rclvAnt});
				rclvAnt = rclv;

				// Si corresponde, crea una nueva tabla
				if (titulo) {
					tabla = this.auxiliares.creaUnaTabla(titulo);
					DOM.pelisPor.appendChild(tabla);
				}

				// Agrega las filas de un rclv
				const DOM_tablas = DOM.pelisPor.querySelectorAll("table");
				const DOM_tabla = [...DOM_tablas].pop();
				const DOM_tbody = DOM_tabla.querySelector("tbody");
				const filas = this.auxiliares.creaLasFilasDeUnRCLV({rclv, indice});
				for (let fila of filas) DOM_tbody.appendChild(fila);
			});

			// Fin
			return;
		},
		auxiliares: {
			bloqueProducto: (producto) => {
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
				let avatar = v.localhost + "/imagenes/2-Productos/Final/" + producto.avatar;
				elemento.avatar.src = avatar;
				elemento.avatar.alt = producto.nombreOriginal;
				elemento.avatar.title = producto.nombreOriginal;

				// Quitar la clase 'ocultar'
				bloque.classList.remove("ocultar");

				// Fin
				return bloque;
			},
			titulo: ({rclv, rclvAnt}) => {
				// Variables
				const orden = v.ordenBD.valor;
				let titulo;

				// nombre
				if (!titulo && orden == "nombre") {
					// Variables
					const nombreAnt = rclvAnt.nombre;
					const nombreActual = rclv.nombre;
					let prefijo = "Abecedario ";

					// Pruebas
					titulo = !nombreAnt
						? "A - F"
						: nombreAnt < "g" && nombreActual >= "g"
						? "G - M"
						: nombreAnt < "n" && nombreActual >= "n"
						? "N - S"
						: nombreAnt < "t" && nombreActual >= "t"
						? "T - Z"
						: "";

					// Fin
					if (titulo) titulo = prefijo + titulo;
				}

				// diaDelAno_id
				if (!titulo && orden == "diaDelAno_id") {
					// Variables
					const diaAnt = rclvAnt.diaDelAno_id;
					const diaActual = rclv.diaDelAno_id;

					// Pruebas
					titulo = !diaAnt
						? "Primer"
						: diaAnt < 92 && diaActual >= 92
						? "Segundo"
						: diaAnt < 183 && diaActual >= 183
						? "Tercer"
						: diaAnt < 275 && diaActual >= 275
						? "Cuarto"
						: "";

					// Fin
					if (titulo) titulo += " Trimestre";
				}

				// rolIglesia
				if (!titulo && orden == "rolIglesia") {
					// Variables
					const grupoAnt = rclvAnt.rolIglesiaGrupo;
					const grupoActual = rclv.rolIglesiaGrupo;

					// Pruebas
					if (grupoAnt != grupoActual) titulo = rclv.rolIglesiaGrupo;
				}

				// anoNacim y anoComienzo
				if (!titulo && ["anoNacim", "anoComienzo"].includes(orden)) {
					// Variables
					const epocaAnt = rclvAnt.epocaOcurrencia_id;
					const epocaActual = rclv.epocaOcurrencia_id;
					const anoAnt = orden == "anoNacim" ? rclvAnt.anoNacim : rclvAnt.anoComienzo;
					const anoActual = orden == "anoNacim" ? rclv.anoNacim : rclv.anoComienzo;

					// Pruebas
					if (epocaActual != "pst" && epocaAnt != epocaActual) titulo = rclv.epocaOcurrenciaNombre;
					if (epocaActual == "pst") {
						titulo =
							anoAnt <= 1800 && anoActual > 1800
								? "(año 1.801 en adelante)"
								: anoAnt <= 1000 && anoActual > 1000
								? "(años 1.001 al 1.800)"
								: !anoAnt
								? "(años 1 al 1.000)"
								: "";
						if (titulo) titulo = rclv.epocaOcurrenciaNombre + " " + titulo;
					}
				}

				// Fin
				return titulo;
			},
			creaUnaTabla: (titulo) => {
				// Crea una tabla
				let tabla = document.createElement("table");

				// Le agrega un título
				let caption = document.createElement("caption");
				caption.innerHTML = titulo;
				tabla.appendChild(caption);

				// Le agrega un body
				let tbody = document.createElement("tbody");
				tabla.appendChild(tbody);

				// Fin
				return tabla;
			},
			creaLasFilasDeUnRCLV: function ({rclv, indice}) {
				// Variables
				let filas = [];

				// Crea la celdaRCLV
				const celdaRCLV = this.creaUnaCelda.rclv(rclv);

				// Crea las filas de los productos
				rclv.productos.forEach((producto, i) => {
					// Crea una fila y le asigna su clase
					const fila = document.createElement("tr");
					const parImparRCLV = (indice % 2 ? "par" : "impar") + "RCLV";
					const parImparProd = (i % 2 ? "par" : "impar") + "Prod";
					fila.classList.add(parImparRCLV, parImparProd);

					// Agrega la celdaRCLV a la primera fila
					if (!i) fila.appendChild(celdaRCLV);

					// Crea la celda del producto
					const celdaProd = this.creaUnaCelda.prod(producto);

					// Agrega la celda a la fila
					fila.appendChild(celdaProd);

					// Envía la fila al acumulador
					filas.push(fila);
				});

				// Fin
				return filas;
			},
			creaUnaCelda: {
				rclv: (rclv) => {
					// Variables
					const cantProds = rclv.productos.length;
					const VF_apodo = !!rclv.apodo;
					const VF_diaDelAno = rclv.diaDelAno_id < 400;
					const VF_epoca = !v.ordenBD.valor.startsWith("ano") && !rclv.anoNacim && !rclv.anoComienzo;
					const VF_canon = rclv.canon_id && !rclv.canon_id.startsWith("NN");
					const VF_rolIglesia = v.ordenBD.valor != "rolIglesia";
					const celda = document.createElement("td");

					// Si tiene más de 1 producto
					if (cantProds > 1) celda.rowSpan = cantProds;

					// Genera la información - 1a línea
					let primeraLinea = rclv.nombre; // Nombre
					if (VF_apodo) primeraLinea += " (" + rclv.apodo + (!VF_diaDelAno ? ")" : ""); // Apodo
					if (VF_diaDelAno) primeraLinea += (VF_apodo ? " - " : " (") + rclv.diaDelAno.nombre + ")"; // Día del Año

					// Genera la información - 2a línea
					let segundaLinea = "";
					if (VF_epoca) segundaLinea += rclv.epocaOcurrenciaNombre;
					segundaLinea += rclv.anoNacim ? rclv.anoNacim : rclv.anoComienzo ? rclv.anoComienzo : ""; // Año de Nacimiento o Comienzo
					if (VF_canon) segundaLinea += (segundaLinea ? " - " : "") + rclv.canonNombre; // Proceso de canonización
					if (VF_rolIglesia) segundaLinea += (segundaLinea ? " - " : "") + rclv.rolIglesiaNombre; // Rol en la Iglesia

					// Le agrega el contenido
					const DOM_linea1 = document.createTextNode(primeraLinea);
					const DOM_linea2 = document.createTextNode(segundaLinea);
					celda.appendChild(DOM_linea1);
					celda.appendChild(document.createElement("br"));
					celda.appendChild(DOM_linea2);

					// Fin
					return celda;
				},
				prod: (producto) => {
					// Variables
					const celda = document.createElement("td");

					// Genera el contenido
					const nombreCastellano = document.createTextNode(producto.nombreCastellano);
					const pppIcono = document.createElement("i");
					pppIcono.classList.add(...producto.pppIcono.split(" "));
					pppIcono.title = producto.pppNombre;
					const br = document.createElement("br");
					const segundaLinea = document.createTextNode(
						producto.anoEstreno + " - " + producto.entidadNombre + " - Dirección: " + producto.direccion
					);

					// Le agrega el contenido
					celda.appendChild(nombreCastellano);
					celda.appendChild(pppIcono);
					celda.appendChild(br);
					celda.appendChild(segundaLinea);

					// Fin
					return celda;
				},
			},
		},
	},
};
