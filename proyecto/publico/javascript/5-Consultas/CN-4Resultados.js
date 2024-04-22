"use strict";

let resultados = {
	obtiene: async function () {
		// Si no se cumplen las condiciones mínimas, termina la función
		if (!v.layout_id) return;

		// Oculta el contador y todos los carteles
		DOM.contadorDeProds.classList.add("ocultar");
		for (let cartel of DOM.carteles) cartel.classList.add("ocultar");

		// Tapa y limpia los resultados anteriores
		if (!v.mostrarCartelQuieroVer) DOM.esperandoResultados.classList.remove("ocultar");
		DOM.botones.innerHTML = "";
		DOM.listados.innerHTML = "";
		v.resultados = null;

		// Acciones si el usuario no está logueado y es requerido
		if (!v.userID && v.layoutBD.loginNeces) {
			DOM.loginNecesario.classList.remove("ocultar");
			DOM.esperandoResultados.classList.add("ocultar");
			return;
		}

		// Si la opción es 'misPrefs' y el usuario no tiene 'PPPs', muestra el cartel 'cartelOrdenPPP' y termina
		if (v.userID && v.layoutBD.codigo == "misPrefs" && !v.usuarioTienePPP) {
			DOM.cartelOrdenPPP.classList.remove("ocultar");
			DOM.esperandoResultados.classList.add("ocultar");
			return;
		}

		// Busca la información en el BE
		v.ahora = new Date();
		const datos = v.layoutBD.codigo.startsWith("fechaDelAno")
			? {...prefs, dia: v.ahora.getDate(), mes: v.ahora.getMonth() + 1}
			: prefs;
		v.resultados = await fetch(ruta + "obtiene-los-resultados/?datos=" + JSON.stringify(datos)).then((n) => n.json());
		DOM.esperandoResultados.classList.add("ocultar");

		// Acciones en consecuencia
		if (prefs.entidad == "productos") v.productos = v.resultados;
		if (!v.resultados || !v.resultados.length)
			DOM.noTenemos.classList.remove("ocultar"); // si no hay resultados, muestra el cartel 'noTenemos'
		else if (v.mostrarCartelQuieroVer) DOM.quieroVer.classList.remove("ocultar"); // si hay resultados, muestra el cartel 'quieroVer'

		// Contador
		if (v.resultados && !v.layoutBD.boton) this.contador();

		// Fin
		return;
	},
	// Contador para productos
	contador: () => {
		// Variables
		const total = v.resultados ? v.resultados.length : 0;

		// Contador para Productos
		if (v.entidad == "productos") {
			// Contador para vista 'botones'
			if (v.layoutBD.boton) return;

			// Contador para 'Todos los productos'
			DOM.contadorDeProds.innerHTML = total;
		}
		// Contador para RCLVs
		else {
			// Variables
			const cantRCLVs = total;
			let cantProds = 0;
			if (v.resultados) for (let rclv of v.resultados) cantProds += rclv.productos.length;

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
			if (!v.resultados || !v.resultados.length) return;

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
			v.layoutBD.boton ? this.botones() : this.listados();

			// Quita el cartel de 'esperandoResultados'
			DOM.esperandoResultados.classList.add("ocultar");

			// Carteles periódicos, con una frecuencia dada
			v.contadorDeMostrarResults++;
			if (v.userID && !v.videoConsVisto && v.contadorDeMostrarResults == 1) DOM.cartelVerVideo.classList.remove("ocultar"); // Si el usuario no vio el video, muestra el cartel 'ver video'
			if (!(v.contadorDeMostrarResults % 5)) {
				if (v.userID) {
					// Si el usuario no vio el video, muestra un cartel
					if (!v.videoConsVisto) DOM.cartelVerVideo.classList.remove("ocultar");
					// Si el usuario no tiene 'PPPs', muestra un cartel
					else if (!v.usuarioTienePPP) DOM.cartelUsSinPPP.classList.remove("ocultar");
				}
				// Si el usuario no está logueado, muestra un cartel
				else if (!v.userID) DOM.cartelLoginPend.classList.remove("ocultar");
			}

			// Fin
			return;
		},
		botones: () => {
			// Agrega el resultado al botón
			for (let resultado of v.resultados) {
				const boton = auxiliares.boton(resultado);
				DOM.botones.append(boton);
			}

			// Genera las variables 'ppp'
			if (v.layoutBD.codigo == "azar") {
				DOM.ppps = DOM.botones.querySelectorAll(".registro #ppp");
				v.ppps = Array.from(DOM.ppps);
			}

			// Foco en el primer botón
			DOM.botones.querySelector("button").focus();

			// Fin
			return;
		},
		listados: () => {
			// Variables
			v.productos = [];
			v.registroAnt = {};

			// Rutina por registro
			v.resultados.forEach((registro, indice) => {
				// Acumula los productos
				v.entidad == "productos"
					? v.productos.push(registro) // productos
					: v.productos.push(...registro.productos); // rclvs

				// Averigua si hay un cambio de agrupamiento
				const titulo = auxiliares.titulo(registro, indice);
				v.registroAnt = registro;

				// Si corresponde, crea una nueva tabla
				if (titulo) {
					DOM.tabla = auxiliares.creaUnaTabla({titulo, indice}); // Obtiene la tabla con los datos
					DOM.listados.appendChild(DOM.tabla); // La agrega a la vista
					DOM.tbody = DOM.tabla.querySelector("tbody"); // Selecciona el body para luego agregarle filas
				}

				// Agrega fila/s al 'tbody' de productos
				if (v.entidad == "productos") {
					const fila = auxiliares.creaUnaFilaDeProd({producto: registro, indice});
					DOM.tbody.appendChild(fila);
				}
				// Agrega fila/s al 'tbody' de rclv
				else {
					const filas = auxiliares.creaLasFilasDeUnRCLV({rclv: registro, indice});
					for (let fila of filas) DOM.tbody.appendChild(fila);
				}
			});

			// Crea variables DOM
			DOM.tables = DOM.listados.querySelectorAll("table");
			DOM.captions = DOM.listados.querySelectorAll("table caption");
			DOM.expandeContraes = DOM.listados.querySelectorAll("table caption .expandeContrae");
			DOM.tbodies = DOM.listados.querySelectorAll("table tbody");
			DOM.ppps = DOM.listados.querySelectorAll("table tbody #ppp");

			// Le agrega la cantidad de productos a cada encabezado
			for (let tabla of DOM.tables) {
				// Obtiene la cantidad de resultados
				const cantProds = tabla.querySelectorAll("tr td:last-of-type").length;

				// Lo agrega a la tabla
				const p = document.createElement("p");
				p.innerHTML = "(" + cantProds + ")";
				p.className = "hallazgos";
				tabla.querySelector("caption").appendChild(p);
			}

			// Crea variables 'v'
			v.ppps = Array.from(DOM.ppps);
			v.expandeContraes = Array.from(DOM.expandeContraes);
			v.captions = Array.from(DOM.captions);

			// Fin
			return;
		},
	},
};

