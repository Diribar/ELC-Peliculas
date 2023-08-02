"use strict";

let resultados = {
	obtiene: async function () {
		// Si no se cumplen las condiciones mínimas, termina la función
		if (!v.mostrar) return;

		// Oculta el cartel de 'No tenemos'
		DOM.noTenemos.classList.add("ocultar");

		// Variables
		const ahora = new Date();
		const dia = ahora.getDate();
		const mes = ahora.getMonth() + 1;
		let datos = {configCons, entidad};

		// Arma los datos
		if (entidad == "productos" && v.ordenBD.valor == "diaDelAno_id") datos = {...datos, dia, mes};

		// Busca la información en el BE
		v.infoResultados = await fetch(ruta + "obtiene-los-resultados/?datos=" + JSON.stringify(datos)).then((n) => n.json());

		// Acciones si no hay resultados
		if (!v.infoResultados || !v.infoResultados.length) {
			DOM.quieroVer.classList.add("ocultar");
			DOM.noTenemos.classList.remove("ocultar");
			DOM.botones.innerHTML = "";
			DOM.listados.innerHTML = "";
		}
		// Acciones si hay resultados
		else if (v.mostrarCartelQuieroVer) DOM.quieroVer.classList.remove("ocultar");

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
			// Si no hubieron resultados, interrumpe la función
			if (!v.infoResultados || !v.infoResultados.length) return;

			// Cartel quieroVer
			v.mostrarCartelQuieroVer = false;
			DOM.quieroVer.classList.add("ocultar");

			// Limpia los resultados anteriores
			DOM.botones.innerHTML = "";
			DOM.listados.innerHTML = "";

			// Deriva a botones o listados
			v.layoutBD.boton ? this.botones() : this.listados();

			// Fin
			return;
		},
		botones: function () {
			// Variables
			v.productos = [...v.infoResultados];

			// Output
			const tope = Math.min(4, v.infoResultados.length);
			for (let i = 0; i < tope; i++) {
				const producto = this.auxiliares.boton(v.infoResultados[i]);
				DOM.productos.append(producto);
			}

			// Genera las variables 'ppp'
			DOM.ppp = DOM.productos.querySelectorAll(".producto #ppp");
			v.ppp = Array.from(DOM.ppp);

			// Foco
			DOM.productos.querySelector("button").focus();

			// Fin
			return;
		},
		listados: function () {
			// Variables
			v.productos = [];
			let registroAnt = {};

			// Rutina por registro
			v.infoResultados.forEach((registro, indice) => {
				// Si es un RCLV, genera la variable de productos
				if (entidad != "productos") v.productos.push(...registro.productos);

				// Averigua si hay un cambio de agrupamiento
				const titulo = this.auxiliares.titulo(registro, registroAnt, indice);
				registroAnt = registro;

				// Si corresponde, crea una nueva tabla
				if (titulo) {
					DOM.tabla = this.auxiliares.creaUnaTabla({titulo, indice}); // Obtiene la tabla con los datos
					DOM.listados.appendChild(DOM.tabla); // La agrega a la vista
					DOM.tbody = DOM.tabla.querySelector("tbody"); // Selecciona el body para luego agregarle filas
				}

				// Agrega fila/s al 'tbody'
				if (entidad == "producto") {
					const fila = this.auxiliares.creaUnaFilaDeProd({producto: registro, indice});
					DOM.tbody.appendChild(fila);
				} else {
					const filas = this.auxiliares.creaLasFilasDeUnRCLV({rclv: registro, indice});
					for (let fila of filas) DOM.tbody.appendChild(fila);
				}
			});

			// Crea variables DOM
			DOM.ppp = DOM.listados.querySelectorAll("#ppp");
			DOM.expandeContrae = DOM.listados.querySelectorAll(".expandeContrae");
			DOM.tbody = DOM.listados.querySelectorAll("tbody");

			// Crea variables 'v'
			v.ppp = Array.from(DOM.ppp);
			v.expandeContrae = Array.from(DOM.expandeContrae);

			// Fin
			return;
		},
		auxiliares: {
			boton: (producto) => {
				// Crea el elemento 'li' que engloba todo el producto
				const li = document.createElement("li");
				li.className = "producto";
				li.tabIndex = "-1";

				// Crea el anchor
				const anchor = document.createElement("a");
				anchor.href = "/producto/detalle/?entidad=" + producto.entidad + "&id=" + producto.id;
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
			titulo: (registro, registroAnt, indice) => {
				// Variables
				const orden = v.ordenBD.valor;
				let titulo;

				// nombre
				if (!titulo && orden == "nombre") {
					// Variables
					const nombreAnt = registroAnt.nombre ? registroAnt.nombre : registroAnt.nombreCastellano;
					const nombreActual = registro.nombre ? registro.nombre : registro.nombreCastellano;
					let prefijo = "Abecedario ";

					// Pruebas
					titulo =
						!nombreAnt && nombreActual < "G"
							? "(A - F)"
							: (!nombreAnt || nombreAnt < "G") && nombreActual < "N"
							? "(G - M)"
							: (!nombreAnt || nombreAnt < "N") && nombreActual < "T"
							? "(N - S)"
							: "(T - Z)";

					// Fin
					if (titulo) titulo = prefijo + titulo;
				}

				// diaDelAno_id
				if (!titulo && orden == "diaDelAno_id") {
					// Variables
					const diaAnt = registroAnt.diaDelAno_id;
					const diaActual = registro.diaDelAno_id;

					// Pruebas
					titulo =
						!diaAnt && diaActual < 92
							? "Primer"
							: (!diaAnt || diaAnt < 92) && diaActual < 183
							? "Segundo"
							: (!diaAnt || diaAnt < 183) && diaActual < 275
							? "Tercer"
							: (!diaAnt || diaAnt < 275) && diaActual >= 275
							? "Cuarto"
							: "";

					// Fin
					if (titulo) titulo += " Trimestre";
				}

				// rolIglesia
				if (!titulo && orden == "rolIglesia") {
					// Variables
					const grupoAnt = registroAnt.rolIglesiaGrupo;
					const grupoActual = registro.rolIglesiaGrupo;

					// Pruebas
					if (grupoAnt != grupoActual) titulo = registro.rolIglesiaGrupo;
				}

				// anoNacim y anoComienzo
				if (!titulo && ["anoNacim", "anoComienzo"].includes(orden)) {
					// Variables
					const epocaAnt = registroAnt.epocaOcurrencia_id;
					const epocaActual = registro.epocaOcurrencia_id;
					const anoAnt = orden == "anoNacim" ? registroAnt.anoNacim : registroAnt.anoComienzo;
					const anoActual = orden == "anoNacim" ? registro.anoNacim : registro.anoComienzo;

					// Pruebas
					if (epocaActual != "pst" && epocaAnt != epocaActual) titulo = registro.epocaOcurrenciaNombre;
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
						if (titulo) titulo = registro.epocaOcurrenciaNombre + " " + titulo;
					}
				}

				// altaRevisadaEn
				if (!titulo && orden == "altaRevisadaEn") {
					titulo = !indice ? "Las treinta más recientes" : indice == 30 ? "Anteriores" : "";
				}

				// anoEstreno
				if (!titulo && orden == "anoEstreno") {
					// Variables
					const grupoAnt = registroAnt.epocaEstrenoGrupo;
					const grupoActual = registro.epocaEstrenoGrupo;

					// Pruebas
					if (grupoAnt != grupoActual) titulo = registro.epocaEstrenoGrupo;
				}

				// Fin
				return titulo;
			},
			creaUnaTabla: ({titulo, indice}) => {
				// Crea una tabla
				const tabla = document.createElement("table");

				// Le agrega un título
				const i = document.createElement("i");
				i.className = "expandeContrae pointer fa-solid fa-square-" + (indice ? "plus" : "minus");
				const caption = document.createElement("caption");
				caption.innerHTML = titulo;
				caption.className = "relative";
				caption.appendChild(i);
				tabla.appendChild(caption);

				// Le agrega un body
				const tbody = document.createElement("tbody");
				if (indice) tbody.className = "ocultar";
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
					anchor.target = "_blank";
					anchor.tabIndex = "-1";

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
