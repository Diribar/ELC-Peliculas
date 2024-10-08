"use strict";
// Variables
const procsFM = require("../2.0-Familias/FM-FN-Procesos");
const validacsFM = require("../2.0-Familias/FM-FN-Validar");
const valida = require("./PA-FN3-Validar");
const procesos = require("./PA-FN4-Procesos");

module.exports = {
	palabrasClave: {
		form: async (req, res) => {
			// Tema y Código
			const tema = "prodAgregar";
			const codigo = "palabrasClave";
			const titulo = "Agregar - Palabras Clave";

			// Obtiene el Data Entry de session y cookies
			const {palabrasClave} = req.session.palabrasClave ? req.session : req.cookies;

			// Variables para la vista
			const mensajesAyuda = [
				"Ingresá palabras del <b><u>Título de la Película</u></b>, en el idioma <b><em>original</em></b> o en <b><em>castellano</em></b>.",
				"Escribí de manera precisa todas las palabras que sepas.",
			];

			// Render del formulario
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, mensajesAyuda},
				dataEntry: {palabrasClave},
			});
		},
		guardar: async (req, res) => {
			// Elimina los campos vacíos y pule los espacios innecesarios
			for (let prop in req.body)
				if (!req.body[prop]) delete req.body[prop];
				else req.body[prop] = req.body[prop].trim();

			// Obtiene el Data Entry
			const {palabrasClave, metodo} = req.body;

			// Guarda el Data Entry en session y cookie de palabrasClave
			req.session.palabrasClave = palabrasClave;
			res.cookie("palabrasClave", palabrasClave, {maxAge: unDia});

			// Si hay errores de validación, redirecciona
			const errores = valida.palabrasClave(palabrasClave);
			if (errores.hay) return res.redirect(req.originalUrl);

			// Si corresponde, redirecciona a 'ingreso manual'
			if (metodo == "Ingr. Man.") return res.redirect("agregar-im");

			// Guarda el Data Entry en session y cookie de desambiguar
			req.session.desambiguar = {palabrasClave};
			res.cookie("desambiguar", {palabrasClave}, {maxAge: unDia});

			// Redirecciona a 'desambiguar'
			return res.redirect("agregar-ds");
		},
	},
	desambiguar: async (req, res) => {
		// Tema y Código
		const tema = "prodAgregar";
		const codigo = "desambiguar";
		const titulo = "Agregar - Desambiguar";

		// Si no existe el cookie, redirecciona
		const {desambiguar} = req.session.desambiguar ? req.session : req.cookies;

		// Se asegura de que exista el session
		if (!req.session.desambiguar) req.session.desambiguar = desambiguar;

		// Render del formulario
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo},
			palabrasClave: desambiguar.palabrasClave,
			omitirImagenDerecha: true,
		});
	},
	datosDuros: {
		form: async (req, res) => {
			// Tema y Código
			const tema = "prodAgregar";
			const codigo = "datosDuros";
			const titulo = "Agregar - Datos Duros";

			// Obtiene el Data Entry de session y cookies
			const {datosDuros} = req.session.datosDuros ? req.session : req.cookies;

			// Acciones si existe un valor para el campo 'avatar'
			if (datosDuros.avatar) {
				// Elimina 'avatarUrl' para que la vista permita ingresar otra imagen
				delete datosDuros.avatarUrl;

				// Actualiza session y cookie
				req.session.datosDuros = datosDuros;
				res.cookie("datosDuros", datosDuros, {maxAge: unDia});
			}

			// Obtiene los errores
			const camposDD = variables.camposDD.filter((n) => n[datosDuros.entidad] || n.productos);
			const camposDD_nombre = camposDD.map((n) => n.nombre);
			const errores = await validacsFM.validacs.datosDuros(camposDD_nombre, datosDuros);

			// Variables
			const camposInput = camposDD.filter((n) => n.campoInput);
			const paisesNombre = datosDuros.paises_id ? comp.paises_idToNombre(datosDuros.paises_id) : [];
			const paisesTop5 = [...paises].sort((a, b) => b.cantProds.cantidad - a.cantProds.cantidad).slice(0, 5); // 'paises' va entre corchetes, para no alterar su orden

			// Imagen derecha
			const imgDerPers = datosDuros.avatar
				? "/Externa/9-Provisorio/" + datosDuros.avatar
				: datosDuros.avatarUrl
				? datosDuros.avatarUrl
				: "/publico/imagenes/Avatar/Sin-Avatar.jpg";

			// Datos para la vista
			const origen =
				req.session.FA || req.cookies.FA
					? "agregar-fa"
					: req.session.IM || req.cookies.IM
					? "agregar-im"
					: "agregar-ds";
			const camposInput1 = camposInput.filter((n) => n.campoInput == 1);
			const camposInput2 = camposInput.filter((n) => n.campoInput == 2);

			// Render del formulario
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo, origen},
				...{dataEntry: datosDuros, imgDerPers, errores},
				...{camposInput1, camposInput2},
				...{paises, paisesTop5, paisesNombre, idiomas},
			});
		},
		guardar: async (req, res) => {
			// Actualiza datosDuros con la info ingresada. Si se ingresa manualmente un avatar, no lo incluye
			let datosDuros = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;

			// Acciones si existe un archivo avatar ingresado anteriormente y ahora se ingresó otro
			if (datosDuros.avatar && req.file) {
				comp.gestionArchivos.elimina(carpetaExterna + "9-Provisorio/", datosDuros.avatar);
				delete datosDuros.avatar;
			}

			// Actualiza la variable 'datosDuros'
			datosDuros = {...datosDuros, ...req.body};

			// Elimina los campos vacíos y pule los espacios innecesarios
			for (let prop in datosDuros)
				if (!datosDuros[prop]) delete datosDuros[prop];
				else if (typeof datosDuros[prop] == "string") datosDuros[prop] = datosDuros[prop].trim();

			// Acciones si se ingresó un archivo de imagen (IM)
			if (req.file) {
				// Obtiene la información sobre el avatar
				datosDuros.avatar = req.file.filename;
				datosDuros.tamano = req.file.size;
				datosDuros.avatarUrl = "Avatar ingresado manualmente en 'Datos Duros'";
			}

			// Guarda Session y Cookie de Datos Duros
			req.session.datosDuros = datosDuros;
			res.cookie("datosDuros", datosDuros, {maxAge: unDia});

			// Acciones si hay errores de validación
			let camposDD = variables.camposDD.filter((n) => n[datosDuros.entidad] || n.productos);
			let camposDD_nombre = camposDD.map((n) => n.nombre);
			let errores = await validacsFM.validacs.datosDuros(camposDD_nombre, datosDuros);
			if (errores.hay) return res.redirect(req.originalUrl);

			// Guarda session y cookie de Datos Adicionales
			const datosAdics = {...datosDuros};
			delete datosAdics.tamano;
			req.session.datosAdics = datosAdics;
			res.cookie("datosAdics", datosAdics, {maxAge: unDia});

			// Guarda session y cookie de Datos Originales
			if (datosDuros.fuente == "IM" || datosDuros.fuente == "FA") {
				// Variables
				const {nombreOriginal, nombreCastellano, anoEstreno, sinopsis} = datosDuros;
				const epocaEstreno_id = epocasEstreno.find((n) => n.desde <= Number(anoEstreno)).id; // se debe agregar en el original
				let datosOriginales = req.session.datosOriginales ? req.session.datosOriginales : req.cookies.datosOriginales;

				// Se consolida la información
				datosOriginales = {...datosOriginales, nombreOriginal, nombreCastellano, anoEstreno, epocaEstreno_id, sinopsis}; // No se guarda nada en el avatar, para revisarlo en Revisión

				// Se guarda la cookie
				res.cookie("datosOriginales", datosOriginales, {maxAge: unDia});
			}

			// Redirecciona a la siguiente instancia
			return res.redirect("agregar-da");
		},
	},
	datosAdics: {
		form: async (req, res) => {
			// Tema y Código
			const tema = "prodAgregar";
			const codigo = "datosAdics";
			const titulo = "Agregar - Datos Adicionales";
			const usuario_id = req.session.usuario.id;

			// Prepara variables para la vista
			const {datosAdics} = req.session.datosAdics ? req.session : req.cookies;
			const camposDA = await variables.camposDA_conValores(usuario_id);
			const camposChkBox = camposDA.filter((n) => n.chkBox && (!n.exclusivo || n.exclusivo.includes(datosAdics.entidad)));
			const camposDE = Object.keys(datosAdics);

			// Grupos RCLV
			const gruposPers = procsFM.grupos.pers(camposDA);
			const gruposHechos = procsFM.grupos.hechos(camposDA);

			// Datos para la vista
			const imgDerPers = datosAdics.avatar ? "/Externa/9-Provisorio/" + datosAdics.avatar : datosAdics.avatarUrl;
			const ayudas = procesos.datosAdics.ayudas;

			// Render del formulario
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo},
				...{dataEntry: datosAdics, imgDerPers, camposDA, camposDE, camposChkBox},
				...{gruposPers, gruposHechos, ayudas},
			});
		},
		guardar: async (req, res) => {
			// Obtiene el Data Entry de session y cookies
			let datosAdics = req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics;

			// Obtiene los datosAdics
			delete datosAdics.sinRCLV;
			datosAdics = {...datosAdics, ...req.body};

			// Elimina los campos vacíos y pule los espacios innecesarios
			for (let prop in datosAdics)
				!datosAdics[prop]
					? delete datosAdics[prop] // elimina los campos vacíos
					: typeof datosAdics[prop] == "string"
					? (datosAdics[prop] = datosAdics[prop].trim()) // pule los espacios innecesarios
					: null;

			// Procesa algunos datos
			datosAdics = procesos.datosAdics.valsCheckBtn(datosAdics);
			datosAdics = procesos.datosAdics.quitaCamposRCLV(datosAdics);
			datosAdics.actores = procesos.datosAdics.valorParaActores(datosAdics);

			// Guarda el data entry en session y cookie
			req.session.datosAdics = datosAdics;
			res.cookie("datosAdics", req.session.datosAdics, {maxAge: unDia});

			// Si hay errores de validación, redirecciona
			let camposDA = variables.camposDA.map((m) => m.nombre);
			let errores = await validacsFM.validacs.datosAdics(camposDA, datosAdics);
			if (errores.hay) return res.redirect(req.originalUrl);

			// Guarda el data entry en session y cookie para el siguiente paso
			req.session.confirma = req.session.datosAdics;
			res.cookie("confirma", req.session.confirma, {maxAge: unDia});
			res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});

			// Redirecciona a la siguiente instancia
			return res.redirect("agregar-cn");
		},
	},
	confirma: {
		form: (req, res) => {
			// Tema y Código
			const tema = "prodAgregar";
			const codigo = "confirma";
			const titulo = "Agregar - Confirma";
			let maximo;

			// Obtiene el Data Entry de session y cookies
			let {confirma} = req.session.confirma ? req.session : req.cookies;

			// Datos de la producción
			maximo = 50;
			let direccion = confirma.direccion;
			if (direccion.length > maximo) {
				direccion = direccion.slice(0, maximo);
				if (direccion.includes(",")) direccion = direccion.slice(0, direccion.lastIndexOf(","));
			}

			// Datos de la actuación
			maximo = 170;
			let actores = confirma.actores;
			if (actores.length > maximo) {
				actores = actores.slice(0, maximo);
				if (actores.includes(",")) actores = actores.slice(0, actores.lastIndexOf(","));
			}

			// Imagen derecha
			let imgDerPers = confirma.avatar ? "/Externa/9-Provisorio/" + confirma.avatar : confirma.avatarUrl;

			// Render del formulario
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo},
				...{dataEntry: confirma, direccion, actores, imgDerPers},
				tituloImgDerPers: confirma.nombreCastellano,
			});
		},
		guardar: async (req, res) => {
			// Variables
			const usuario_id = req.session.usuario.id;

			// Obtiene el Data Entry de session y cookies
			const {confirma} = req.session.confirma ? req.session : req.cookies;
			const entidad = confirma.entidad;

			// Si se eligió algún RCLV que no existe, vuelve a la instancia anterior
			if (!confirma.sinRCLV) {
				const {existe, epocaOcurrencia_id} = await procesos.confirma.verificaQueExistanLosRCLV(confirma);
				if (!existe) return res.redirect("agregar-da");
				else confirma.epocaOcurrencia_id = epocaOcurrencia_id;
			}

			// Guarda el registro original
			const original = {...req.cookies.datosOriginales, creadoPor_id: usuario_id, statusSugeridoPor_id: usuario_id};
			const registro = await baseDeDatos.agregaRegistro(entidad, original);

			// Si es una "collection" o "tv" (TMDB), agrega los capítulos en forma automática (no hace falta esperar a que concluya). No se guardan los datos editados, eso se realiza en la revisión
			if (confirma.fuente == "TMDB") {
				if (confirma.TMDB_entidad == "collection")
					procesos.confirma.agregaCaps_Colec({...registro, capsTMDB_id: confirma.capsTMDB_id});
				if (confirma.TMDB_entidad == "tv") procesos.confirma.agregaTemps_TV({...registro, cantTemps: confirma.cantTemps});
			}

			// Avatar - acciones si no se descargó (sólo para la mayoría de los TMDB y los FA)
			if (!confirma.avatar) {
				// Descarga el avatar en la carpeta 'Prods-Revisar'
				confirma.avatar = Date.now() + path.extname(confirma.avatarUrl);
				let rutaYnombre = carpetaExterna + "2-Productos/Revisar/" + confirma.avatar;
				comp.gestionArchivos.descarga(confirma.avatarUrl, rutaYnombre); // No hace falta el 'await', el proceso no espera un resultado
			}
			// Avatar - si ya se había descargado el avatar (IM y algunos TMDB), lo mueve de 'provisorio' a 'revisar'
			else comp.gestionArchivos.mueveImagen(confirma.avatar, "9-Provisorio", "2-Productos/Revisar");

			// Guarda los datos de 'edición' - es clave escribir "edicion" así, para que la función no lo cambie
			await procsFM.guardaActEdic({original: {...registro}, edicion: {...confirma}, entidad, usuario_id});

			// RCLV - actualiza prodsAprob en RCLVs <-- esto tiene que estar después del guardado de la edición
			if (confirma.personaje_id || confirma.hecho_id || confirma.tema_id)
				validacsFM.accionesPorCambioDeStatus(entidad, registro); // No es necesario el 'await', el proceso no necesita ese resultado

			// SESSION Y COOKIES - Establece como vista anterior la vista del primer paso
			req.session.urlActual = "/";
			res.cookie("urlActual", "/", {maxAge: unDia});

			// SESSION Y COOKIES - Elimina todas las session y cookie del proceso AgregarProd
			procesos.borraSessionCookies(req, res, "borrarTodo");

			// SESSION Y COOKIES - Crea la cookie 'Terminaste' para la vista siguiente
			const terminaste = {entidad, id: registro.id};
			req.session.terminaste = terminaste;
			res.cookie("terminaste", terminaste, {maxAge: unDia});

			// REDIRECCIONA --> es necesario que sea una nueva url, para que no se pueda recargar el post de 'guardar'
			return res.redirect("agregar-tr");
		},
	},
	terminaste: async (req, res) => {
		// Tema y Código
		const tema = "prodAgregar";
		const codigo = "terminaste";
		const titulo = "Agregar - Terminaste";
		const usuario_id = req.session.usuario.id;

		// Si se perdió la info, redirige a 'palabras clave'
		const {terminaste} = req.session.terminaste ? req.session : req.cookies;
		delete req.session.terminaste;
		res.clearCookie("terminaste");

		// Obtiene los datos del producto
		const {entidad, id} = terminaste;
		const [original, edicion] = await procsFM.obtieneOriginalEdicion({entidad, entId: id, usuario_id, excluirInclude: true});
		const origEdic = {...original, ...edicion, id: original.id};

		// Prepara las imágenes
		const carpetaMG = "/publico/imagenes/Muchas-gracias/";
		const imagenMG = carpetaMG + comp.gestionArchivos.imagenAlAzar("." + carpetaMG);
		const imgDerPers = procsFM.obtieneAvatar(original, edicion).orig;

		// Prepara variables para la vista
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		const tituloImgDerPers = origEdic.nombreCastellano;
		const agregaste = true;

		// Render del formulario
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, imagenMG, agregaste},
			...{entidad, familia: "producto", id, dataEntry: origEdic, entidadNombre},
			...{imgDerPers, tituloImgDerPers, status_id: creado_id},
		});
	},

	// Ingresos Manuales
	IM: {
		form: async (req, res) => {
			// Variables
			const tema = "prodAgregar";
			const codigo = "IM";
			const titulo = "Agregar - Tipo de Producto";

			// Entidades
			const {prodsNombre, prods} = variables.entidades;
			let entidades = [];
			prods.forEach((prod, i) => entidades.push({codigo: prod, nombre: prodsNombre[i]}));

			// Obtiene el Data Entry de session y cookies
			let IM = req.session.IM ? req.session.IM : req.cookies.IM ? req.cookies.IM : {};
			if (req.query.entidad) IM.entidad = req.query.entidad;
			else if (IM.entidad) {
				// Crea la variable de destino
				let destino = req.originalUrl;
				const indice = destino.indexOf("?");
				if (indice > 0) destino = destino.slice(0, indice);
				if (destino.slice(-1) == "/") destino = destino.slice(0, -1);

				// Le agrega los parámetros
				destino += "/?entidad=" + IM.entidad;
				if (IM.entidad == "capitulos" && IM.coleccion_id) {
					destino += "&coleccion_id=" + IM.coleccion_id;
					if (IM.temporada) {
						destino += "&temporada=" + IM.temporada;
						if (IM.capitulo) {
							const {coleccion_id, temporada, capitulo} = IM;
							if (await baseDeDatos.obtienePorCondicion("capitulos", {coleccion_id, temporada, capitulo})) {
								IM.capitulo++;
								destino += "&capitulo=" + IM.capitulo;
							}
						}
					}
				}

				// Fin
				return res.redirect(destino);
			}

			// Render del formulario
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo},
				...{entidades, dataEntry: IM},
				...{autorizadoFA: req.session.usuario.autorizadoFA, urlActual: req.session.urlActual},
			});
		},
		guardar: async (req, res) => {
			// Prepara los datos y los guarda en 'session' y 'cookie'
			let IM = {...req.body, entidadNombre: comp.obtieneDesdeEntidad.entidadNombre(req.body.entidad)};
			if (req.query.ingreso_fa) IM.fuente = "FA";
			else IM = {...IM, fuente: "IM", imgOpcional: "NO"};

			// Copia session y cookie
			req.session.IM = IM;
			res.cookie("IM", IM, {maxAge: unDia});

			// Si hay errores de validación, redirecciona al Form
			let errores = await valida.IM(IM);
			if (errores.hay) return res.redirect(req.baseUrl + req.path); // No se puede usar 'req.originalUrl' porque en el query tiene la alusión a FA

			// Acciones si es un capítulo
			if (IM.entidad == "capitulos") {
				// Genera información a guardar
				const usuario_id = req.session.usuario.id;
				IM.creadoPor_id = usuario_id;
				IM.statusSugeridoPor_id = usuario_id;

				// Acciones si es un 'IM'
				if (IM.fuente == "IM") return accionesParaCapitulosIMFA(IM, req, res);
			}

			// Si no es un capítulo, guarda en 'cookie' de datosOriginales
			else res.cookie("datosOriginales", IM, {maxAge: unDia});

			// Guarda en 'session' y 'cookie' del siguiente paso
			const sigPaso = IM.fuente == "FA" ? {codigo: "FA", url: "agregar-fa"} : {codigo: "datosDuros", url: "agregar-dd"};
			req.session[sigPaso.codigo] = IM;
			res.cookie(sigPaso.codigo, IM, {maxAge: unDia});

			// Redirecciona a la siguiente instancia
			return res.redirect(sigPaso.url);
		},
	},
	FA: {
		form: async (req, res) => {
			// Variables
			const tema = "prodAgregar";
			const codigo = "FA";
			const titulo = "Agregar - Copiar FA";
			const dataEntry = req.session.FA ? req.session.FA : req.cookies.FA;

			// Fin
			return res.render("CMP-0Estructura", {tema, codigo, titulo, dataEntry});
		},
		guardar: async (req, res) => {
			// Obtiene el Data Entry de session y cookies y actualiza la información
			let FA = req.session.FA ? req.session.FA : req.cookies.FA;

			// Actualiza la información
			FA = {...FA, ...req.body};

			// Elimina los campos vacíos y pule los espacios innecesarios
			for (let prop in FA)
				if (!FA[prop]) delete FA[prop];
				else if (typeof FA[prop] == "string") FA[prop] = FA[prop].trim();

			// Actualiza Session y Cookies FA
			req.session.FA = FA;
			res.cookie("FA", FA, {maxAge: unDia});

			// Si hay errores de validación, redirecciona
			let errores = valida.FA(FA);
			if (errores.hay) return res.redirect(req.originalUrl);

			// Procesa la información
			let datosDuros = {...procesos.FA.infoFAparaDD(FA), ...FA};
			delete datosDuros.url;
			delete datosDuros.contenido;

			// Acciones si es un capítulo
			if (datosDuros.entidad == "capitulos") {
				// Descarga el avatar en la carpeta 'Prods-Revisar'
				datosDuros.avatar = Date.now() + path.extname(FA.avatarUrl);
				let rutaYnombre = carpetaExterna + "2-Productos/Revisar/" + datosDuros.avatar;
				await comp.gestionArchivos.descarga(FA.avatarUrl, rutaYnombre);

				// Guarda el original
				return accionesParaCapitulosIMFA(datosDuros, req, res);
			}

			// Actualiza Session y Cookies de datosDuros
			req.session.datosDuros = datosDuros;
			res.cookie("datosDuros", datosDuros, {maxAge: unDia});

			// Actualiza datosOriginales con FA_id
			const FA_id = datosDuros.FA_id;
			const datosOriginales = {...req.cookies.datosOriginales, FA_id};
			res.cookie("datosOriginales", datosOriginales, {maxAge: unDia});

			// Redirecciona a la siguiente instancia
			return res.redirect("agregar-dd");
		},
	},
};
let accionesParaCapitulosIMFA = async (datos, req, res) => {
	// Compara su temporada vs la cant. de temps. en la colección
	const coleccion = await baseDeDatos.obtienePorId("colecciones", datos.coleccion_id);
	if (!coleccion.cantTemps || coleccion.cantTemps < Number(datos.temporada))
		await baseDeDatos.actualizaPorId("colecciones", datos.coleccion_id, {cantTemps: datos.temporada});

	// Si no existe 'nombreCastellano', le asigna uno
	if (!datos.nombreCastellano) datos.nombreCastellano = "Capítulo " + datos.capitulo;

	// Guarda el registro original
	const id = await baseDeDatos.agregaRegistro("capitulos", datos).then((n) => n.id);

	// Elimina todas las session y cookie del proceso AgregarProd
	procesos.borraSessionCookies(req, res, "IM");

	// Redirecciona a su edición
	return res.redirect("/capitulos/edicion/p/?id=" + id);
};
