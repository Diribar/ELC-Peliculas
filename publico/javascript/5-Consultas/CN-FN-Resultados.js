"use strict";

let resultados = {
	obtiene: async function () {
		// Si no se cumplen las condiciones mínimas, termina la función
		if (!v.mostrar) return;

		// Variables
		const ahora = new Date();
		const dia = ahora.getDate();
		const mes = ahora.getMonth() + 1;
		let datos = {configCons, entidad};

		// Arma los datos
		if (entidad == "productos" && v.ordenBD.valor == "santoral") datos = {...datos, dia, mes};

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

			// Limpia los resultados anteriores
			DOM.productos.innerHTML = "";
			DOM.pelisPor.innerHTML = "";

			// Deriva a productos
			if (entidad == "productos") this.productos();
			else this.pelisPor();

			// Pone visibles los resultados
			entidad == "productos" ? DOM.productos.classList.remove("ocultar") : DOM.pelisPor.classList.remove("ocultar");

			// Foco
			if (entidad == "productos") DOM.productos.querySelector("button").focus();

			// Fin
			return;
		},
		productos: function () {
			// Variables
			v.productos = [...v.infoResultados];

			// Oculta los resultados anteriores
			DOM.pelisPor.classList.add("ocultar");

			// Output
			if (v.infoResultados.length) {
				const tope = Math.min(4, v.infoResultados.length);
				for (let i = 0; i < tope; i++) {
					const producto = this.auxiliares.producto(v.infoResultados[i]);
					DOM.productos.append(producto);
				}

				// Genera las variables 'ppp'
				DOM.ppp = DOM.productos.querySelectorAll(".producto #ppp");
				v.ppp = Array.from(DOM.ppp);
			}

			// Fin
			return;
		},
		pelisPor: function () {
			// Variables
			v.productos = [];
			let rclvAnt = {};
			let tabla;

			// Oculta los resultados anteriores
			DOM.productos.classList.add("ocultar");

			// Rutina por registro RCLV
			v.infoResultados.forEach((rclv, indice) => {
				// Genera la variable de productos
				v.productos.push(...rclv.productos);

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

			// Crea las variables para los 'ppp'
			DOM.ppp = DOM.pelisPor.querySelectorAll("#ppp");
			v.ppp = Array.from(DOM.ppp);

			// Fin
			return;
		},
		auxiliares: {
			producto: (producto) => {
				// Crea el elemento 'li' que engloba todo el producto
				const li = document.createElement("li");
				li.className = "producto";
				li.tabIndex = "-1";

				// Crea el anchor
				const anchor = document.createElement("a");
				anchor.href += producto.entidad + "&id=" + producto.id;
				anchor.target = "_blank";
				anchor.tabIndex = "-1";
				li.appendChild(anchor);

				// Crea el botón
				const button = document.createElement("button");
				button.type = "text";
				button.className = "flexRow pointer";
				anchor.appendChild(button);

				// Crea la imagen
				const avatar = document.createElement("img");
				avatar.className = "imagenChica";
				avatar.src = producto.avatar.includes("/")
					? producto.avatar
					: v.localhost + "/imagenes/2-Productos/Final/" + producto.avatar;
				avatar.alt = producto.nombreCastellano;
				avatar.title = producto.nombreCastellano;
				button.appendChild(avatar);

				// Crea infoPeli
				const infoPeli = document.createElement("div");
				infoPeli.id = "infoPeli";
				infoPeli.className = "flexCol";
				button.appendChild(infoPeli);

				// Crea nombreCastellano, anoEstreno, direccion
				let elementos = ["nombreCastellano", "anoEstreno", "direccion", "ppp"];
				let aux = {};
				for (let elemento of elementos) {
					aux[elemento] = document.createElement(elemento != "ppp" ? "p" : "i");
					aux[elemento].id = elemento;
					aux[elemento].className = "interlineadoChico";
					infoPeli.appendChild(aux[elemento]);
					if (["nombreCastellano", "direccion"].includes(elemento)) infoPeli.appendChild(br);
				}

				// Particularidades
				aux.nombreCastellano.innerHTML = producto.nombreCastellano;
				aux.anoEstreno.innerHTML = producto.anoEstreno + " - " + producto.entidadNombre;
				aux.direccion.innerHTML = "Dirección: " + producto.direccion;
				aux.ppp.className += " scale " + producto.pppIcono;
				aux.ppp.tabIndex = "-1";
				aux.ppp.title = producto.pppNombre;

				// Fin
				return li;
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
					titulo =
						!nombreAnt && nombreActual < "G"
							? "(A - F)"
							: (!nombreAnt || nombreAnt < "G") && nombreActual >= "G"
							? "(G - M)"
							: (!nombreAnt || nombreAnt < "N") && nombreActual >= "N"
							? "(N - S)"
							: (!nombreAnt || nombreAnt < "T") && nombreActual >= "T"
							? "(T - Z)"
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
						// Variables
						const mayor1800 = "(año 1.801 en adelante)";
						const mayor1000 = "(años 1.001 al 1.800)";
						const menorIgual1000 = "(años 34 al 1.000)";

						titulo =
							!anoAnt || anoAnt < anoActual //Ascendente
								? (!anoAnt || anoAnt <= 1800) && anoActual > 1800
									? mayor1800
									: (!anoAnt || anoAnt <= 1000) && anoActual > 1000
									? mayor1000
									: !anoAnt
									? menorIgual1000
									: ""
								: //Descendente
								anoActual <= 1000 && anoAnt > 1000
								? menorIgual1000
								: anoActual <= 1800 && anoAnt > 1800
								? mayor1000
								: "";

						// Título para la vista
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
				let celda;

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

					// Crea la celda del producto y se la agrega a la fila
					celda = this.creaUnaCelda.prod(producto);
					fila.appendChild(celda);

					// Crea la celda del ppp y se la agrega a la fila
					celda = this.creaUnaCelda.ppp(producto);
					fila.appendChild(celda);

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
					const VF_epoca =
						!v.ordenBD.valor.startsWith("ano") && !rclv.anoNacim && !rclv.anoComienzo && rclv.epocaOcurrenciaNombre;
					const VF_canon = rclv.canonNombre;
					const VF_rolIglesia = v.ordenBD.valor != "rolIglesia" && rclv.rolIglesiaNombre;
					const celda = document.createElement("td");
					const anchor = document.createElement("a");
					anchor.href = "/rclv/detalle/?entidad=" + entidad + "&id=" + rclv.id + "&origen=CN";

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
					anchor.appendChild(DOM_linea1);
					if (segundaLinea) {
						const DOM_linea2 = document.createTextNode(segundaLinea);
						anchor.appendChild(document.createElement("br"));
						anchor.appendChild(DOM_linea2);
					}
					celda.appendChild(anchor);

					// Fin
					return celda;
				},
				prod: (producto) => {
					// Variables
					const celda = document.createElement("td");
					const anchor = document.createElement("a");
					anchor.href = "/producto/detalle/?entidad=" + producto.entidad + "&id=" + producto.id + "&origen=CN";

					// Genera el contenido
					const nombreCastellano = document.createTextNode(producto.nombreCastellano);
					const br = document.createElement("br");
					const segundaLinea = document.createTextNode(
						producto.anoEstreno + " - " + producto.entidadNombre + " - Dirección: " + producto.direccion
					);

					// Le agrega el contenido
					anchor.appendChild(nombreCastellano);
					anchor.appendChild(br);
					anchor.appendChild(segundaLinea);
					celda.appendChild(anchor);

					// Fin
					return celda;
				},
				ppp: (producto) => {
					// Variables
					const celda = document.createElement("td");

					// Se necesita crear la celda, porque el CSS considera siempre 3 celdas de ancho
					if (producto.pppNombre) {
						// Crea el ppp
						const ppp = document.createElement("i");
						ppp.id = "ppp";
						ppp.classList.add("scale", ...producto.pppIcono.split(" "));
						ppp.title = producto.pppNombre;

						// Lo agrega a la celda
						celda.appendChild(ppp);
					}

					// Fin
					return celda;
				},
			},
		},
	},
};
