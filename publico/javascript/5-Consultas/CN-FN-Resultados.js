"use strict";

let resultados = {
	obtiene: async function () {
		// Si no se cumplen las condiciones mínimas, termina la función
		if (!v.mostrar) return;

		// Si es un orden a mostrar en botones, oculta el contador
		DOM.contadorDeProds.classList.add("ocultar");

		// Oculta todos los carteles
		for (let cartel of DOM.carteles) cartel.classList.add("ocultar");

		// Tapa y limpia los resultados anteriores
		if (!v.mostrarCartelQuieroVer) DOM.esperandoResultados.classList.replace("desaparece", "aparece");
		DOM.pppOpcionesCartelCierra.classList.remove("ocultar");
		DOM.botones.innerHTML = "";
		DOM.listados.innerHTML = "";
		v.infoResultados = null;

		// Acciones si el orden es 'pppFecha'
		if (v.ordenBD.codigo == "pppFecha") {
			// Muestra el cartel 'loginPend' y termina
			if (!v.userID) {
				DOM.loginPend.classList.remove("ocultar");
				return;
			}
			// Muestra el cartel 'pppOpcionesCartel' y termina
			else if (!v.usuarioTienePPP) {
				DOM.pppOpcionesCartelCierra.classList.add("ocultar"); // oculta el ícono 'pppOpcionesCartelCierra'
				DOM.pppOpcionesCartel.classList.remove("ocultar");
				return;
			}
		}

		// Busca la información en el BE
		const ahora = new Date();
		const datos =
			v.entidad == "productos" && v.ordenBD.codigo == "fechaDelAno_id"
				? {configCons, entidad: v.entidad, dia: ahora.getDate(), mes: ahora.getMonth() + 1}
				: {configCons, entidad: v.entidad};
		v.infoResultados = await fetch(ruta + "obtiene-los-resultados/?datos=" + JSON.stringify(datos)).then((n) => n.json());

		// Acciones en consecuencia
		!v.infoResultados || !v.infoResultados.length
			? DOM.noTenemos.classList.remove("ocultar") // si no hay resultados, muestra el cartel 'noTenemos'
			: v.mostrarCartelQuieroVer
			? DOM.quieroVer.classList.remove("ocultar") // si hay resultados, muestra el cartel 'quieroVer'
			: null;

		// Contador
		if (v.infoResultados && !v.ordenPorEntBD.boton) this.contador();

		// Fin
		return;
	},
	// Contador para productos
	contador: () => {
		// Variables
		const total = v.infoResultados ? v.infoResultados.length : 0;

		// Contador para Productos
		if (v.entidad == "productos") {
			// Contador para vista 'botones'
			if (v.ordenPorEntBD.boton) return;
			// Contador para 'listado-altaRevisadaEn'
			else if (v.ordenBD.codigo == "altaRevisadaEn") {
				// Variables
				const parcial = Math.min(v.topeParaMasRecientes, total);

				// Actualiza el contador
				DOM.contadorDeProds.innerHTML = parcial;
			}
			// Contador para 'Todos los productos'
			else DOM.contadorDeProds.innerHTML = total;
		}
		// Contador para RCLVs
		else {
			// Variables
			const cantRCLVs = total;
			let cantProds = 0;
			if (v.infoResultados) for (let rclv of v.infoResultados) cantProds += rclv.productos.length;

			// Actualiza el contador
			DOM.contadorDeProds.innerHTML = cantRCLVs + " x " + cantProds;
		}

		// Muestra el contador
		DOM.contadorDeProds.classList.remove("ocultar");

		// Fin
		return;
	},
	muestra: {
		generico: function () {
			// Si no hubieron resultados, interrumpe la función
			if (!v.infoResultados || !v.infoResultados.length) return;

			// Cartel quieroVer
			if (v.mostrarCartelQuieroVer) {
				DOM.esperandoResultados.classList.remove("ocultar");
				DOM.quieroVer.classList.add("ocultar");
				DOM.telonFondo.classList.add("ocultar");
				v.mostrarCartelQuieroVer = false;
			}

			// Limpia los resultados anteriores
			DOM.botones.innerHTML = "";
			DOM.listados.innerHTML = "";

			// Deriva a botones o listados
			v.ordenPorEntBD.boton ? this.botones() : this.listados();

			// Quita el cartel de 'esperandoResultados'
			DOM.esperandoResultados.classList.replace("aparece", "desaparece");

			// Fin
			return;
		},
		botones: () => {
			// Variables
			v.productos = [...v.infoResultados];

			// Output
			const tope = Math.min(4, v.infoResultados.length);
			for (let i = 0; i < tope; i++) {
				const boton = auxiliares.boton(v.infoResultados[i]);
				DOM.botones.append(boton);
			}

			// Genera las variables 'ppp'
			DOM.ppp = DOM.botones.querySelectorAll(".producto #ppp");
			v.ppp = Array.from(DOM.ppp);

			// Foco
			DOM.botones.querySelector("button").focus();

			// Fin
			return;
		},
		listados: () => {
			// Variables
			v.productos = [];
			let registroAnt = {};

			// Rutina por registro
			v.infoResultados.forEach((registro, indice) => {
				// Para el orden 'Por fecha en nuestro sistema', muestra sólo las primeras
				if (v.ordenBD.codigo == "altaRevisadaEn" && indice >= v.topeParaMasRecientes) return;

				// Acumula los productos
				v.entidad == "productos" ? v.productos.push(registro) : v.productos.push(...registro.productos);

				// Averigua si hay un cambio de agrupamiento
				const titulo = auxiliares.titulo(registro, registroAnt, indice);
				registroAnt = registro;

				// Si corresponde, crea una nueva tabla
				if (titulo) {
					DOM.tabla = auxiliares.creaUnaTabla({titulo, indice}); // Obtiene la tabla con los datos
					DOM.listados.appendChild(DOM.tabla); // La agrega a la vista
					DOM.tbody = DOM.tabla.querySelector("tbody"); // Selecciona el body para luego agregarle filas
				}

				// Agrega fila/s al 'tbody'
				if (v.entidad == "productos") {
					const fila = auxiliares.creaUnaFilaDeProd({producto: registro, indice});
					DOM.tbody.appendChild(fila);
				} else {
					const filas = auxiliares.creaLasFilasDeUnRCLV({rclv: registro, indice});
					for (let fila of filas) DOM.tbody.appendChild(fila);
				}
			});

			// Crea variables DOM
			DOM.ppp = DOM.listados.querySelectorAll("#ppp");
			DOM.expandeContrae = DOM.listados.querySelectorAll(".expandeContrae");
			DOM.caption = DOM.listados.querySelectorAll("caption");
			DOM.tbody = DOM.listados.querySelectorAll("tbody");

			// Crea variables 'v'
			v.ppp = Array.from(DOM.ppp);
			v.expandeContrae = Array.from(DOM.expandeContrae);
			v.caption = Array.from(DOM.caption);

			// Fin
			return;
		},
	},
};

