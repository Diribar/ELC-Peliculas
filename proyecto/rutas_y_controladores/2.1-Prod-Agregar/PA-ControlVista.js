"use strict";
// Definir funciones
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./PA-FN-Procesos");
const valida = require("./PA-FN-Validar");

module.exports = {
	palabrasClave: {
		form: async (req, res) => {
			// Tema y Código
			const tema = "prodAgregar";
			const codigo = "palabrasClave";

			// Obtiene el Data Entry de session y cookies
			const palabrasClave = req.session.palabrasClave ? req.session.palabrasClave : req.cookies.palabrasClave;

			// Render del formulario
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo: "Agregar - Palabras Clave"},
				dataEntry: {palabrasClave},
			});
		},
		guardar: async (req, res) => {
			// Elimina los campos vacíos y pule los espacios innecesarios
			for (let campo in req.body) if (!req.body[campo]) delete req.body[campo];
			for (let campo in req.body) req.body[campo] = req.body[campo].trim();

			// Obtiene el Data Entry
			const palabrasClave = req.body.palabrasClave;

			// Guarda el Data Entry en session y cookie de palabrasClave
			req.session.palabrasClave = palabrasClave;
			res.cookie("palabrasClave", palabrasClave, {maxAge: unDia});

			// Si hay errores de validación, redirecciona
			const errores = valida.palabrasClave(palabrasClave);
			if (errores.hay) return res.redirect(req.originalUrl);

			// Guarda el Data Entry en session y cookie de desambiguar
			req.session.desambiguar = {palabrasClave};
			res.cookie("desambiguar", {palabrasClave}, {maxAge: unDia});

			// Redirecciona a la siguiente instancia
			return res.redirect("desambiguar");
		},
	},
	desambiguar: async (req, res) => {
		// Tema y Código
		const tema = "prodAgregar";
		const codigo = "desambiguar";

		// Si no existe el cookie, redirecciona
		const desambiguar = req.session.desambiguar ? req.session.desambiguar : req.cookies.desambiguar;
		if (!desambiguar) return res.redirect("palabras-clave");

		// Se asegura de que exista el session
		if (!req.session.desambiguar) req.session.desambiguar = desambiguar;

		// Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Desambiguar",
			palabrasClave: desambiguar.palabrasClave,
			omitirImagenDerecha: true,
		});
	},
	datosDuros: {
		form: async (req, res) => {
			// Tema y Código
			const tema = "prodAgregar";
			const codigo = "datosDuros";

			// Obtiene el Data Entry de session y cookies
			const datosDuros = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;

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
			const errores = await valida.datosDuros(camposDD_nombre, datosDuros);

			// Variables
			const camposInput = camposDD.filter((n) => n.campoInput);
			const paisesNombre = datosDuros.paises_id ? comp.paises_idToNombre(datosDuros.paises_id) : [];
			const paisesTop5 = [...paises].sort((a, b) => b.cantProds - a.cantProds).slice(0, 5); // 'paises' va entre corchetes, para no alterar su orden

			// Imagen derecha
			const imgDerPers = datosDuros.avatar
				? "/externa/9-Provisorio/" + datosDuros.avatar
				: datosDuros.avatarUrl
				? datosDuros.avatarUrl
				: "/publico/imagenes/Avatar/Sin-Avatar.jpg";

			// Datos para la vista
			const origen =
				req.session.FA || req.cookies.FA
					? "ingreso-fa"
					: req.session.IM || req.cookies.IM
					? "ingreso-manual"
					: "desambiguar";
			// Render del formulario

			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo: "Agregar - Datos Duros", origen},
				...{dataEntry: datosDuros, imgDerPers, errores},
				camposInput1: camposInput.filter((n) => n.antesDePais),
				camposInput2: camposInput.filter((n) => !n.antesDePais),
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
			for (let campo in datosDuros) if (!datosDuros[campo]) delete datosDuros[campo];
			for (let campo in datosDuros) if (typeof datosDuros[campo] == "string") datosDuros[campo] = datosDuros[campo].trim();

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
			let errores = await valida.datosDuros(camposDD_nombre, datosDuros);
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
				const epocaEstreno_id = comp.obtieneLaEpocaDeEstreno(anoEstreno); // Se debe agregar en el original
				let datosOriginales = req.session.datosOriginales ? req.session.datosOriginales : req.cookies.datosOriginales;

				// Se consolida la información
				datosOriginales = {...datosOriginales, nombreOriginal, nombreCastellano, anoEstreno, epocaEstreno_id, sinopsis}; // No se guarda nada en el avatar, para revisarlo en Revisión

				// Se guarda la cookie
				res.cookie("datosOriginales", datosOriginales, {maxAge: unDia});
			}

			// Redirecciona a la siguiente instancia
			return res.redirect("datos-adicionales");
		},
	},
	datosAdics: {
		form: async (req, res) => {
			// Tema y Código
			const tema = "prodAgregar";
			const codigo = "datosAdics";
			const userID = req.session.usuario.id;

			// Prepara variables para la vista
			// Obtiene el Data Entry de session y cookies
			const datosAdics = req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics;
			const camposDA = await variables.camposDA_conValores(userID);
			const camposDE = Object.keys(datosAdics);

			// Grupos RCLV
			const gruposPers = procsCRUD.grupos.pers(camposDA);
			const gruposHechos = procsCRUD.grupos.hechos(camposDA);

			// Imagen derecha
			const imgDerPers = datosAdics.avatar ? "/externa/9-Provisorio/" + datosAdics.avatar : datosAdics.avatarUrl;

			// Render del formulario
			return res.render("CMP-0Estructura", {
				...{tema, codigo, titulo: "Agregar - Datos Personalizados"},
				...{dataEntry: datosAdics, imgDerPers, camposDA, camposDE},
				...{gruposPers, gruposHechos},
			});
		},
		guardar: async (req, res) => {
			// Obtiene el Data Entry de session y cookies
			let datosAdics = req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics;

			// Obtiene los datosAdics
			delete datosAdics.sinRCLV;
			datosAdics = {...datosAdics, ...req.body};

			// Elimina los campos vacíos y pule los espacios innecesarios
			for (let campo in datosAdics)
				!datosAdics[campo]
					? delete datosAdics[campo] // elimina los campos vacíos
					: typeof datosAdics[campo] == "string"
					? (datosAdics[campo] = datosAdics[campo].trim()) // pule los espacios innecesarios
					: null;

			// Procesa algunos datos
			datosAdics = procesos.datosAdics.quitaCamposRCLV(datosAdics);
			datosAdics.actores = procesos.datosAdics.valorParaActores(datosAdics);

			// Guarda el data entry en session y cookie
			req.session.datosAdics = datosAdics;
			res.cookie("datosAdics", req.session.datosAdics, {maxAge: unDia});

			// Si hay errores de validación, redirecciona
			let camposDA = variables.camposDA.map((m) => m.nombre);
			let errores = await valida.datosAdics(camposDA, datosAdics);
			if (errores.hay) return res.redirect(req.originalUrl);

			// Guarda el data entry en session y cookie para el siguiente paso
			req.session.confirma = req.session.datosAdics;
			res.cookie("confirma", req.session.confirma, {maxAge: unDia});
			res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});

			// Redirecciona a la siguiente instancia
			return res.redirect("confirma");
		},
	},
	confirma: {
		form: (req, res) => {
			// Tema y Código
			const tema = "prodAgregar";
			const codigo = "confirma";
			let maximo;

			// Obtiene el Data Entry de session y cookies
			let confirma = req.session.confirma ? req.session.confirma : req.cookies.confirma;

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
			let imgDerPers = confirma.avatar ? "/externa/9-Provisorio/" + confirma.avatar : confirma.avatarUrl;

			// Render del formulario
			return res.render("CMP-0Estructura", {
				tema,
				codigo,
				titulo: "Agregar - Confirma",
				dataEntry: confirma,
				direccion,
				actores,
				imgDerPers,
				tituloImgDerPers: confirma.nombreCastellano,
			});
		},
		guardar: async (req, res) => {
			// Variables
			const userID = req.session.usuario.id;
			const entidad = req.cookies.datosOriginales.entidad;

			// Obtiene el Data Entry de session y cookies
			const confirma = req.session.confirma ? req.session.confirma : req.cookies.confirma;

			// Si se eligió algún RCLV que no existe, vuelve a la instancia anterior
			if (!confirma.sinRCLV) {
				const {existe, epocaOcurrencia_id} = await procesos.confirma.verificaQueExistanLosRCLV(confirma);
				if (!existe) return res.redirect("datos-adicionales");
				else confirma.epocaOcurrencia_id = epocaOcurrencia_id;
			}
			// ORIGINAL ------------------------------------
			// Guarda el registro original
			const original = {...req.cookies.datosOriginales, creadoPor_id: userID, statusSugeridoPor_id: userID};
			const registro = await BD_genericas.agregaRegistro(entidad, original);

			// CAPÍTULOS -----------------------------------
			// Si es una "collection" o "tv" (TMDB), agrega los capítulos en forma automática (no hace falta esperar a que concluya)
			// No se guardan los datos editados, eso se realiza en la revisión
			if (confirma.fuente == "TMDB") {
				if (confirma.TMDB_entidad == "collection")
					procesos.confirma.agregaCaps_Colec({...registro, capitulosID_TMDB: confirma.capitulosID_TMDB});
				if (confirma.TMDB_entidad == "tv") procesos.confirma.agregaTemps_TV({...registro, cantTemps: confirma.cantTemps});
			}

			// AVATAR -------------------------------------
			// Acciones para el avatar
			if (!confirma.avatar) {
				// Descarga el avatar en la carpeta 'Prods-Revisar'
				confirma.avatar = Date.now() + path.extname(confirma.avatarUrl);
				let rutaYnombre = carpetaExterna + "2-Productos/Revisar/" + confirma.avatar;
				comp.gestionArchivos.descarga(confirma.avatarUrl, rutaYnombre); // No hace falta el 'await', el proceso no espera un resultado
			}
			// Si ya se había descargado el avatar (IM), lo mueve de 'provisorio' a 'revisar'
			else comp.gestionArchivos.mueveImagen(confirma.avatar, "9-Provisorio", "2-Productos/Revisar");

			// EDICION -------------------------------------
			// Guarda los datos de 'edición' - es clave escribir "edicion" así, para que la función no lo cambie
			await procsCRUD.guardaActEdicCRUD({original: {...registro}, edicion: {...confirma}, entidad, userID});

			// RCLV
			// Actualiza prodsAprob en RCLVs <-- esto tiene que estar después del guardado de la edición
			if (confirma.personaje_id || confirma.hecho_id || confirma.tema_id)
				procsCRUD.revisiones.accionesPorCambioDeStatus(entidad, registro);
			// No es necesario el 'await', el proceso no necesita ese resultado

			// SESSION Y COOKIES
			// Establece como vista anterior la vista del primer paso
			req.session.urlActual = "/";
			res.cookie("urlActual", "/", {maxAge: unDia});
			// Elimina todas las session y cookie del proceso AgregarProd
			procesos.borraSessionCookies(req, res, "borrarTodo");
			// Crea la cookie para 'Terminaste' para la vista siguiente
			const terminaste = {entidad, id: registro.id};
			req.session.terminaste = terminaste;
			res.cookie("terminaste", terminaste, {maxAge: unDia});

			// REDIRECCIONA --> es necesario que sea una nueva url, para que no se pueda recargar el post de 'guardar'
			return res.redirect("terminaste");
		},
	},
	terminaste: async (req, res) => {
		// Tema y Código
		const tema = "prodAgregar";
		const codigo = "terminaste";
		// Obtiene el Data Entry de session y cookies
		const terminaste = req.session.terminaste ? req.session.terminaste : req.cookies.terminaste;
		// Borra 'session' y 'cookie' para que no se pueda recargar la página
		delete req.session.terminaste;
		res.clearCookie("terminaste");
		// Si se perdió la info, redirige a 'palabras clave'
		if (!terminaste) return res.redirect("palabras-clave");
		// Obtiene los datos clave del producto
		const {entidad, id} = terminaste;
		// Obtiene los demás datos del producto
		const registroProd = await BD_genericas.obtienePorIdConInclude(entidad, id, "statusRegistro");
		// Obtiene el nombre del producto
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		// Prepara la información sobre las imágenes de MUCHAS GRACIAS
		const carpetaMG = "Muchas-gracias/";
		const imagenMG = "/publico/imagenes/" + carpetaMG + comp.gestionArchivos.imagenAlAzar(carpetaMG);
		// Imagen derecha
		let imgDerPers = procsCRUD.obtieneAvatar(registroProd);
		imgDerPers = registroProd.avatar ? imgDerPers.orig : imgDerPers.edic;
		// Render del formulario
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo: "Agregar - Terminaste", imagenMG},
			...{entidad, familia: "producto", id, dataEntry: registroProd, entidadNombre, ruta: "/producto/"},
			...{imgDerPers, tituloImgDerPers: registroProd.nombreCastellano, status_id: creado_id},
		});
	},

	// Ingresos Manuales
	IM: {
		form: async (req, res) => {
			// Tema y Código
			const tema = "prodAgregar";
			const codigo = "IM";

			// Obtiene el Data Entry de session y cookies
			let IM = req.session.IM ? req.session.IM : req.cookies.IM;

			// Datos para la vista
			let entidades = [
				{codigo: "peliculas", nombre: "Películas"},
				{codigo: "colecciones", nombre: "Colecciones"},
				{codigo: "capitulos", nombre: "Capítulo de una colección"},
			];

			// Render del formulario
			return res.render("CMP-0Estructura", {
				tema,
				codigo,
				titulo: "Agregar - Tipo de Producto",
				dataEntry: IM,
				autorizadoFA: req.session.usuario.autorizadoFA,
				entidades,
				urlActual: req.session.urlActual,
			});
		},
		guardar: async (req, res) => {
			// 1. Prepara los datos y los guarda en 'session' y 'cookie'
			let IM = {
				...req.body,
				...req.query,
				entidadNombre: comp.obtieneDesdeEntidad.entidadNombre(req.body.entidad),
			};
			IM.fuente = IM.ingreso_fa ? "FA" : "IM";

			// Copia session y cookie
			req.session.IM = IM;
			res.cookie("IM", IM, {maxAge: unDia});

			// 2. Si hay errores de validación, redirecciona al Form
			let errores = await valida.IM(IM);
			if (errores.hay) return res.redirect(req.baseUrl + req.path); // No se puede usar 'req.originalUrl' porque en el query tiene la alusión a FA

			// Guarda en 'cookie' de datosOriginales
			res.cookie("datosOriginales", IM, {maxAge: unDia});

			// Guarda en 'session' y 'cookie' del siguiente paso
			let sigPaso = IM.ingreso_fa ? {codigo: "FA", url: "/ingreso-fa"} : {codigo: "datosDuros", url: "/datos-duros"};
			req.session[sigPaso.codigo] = IM;
			res.cookie(sigPaso.codigo, IM, {maxAge: unDia});

			// Redirecciona a la siguiente instancia
			const {baseUrl} = comp.reqBasePathUrl(req);
			return res.redirect(baseUrl + sigPaso.url);
		},
	},
	copiarFA: {
		form: async (req, res) => {
			// Variables
			const tema = "prodAgregar";
			const codigo = "FA";
			const FA = req.session.FA ? req.session.FA : req.cookies.FA;

			// Fin
			return res.render("CMP-0Estructura", {
				tema,
				codigo,
				titulo: "Agregar - Copiar FA",
				dataEntry: FA,
			});
		},
		guardar: async (req, res) => {
			// Obtiene el Data Entry de session y cookies y actualiza la información
			let FA = req.session.FA ? req.session.FA : req.cookies.FA;

			// Actualiza la información
			FA = {...FA, ...req.body};

			// Elimina los campos vacíos y pule los espacios innecesarios
			for (let campo in FA) if (!FA[campo]) delete FA[campo];
			for (let campo in FA) if (typeof FA[campo] == "string") FA[campo] = FA[campo].trim();

			// Actualiza Session y Cookies FA
			req.session.FA = FA;
			res.cookie("FA", FA, {maxAge: unDia});

			// Si hay errores de validación, redirecciona
			let errores = valida.FA(FA);
			if (errores.hay) return res.redirect(req.originalUrl);

			// Actualiza Session y Cookies de datosDuros
			const datosDuros = {...procesos.FA.infoFAparaDD(FA), avatarUrl: FA.avatarUrl};
			req.session.datosDuros = datosDuros;
			res.cookie("datosDuros", datosDuros, {maxAge: unDia});

			// Actualiza datosOriginales con FA_id
			const FA_id = datosDuros.FA_id;
			const datosOriginales = {...req.cookies.datosOriginales, FA_id};
			res.cookie("datosOriginales", datosOriginales, {maxAge: unDia});

			// Redirecciona a la siguiente instancia
			return res.redirect("datos-duros");
		},
	},
};