let auxiliares = {
	boton: function (registro) {
		// Variables
		const familia = ["peliculas", "colecciones", "capitulos"].includes(registro.entidad) ? "producto" : "rclv";
		const esUnProducto = familia == "producto";

		// Crea el elemento 'li' que engloba todo el registro
		const li = document.createElement("li");
		li.className = "registro";
		li.tabIndex = "-1";

		// Crea el anchor
		const anchor = document.createElement("a");
		anchor.href = "/" + familia + "/detalle/?entidad=" + registro.entidad + "&id=" + registro.id;
		// anchor.target = "_blank";
		anchor.tabIndex = "-1";
		li.appendChild(anchor);

		// Crea el botón
		const button = document.createElement("button");
		button.type = "text";
		button.className = "flexRow pointer";
		if (registro.cfc) button.className += " cfc";
		anchor.appendChild(button);

		// Crea la imagen
		const avatar = document.createElement("img");
		const carpeta = esUnProducto ? "2-Productos" : "3-RCLVs";
		avatar.className = "imagenChica";
		avatar.src = registro.avatar
			? (!registro.avatar.includes("/") ? "/Externa/" + carpeta + "/Final/" : "") + registro.avatar
			: "/publico/imagenes/Avatar/Sin-Avatar.jpg";
		avatar.alt = esUnProducto ? registro.nombreCastellano : registro.nombre;
		avatar.title = esUnProducto ? registro.nombreCastellano : registro.nombre;
		button.appendChild(avatar);

		// Crea el sector de informacion
		const informacion = document.createElement("div");
		informacion.id = "informacion";
		informacion.className = "flexCol";
		button.appendChild(informacion);

		// Datos de un producto o rclv
		if (esUnProducto) this.datosProducto({informacion, producto: registro});
		if (!esUnProducto) this.datosRclv({informacion, rclv: registro});

		// Fin
		return li;
	},
	datosProducto: function ({informacion, producto}) {
		// Crea la infoSup
		const infoSup = document.createElement("div");
		infoSup.id = "infoSup";
		infoSup.className = "infoFormato";
		informacion.appendChild(infoSup);

		// Crea nombreCastellano, anoEstreno, direccion, ppp
		const elementos = ["nombreCastellano", "anoEstreno", "direccion", "ppp"];
		let aux = {};
		for (let elemento of elementos) {
			aux[elemento] = document.createElement(elemento != "ppp" ? "p" : "i");
			aux[elemento].id = elemento;
			aux[elemento].className = "interlineadoChico";
			infoSup.appendChild(aux[elemento]);
		}

		// Particularidades
		aux.nombreCastellano.innerHTML = producto.nombreCastellano;
		aux.anoEstreno.innerHTML = producto.anoEstreno + " - " + producto.entidadNombre;
		if (producto.ppp) {
			aux.ppp.className += " scale " + producto.ppp.icono;
			aux.ppp.tabIndex = "-1";
			aux.ppp.title = producto.ppp.nombre;
		}

		// Particularidades de Dirección
		const em = document.createElement("em");
		em.innerHTML = producto.direccion;
		aux.direccion.innerHTML = "Dirección: ";
		aux.direccion.appendChild(em);

		// Crea la infoInf
		const infoInf = document.createElement("div");
		infoInf.id = "infoInf";
		infoInf.className = "infoFormato";
		informacion.appendChild(infoInf);

		// Agrega el rclv en infoInf
		const rclv = this.obtieneElRCLV(producto);
		if (rclv) infoInf.appendChild(rclv);

		// Fin
		return;
	},
	datosRclv: function ({informacion, rclv}) {
		// Variables
		let elementos;

		// Crea la infoSup
		const infoSup = document.createElement("div");
		infoSup.id = "infoSup";
		infoSup.className = "infoFormato";
		informacion.appendChild(infoSup);

		// Crea nombreCastellano, anoEstreno, direccion, ppp
		elementos = ["nombre", "canonRol", "fechaDelAno"];
		let auxSup = {};
		for (let elemento of elementos) {
			if (elemento == "canonRol" && !rclv.canonNombre && !rclv.rolIglesiaNombre) continue;
			auxSup[elemento] = document.createElement("p");
			auxSup[elemento].id = elemento;
			auxSup[elemento].className = "interlineadoChico";
			infoSup.appendChild(auxSup[elemento]);
		}

		// Otras particularidades
		auxSup.nombre.innerHTML = rclv.nombre;
		if (rclv.canonNombre || rclv.rolIglesiaNombre) {
			auxSup.canonRol.innerHTML = "";
			if (rclv.canonNombre) auxSup.canonRol.innerHTML += rclv.canonNombre;
			if (rclv.canonNombre && rclv.rolIglesiaNombre) auxSup.canonRol.innerHTML += " - ";
			if (rclv.rolIglesiaNombre) auxSup.canonRol.innerHTML += rclv.rolIglesiaNombre;
		}
		auxSup.fechaDelAno.innerHTML = "Fecha: " + rclv.fechaDelAno;

		// Crea la infoInf
		const infoInf = document.createElement("div");
		infoInf.id = "infoInf";
		infoInf.className = "infoFormato";
		informacion.appendChild(infoInf);

		// Crea nombreCastellano, anoEstreno, direccion, ppp
		elementos = ["epocaOcurrencia", "anoOcurrencia", "productos"];
		let auxInf = {};
		for (let elemento of elementos) {
			if (!rclv[elemento]) continue;
			if (elemento == "epocaOcurrencia" && rclv.anoOcurrencia) continue; // si existe el año de ocurrencia, omite la época de ocurrencia
			auxInf[elemento] = document.createElement("p");
			auxInf[elemento].id = elemento;
			auxInf[elemento].className = "interlineadoChico";
			infoInf.appendChild(auxInf[elemento]);
		}

		// Contenido escrito
		if (auxInf.epocaOcurrencia) auxInf.epocaOcurrencia.innerHTML = rclv.epocaOcurrencia;
		if (rclv.anoOcurrencia)
			auxInf.anoOcurrencia.innerHTML = (rclv.entidad == "personajes" ? "Nacimiento: " : "Comienzo: ") + rclv.anoOcurrencia;
		auxInf.productos.innerHTML = "Películas: " + rclv.productos.length;

		// Fin
		return;
	},
	obtieneElRCLV: (producto) => {
		for (let rclvNombre of v.rclvsNombre)
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
	titulo: (registroAct, indice) => {
		// Variables
		const layout = v.layoutBD.codigo;
		let titulo = "";

		// Casos particulares
		if (layout.startsWith("fechaDelAno")) {
			// Variables
			const diaAnt = v.registroAnt.fechaDelAno_id;
			const diaActual = registroAct.fechaDelAno_id;

			// Resultado
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
		if (layout == "nombre") {
			// Variables
			const nombreAnt = v.registroAnt.nombre ? v.registroAnt.nombre : v.registroAnt.nombreCastellano;
			const nombreActual = registroAct.nombre ? registroAct.nombre : registroAct.nombreCastellano;
			const prefijo = "Rango ";

			// Resultado
			titulo =
				!nombreAnt && nombreActual < "G"
					? "A - F"
					: (!nombreAnt || nombreAnt < "G") && nombreActual >= "G" && nombreActual < "N"
					? "G - M"
					: (!nombreAnt || nombreAnt < "N") && nombreActual >= "N"
					? "N - Z"
					: "";

			// Fin
			if (titulo) titulo = prefijo + titulo;
		}
		if (layout == "anoOcurrencia") {
			// Variables
			const epocaAnt = v.registroAnt.epocaOcurrencia_id;
			const epocaActual = registroAct.epocaOcurrencia_id;
			const anoAnt = v.registroAnt.anoOcurrencia;
			const anoActual = registroAct.anoOcurrencia;

			// Resultado
			if (epocaActual == "pst") {
				// Variables
				const mayor1800 = "Año 1.801 en adelante";
				const mayor1000 = "Años 1.001 al 1.800";
				const menorIgual1000 = "Años 34 al 1.000";

				titulo =
					!anoAnt || anoAnt < anoActual // ascendente
						? (!anoAnt || anoAnt <= 1800) && anoActual > 1800
							? mayor1800
							: (!anoAnt || anoAnt <= 1000) && anoActual > 1000
							? mayor1000
							: !anoAnt
							? menorIgual1000
							: ""
						: anoActual <= 1000 && anoAnt > 1000 // descendente
						? menorIgual1000
						: anoActual <= 1800 && anoAnt > 1800
						? mayor1000
						: "";
			}
			// Épocas anteriores
			else if (epocaAnt != epocaActual) titulo = registroAct.epocaOcurrencia;
		}
		if (layout == "misCalificadas") {
			const califAnt = v.registroAnt.calificacion;
			const califActual = registroAct.calificacion;
			if (!califActual && (califAnt || !Object.keys(v.registroAnt))) titulo = "Vistas sin calificar";
			else if (!indice) titulo = "Mis calificadas";
		}
		// Cambio de grupo
		if (layout == "misPrefs") {
			// Variables
			const nombreAnt = v.registroAnt.ppp ? v.registroAnt.ppp.nombre : "";
			const nombreActual = registroAct.ppp.nombre;

			// Resultado
			if (nombreAnt != nombreActual) titulo = nombreActual;
		}
		if (layout == "anoEstreno") {
			// Variables
			const nombreAnt = v.registroAnt.epocaEstreno;
			const nombreActual = registroAct.epocaEstreno;

			// Resultado
			if (nombreAnt != nombreActual) titulo = nombreActual;
		}

		// Una sola tabla
		if (layout == "calificacion" && !indice) titulo = "Mejor calificadas";
		if (layout == "misConsultas" && !indice) titulo = "Mis consultas";
		if (layout == "altaRevisadaEn" && !indice) titulo = "Últimas ingresadas";

		// Fin
		return titulo;
	},
	creaUnaTabla: ({titulo, indice}) => {
		// Crea elementos de la tabla
		const tabla = document.createElement("table");
		const caption = document.createElement("caption");
		const tbody = document.createElement("tbody");

		// Formatos
		caption.className = "relative pointer";
		tbody.className = indice ? "ocultar" : "aparece";

		// Le agrega un título al encabezado
		const p = document.createElement("p");
		p.innerHTML = titulo;
		caption.appendChild(p);

		// Le agregas el -/+  al encabezado
		const i = document.createElement("i");
		i.className = "expandeContrae pointer fa-solid fa-square-" + (indice ? "plus" : "minus");
		caption.appendChild(i);

		// Fin
		tabla.appendChild(caption);
		tabla.appendChild(tbody);
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

		// Si se eligió una opción de 'calificadas', crea la celda correspondiente
		if (["calificacion", "misCalificadas"].includes(v.layoutBD.codigo) && producto.calificacion) {
			celda = creaUnaCelda.calificacion(producto);
			fila.appendChild(celda);
		}

		// Crea la celda del ppp y se la agrega a la fila
		if (v.userID) {
			celda = creaUnaCelda.ppp(producto);
			fila.appendChild(celda);
		}

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
};

let creaUnaCelda = {
	rclv: (rclv) => {
		// Variables
		const cantProds = rclv.productos.length;
		const celda = document.createElement("td");
		const anchor = document.createElement("a");
		anchor.href = "/rclv/detalle/?entidad=" + rclv.entidad + "&id=" + rclv.id;
		// anchor.target = "_blank";
		anchor.tabIndex = "-1";

		// Si tiene más de 1 producto
		if (cantProds > 1) celda.rowSpan = cantProds;

		// Genera la información - 1a línea
		const primeraLinea = document.createElement("p");
		primeraLinea.innerHTML = rclv.nombre; // Nombre
		const span = document.createElement("span");

		if (rclv.apodo) span.innerHTML += " (" + rclv.apodo + ")"; // Apodo
		if (span.innerHTML) primeraLinea.appendChild(span);
		anchor.appendChild(primeraLinea);

		// Genera la información - 2a línea - Fechas
		const segundaLinea = document.createElement("p");
		if (v.layoutBD.codigo == "fechaDelAnoListado") segundaLinea.innerHTML += rclv.fechaDelAno; // Día del Año
		else if (rclv.anoOcurrencia)
			segundaLinea.innerHTML += (rclv.entidad == "personajes" ? "Nacim.: " : "Comienzo: ") + rclv.anoOcurrencia;
		// Año de Nacimiento o Comienzo
		else if (rclv.epocaOcurrencia) segundaLinea.innerHTML += rclv.epocaOcurrencia;

		// Genera la información - 2a línea - Otros datos del personaje
		if (rclv.canonNombre) segundaLinea.innerHTML += (segundaLinea.innerHTML ? " - " : "") + rclv.canonNombre; // Proceso de canonización
		if (rclv.rolIglesiaNombre) segundaLinea.innerHTML += (segundaLinea.innerHTML ? " - " : "") + rclv.rolIglesiaNombre; // Rol en la Iglesia
		anchor.appendChild(segundaLinea);

		// Fin
		celda.appendChild(anchor);
		return celda;
	},
	prod: (producto) => {
		// Variables
		const celda = document.createElement("td");
		const anchor = document.createElement("a");
		anchor.href = "/producto/detalle/?entidad=" + producto.entidad + "&id=" + producto.id;
		// anchor.target = "_blank";
		let span;

		// Obtiene el rclv
		const agregarRCLV = v.entidad == "productos";
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

		// Acciones si el usuario está logueado
		if (v.userID) {
			// Crea el ppp
			const ppp = document.createElement("i");
			ppp.id = "ppp";
			ppp.classList.add("scale", ...producto.ppp.icono.split(" "));
			ppp.title = producto.ppp.nombre;

			// Lo agrega a la celda
			celda.appendChild(ppp);
		}

		// Fin
		return celda;
	},
	calificacion: (producto) => {
		// Variables
		const celda = document.createElement("td");
		celda.className = "calificacion";

		// Crea el contenido
		const contenido = document.createElement("p");
		contenido.innerHTML = producto.calificacion + "%";

		// Lo agrega a la celda
		celda.appendChild(contenido);

		// Fin
		return celda;
	},
};