let auxiliares = {
	boton: function (producto) {
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

		// Crea el sector de informacion
		const informacion = document.createElement("div");
		informacion.id = "informacion";
		informacion.className = "flexCol";
		button.appendChild(informacion);

		// Crea infoPeli
		const infoPeli = document.createElement("div");
		infoPeli.id = "infoPeli";
		informacion.appendChild(infoPeli);

		// Crea nombreCastellano, anoEstreno, direccion
		let elementos = ["nombreCastellano", "anoEstreno", "direccion", "ppp"];
		let aux = {};
		for (let elemento of elementos) {
			aux[elemento] = document.createElement(elemento != "ppp" ? "p" : "i");
			aux[elemento].id = elemento;
			aux[elemento].className = "interlineadoChico";
			infoPeli.appendChild(aux[elemento]);
		}

		// Particularidades
		aux.nombreCastellano.innerHTML = producto.nombreCastellano;
		aux.anoEstreno.innerHTML = producto.anoEstreno + " - " + producto.entidadNombre;
		aux.ppp.className += " scale " + producto.pppIcono;
		aux.ppp.tabIndex = "-1";
		aux.ppp.title = producto.pppNombre;

		// Particularidades de Dirección
		const em = document.createElement("em");
		em.innerHTML = producto.direccion;
		aux.direccion.innerHTML = "Dirección: ";
		aux.direccion.appendChild(em);

		// Crea infoRCLV
		const infoRCLV = document.createElement("div");
		infoRCLV.id = "infoRCLV";
		informacion.appendChild(infoRCLV);

		// Agrega el rclv en infoRCLV
		const rclv = this.obtieneElRCLV(producto);
		if (rclv) infoRCLV.appendChild(rclv);

		// Fin
		return li;
	},
	titulo: (registroAct, registroAnt, indice) => {
		// Variables
		const orden = v.ordenBD.codigo;
		let titulo;

		// fechaDelAno_id
		if (!titulo && orden == "fechaDelAno_id") {
			// Variables
			const diaAnt = registroAnt.fechaDelAno_id;
			const diaActual = registroAct.fechaDelAno_id;

			// Pruebas
			titulo =
				!diaAnt && diaActual < 92
					? "Primer"
					: (!diaAnt || diaAnt < 92) && diaActual >= 92 && diaActual < 183
					? "Segundo"
					: (!diaAnt || diaAnt < 183) && diaActual >= 183 && diaActual < 275
					? "Tercer"
					: (!diaAnt || diaAnt < 275) && diaActual >= 275
					? "Cuarto"
					: "";

			// Fin
			if (titulo) titulo += " Trimestre";
		}

		// nombre
		if (!titulo && orden == "nombre") {
			// Variables
			const nombreAnt = registroAnt.nombre ? registroAnt.nombre : registroAnt.nombreCastellano;
			const nombreActual = registroAct.nombre ? registroAct.nombre : registroAct.nombreCastellano;
			const prefijo = "Rango ";

			// Pruebas
			titulo =
				!nombreAnt && nombreActual < "G"
					? "A - F"
					: (!nombreAnt || nombreAnt < "G") && nombreActual >= "G" && nombreActual < "N"
					? "G - M"
					: (!nombreAnt || nombreAnt < "N") && nombreActual >= "N" && nombreActual < "T"
					? "N - S"
					: (!nombreAnt || nombreAnt < "T") && nombreActual >= "T"
					? "T - Z"
					: "";

			// Fin
			if (titulo) titulo = prefijo + titulo;
		}

		// anoHistorico
		if (!titulo && orden == "anoHistorico") {
			// Variables
			const epocaAnt = registroAnt.epocaOcurrencia_id;
			const epocaActual = registroAct.epocaOcurrencia_id;
			const anoAnt = registroAnt.anoNacim ? registroAnt.anoNacim : registroAnt.anoComienzo;
			const anoActual = registroAct.anoNacim ? registroAct.anoNacim : registroAct.anoComienzo;

			// Pruebas
			if (epocaActual != "pst" && epocaAnt != epocaActual) titulo = registroAct.epocaOcurrenciaNombre;
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
				if (titulo) titulo = registroAct.epocaOcurrenciaNombre + " " + titulo;
			}
		}

		// altaRevisadaEn
		if (!titulo && orden == "altaRevisadaEn") {
			titulo = !indice ? "Últimas ingresadas" : "";
		}

		// pppFecha
		if (!titulo && orden == "pppFecha") {
			// Variables
			const nombreAnt = registroAnt.pppNombre;
			const nombreActual = registroAct.pppNombre;

			// Pruebas
			titulo = nombreAnt != nombreActual ? nombreActual : "";
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
		caption.className = "relative pointer";
		caption.appendChild(i);
		tabla.appendChild(caption);

		// Le agrega un body
		const tbody = document.createElement("tbody");
		tbody.className = indice ? "ocultar" : "aparece";
		tabla.appendChild(tbody);

		// Fin
		return tabla;
	},
	creaUnaFilaDeProd: function ({producto, indice}) {
		// Variables
		let celda;

		// Crea una fila y le asigna su clase
		const fila = document.createElement("tr");
		const parImparProd = (indice % 2 ? "par" : "impar") + "Prod";
		fila.className = parImparProd;

		// Crea la celda del producto y se la agrega a la fila
		celda = creaUnaCelda.prod(producto);
		celda.className = "primeraCol";
		fila.appendChild(celda);

		// Crea la celda del ppp y se la agrega a la fila
		celda = creaUnaCelda.ppp(producto);
		fila.appendChild(celda);

		// Fin
		return fila;
	},
	creaLasFilasDeUnRCLV: function ({rclv, indice}) {
		// Variables
		let filas = [];
		let celda;

		// Crea la celdaRCLV
		const celdaRCLV = creaUnaCelda.rclv(rclv);
		celdaRCLV.className = "primeraCol";

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
			celda = creaUnaCelda.prod(producto);
			fila.appendChild(celda);

			// Crea la celda del ppp y se la agrega a la fila
			celda = creaUnaCelda.ppp(producto);
			fila.appendChild(celda);

			// Envía la fila al acumulador
			filas.push(fila);
		});

		// Fin
		return filas;
	},
	obtieneElRCLV: (producto) => {
		for (let rclvNombre of v.rclvNombres)
			if (producto[rclvNombre]) {
				// Crea el rclv con sus características
				const rclv = document.createElement("p");
				rclv.className = "interlineadoChico rclv";
				rclv.innerHTML = rclvNombre + ": ";

				// Crea el em
				const em = document.createElement("em");
				const fechaDelAno = producto.fechaDelAno;
				em.innerHTML = producto[rclvNombre] + (fechaDelAno ? " (" + fechaDelAno + ")" : "");
				rclv.appendChild(em);

				// Fin
				return rclv;
			}

		// Fin
		return false;
	},
};

let creaUnaCelda = {
	rclv: (rclv) => {
		// Variables
		const cantProds = rclv.productos.length;
		const VF_apodo = !!rclv.apodo;
		const VF_diaDelAno = rclv.fechaDelAno_id && rclv.fechaDelAno_id < 400;
		const VF_epoca = !v.ordenBD.codigo.startsWith("ano") && !rclv.anoNacim && !rclv.anoComienzo && rclv.epocaOcurrenciaNombre;
		const VF_canon = rclv.canonNombre;
		const VF_rolIglesia = rclv.rolIglesiaNombre;
		const celda = document.createElement("td");
		const anchor = document.createElement("a");
		anchor.href = "/rclv/detalle/?entidad=" + v.entidad + "&id=" + rclv.id + "&origen=CN";
		anchor.target = "_blank";
		anchor.tabIndex = "-1";

		// Si tiene más de 1 producto
		if (cantProds > 1) celda.rowSpan = cantProds;

		// Genera la información - 1a línea
		const primeraLinea = document.createElement("p");
		primeraLinea.innerHTML = rclv.nombre; // Nombre
		const span = document.createElement("span");

		if (VF_apodo) span.innerHTML += " (" + rclv.apodo + ")"; // Apodo
		else if (VF_diaDelAno) span.innerHTML += " (" + rclv.fechaDelAno.nombre + ")"; // Día del Año
		if (span.innerHTML) primeraLinea.appendChild(span);
		anchor.appendChild(primeraLinea);

		// Genera la información - 2a línea
		const segundaLinea = document.createElement("p");
		if (VF_epoca) segundaLinea.innerHTML += rclv.epocaOcurrenciaNombre;
		segundaLinea.innerHTML += rclv.anoNacim ? rclv.anoNacim : rclv.anoComienzo ? rclv.anoComienzo : ""; // Año de Nacimiento o Comienzo
		if (VF_canon) segundaLinea.innerHTML += (segundaLinea.innerHTML ? " - " : "") + rclv.canonNombre; // Proceso de canonización
		if (VF_rolIglesia) segundaLinea.innerHTML += (segundaLinea.innerHTML ? " - " : "") + rclv.rolIglesiaNombre; // Rol en la Iglesia
		anchor.appendChild(segundaLinea);

		// Fin
		celda.appendChild(anchor);
		return celda;
	},
	prod: (producto) => {
		// Variables
		const celda = document.createElement("td");
		const anchor = document.createElement("a");
		anchor.href = "/producto/detalle/?entidad=" + producto.entidad + "&id=" + producto.id + "&origen=CN";
		anchor.target = "_blank";
		let span;

		// Obtiene el rclv
		const agregarRCLV = v.entidad == "productos" && !v.ordenPorEntBD.boton;
		if (agregarRCLV) {
			let rclv = agregarRCLV ? auxiliares.obtieneElRCLV(producto) : "";
			if (rclv) {
				rclv = " (" + rclv.innerHTML + ")";
				span = document.createElement("span");
				span.innerHTML = rclv;
			}
		}

		// Genera el resto del contenido
		const primeraLinea = document.createElement("p");
		primeraLinea.innerHTML = producto.nombreCastellano;
		if (span) primeraLinea.appendChild(span);
		const segundaLinea = document.createElement("p");
		segundaLinea.innerHTML = producto.anoEstreno + " - " + producto.entidadNombre + " - Dirección: " + producto.direccion;

		// Le agrega el contenido
		anchor.appendChild(primeraLinea);
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
};
