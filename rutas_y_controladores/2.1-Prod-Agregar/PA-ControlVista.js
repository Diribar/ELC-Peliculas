"use strict";
// Definir funciones
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/1-Procesos/Compartidas");
const variables = require("../../funciones/1-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./PA-FN-Procesos");
const valida = require("./PA-FN-Validar");

module.exports = {
	palabrasClaveForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "palabrasClave";
		// 2. Obtiene el Data Entry de session y cookies
		let palabrasClave = req.session.palabrasClave ? req.session.palabrasClave : req.cookies.palabrasClave;
		// 3. Render del formulario
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo: "Agregar - Palabras Clave"},
			dataEntry: {palabrasClave},
		});
	},
	palabrasClaveGuardar: async (req, res) => {
		// 1. Obtiene el Data Entry
		let palabrasClave = req.body.palabrasClave;
		// 2. Guarda el Data Entry en session y cookie
		req.session.palabrasClave = palabrasClave;
		res.cookie("palabrasClave", palabrasClave, {maxAge: unDia});
		// 3. Si hay errores de validación, redirecciona
		let errores = await valida.palabrasClave(palabrasClave);
		if (errores.hay) return res.redirect(req.path.slice(1));
		// 4. Redirecciona a la siguiente instancia
		return res.redirect("desambiguar");
	},
	desambiguarForm: async (req, res) => {
		// Tema y Código
		const tema = "prod_agregar";
		const codigo = "desambiguar";
		// 2. Obtiene el Data Entry de session y cookies
		let palabrasClave = req.session.palabrasClave ? req.session.palabrasClave : req.cookies.palabrasClave;
		if (!palabrasClave) return res.redirect("palabras-clave"); // Es distinto a los demás
		// Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Desambiguar",
			palabrasClave,
			omitirImagenDerecha: true,
			cartelGenerico: true,
		});
	},
	datosDurosForm: async (req, res) => {
		// Tema y Código
		const tema = "prod_agregar";
		const codigo = "datosDuros";
		// Obtiene el Data Entry de session y cookies
		const datosDuros = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;
		// Si existe un valor para el campo 'avatarBorrar' elimina el archivo descargado
		if (datosDuros.avatarBorrar) comp.gestionArchivos.elimina("./publico/imagenes/9-Provisorio/", datosDuros.avatarBorrar);

		// Obtiene los errores
		const camposDD = variables.camposDD.filter((n) => n[datosDuros.entidad] || n.productos);
		const camposDD_nombre = camposDD.map((n) => n.nombre);
		const errores = await valida.datosDuros(camposDD_nombre, datosDuros);

		// Variables
		const camposInput = camposDD.filter((n) => n.campoInput);
		const paisesNombre = datosDuros.paises_id ? comp.paises_idToNombre(datosDuros.paises_id) : [];
		const paisesTop5 = !datosDuros.paises_id ? paises.sort((a, b) => b.cantProds - a.cantProds).slice(0, 5) : [];

		// Imagen derecha
		const imgDerPers = datosDuros.avatar
			? localhost + "/imagenes/9-Provisorio/" + datosDuros.avatar
			: datosDuros.avatar_url
			? datosDuros.avatar_url
			: localhost + "/imagenes/0-Base/Avatar/Sin-Avatar.jpg";

		// Datos para la vista
		const origen =
			req.session.FA || req.cookies.FA ? "ingreso-fa" : req.session.IM || req.cookies.IM ? "ingreso-manual" : "desambiguar";
		// Render del formulario

		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo: "Agregar - Datos Duros", origen},
			...{dataEntry: datosDuros, imgDerPers, errores},
			camposInput1: camposInput.filter((n) => n.antesDePais),
			camposInput2: camposInput.filter((n) => !n.antesDePais),
			...{paises, paisesTop5, paisesNombre, idiomas},
		});
	},
	datosDurosGuardar: async (req, res) => {
		// 1. Actualiza datosDuros con la info ingresada. Si se ingresa manualmente un avatar, no lo incluye
		let datosDuros = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;
		datosDuros = {...datosDuros, ...req.body};
		req.session.datosDuros = datosDuros;
		res.cookie("datosDuros", datosDuros, {maxAge: unDia});

		// 2. Acciones si se ingresó un archivo de imagen
		let avatar = {};
		if (req.file) {
			// Obtiene la información sobre el avatar
			avatar.avatar = req.file.filename;
			avatar.tamano = req.file.size;
			avatar.avatar_url = "Avatar ingresado manualmente en 'Datos Duros'";
			// Actualiza en Datos Duros la session y cookie
			req.session.datosDuros = {...datosDuros, avatarBorrar: avatar.avatar};
			res.cookie("datosDuros", {...datosDuros, avatarBorrar: avatar.avatar}, {maxAge: unDia});
		}

		// 3. Acciones si hay errores de validación
		let camposDD = variables.camposDD.filter((n) => n[datosDuros.entidad] || n.productos);
		let camposDD_nombre = camposDD.map((n) => n.nombre);
		let errores = await valida.datosDuros(camposDD_nombre, {...datosDuros, ...avatar});
		if (errores.hay) return res.redirect(req.path.slice(1));

		// 4. Guarda data entrys en algunas session y cookie
		// 4.1. Datos Adicionales
		let datosAdics = {...datosDuros, ...avatar};
		req.session.datosAdics = datosAdics;
		res.cookie("datosAdics", datosAdics, {maxAge: unDia});
		// 4.2 Datos Originales
		let datosOriginales = req.session.datosOriginales ? req.session.datosOriginales : req.cookies.datosOriginales;
		if (datosDuros.fuente == "IM") {
			let {nombre_original, nombre_castellano, ano_estreno, sinopsis} = datosDuros;
			datosOriginales = {...datosOriginales, nombre_original, nombre_castellano, ano_estreno, sinopsis};
			// Para estandarizar con los demás tipos de ingreso, en el original sólo van urls
		}
		res.cookie("datosOriginales", datosOriginales, {maxAge: unDia});

		// 5. Redirecciona a la siguiente instancia
		return res.redirect("datos-adicionales");
	},
	datosAdicsForm: async (req, res) => {
		// Tema y Código
		const tema = "prod_agregar";
		const codigo = "datosAdics";
		const userID = req.session.usuario.id;

		// Prepara variables para la vista
		// Obtiene el Data Entry de session y cookies
		const datosAdics = req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics;
		const camposDA = await variables.camposDA_conValores(userID);
		const camposDE = Object.keys(datosAdics);

		// Grupos RCLV
		const gruposPers = procsCRUD.gruposPers(camposDA, userID);
		const gruposHechos = procsCRUD.gruposHechos(camposDA, userID);

		// Imagen derecha
		const imgDerPers = datosAdics.avatar ? localhost + "/imagenes/9-Provisorio/" + datosAdics.avatar : datosAdics.avatar_url;

		// Render del formulario
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo: "Agregar - Datos Personalizados"},
			...{dataEntry: datosAdics, imgDerPers, camposDA, camposDE},
			...{gruposPers, gruposHechos},
		});
	},
	datosAdicsGuardar: async (req, res) => {
		// Obtiene el Data Entry de session y cookies
		let datosAdics = req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics;

		// Obtiene los DatosAdics y elimina los campos sin datos
		delete datosAdics.sinRCLV;
		datosAdics = {...datosAdics, ...req.body};
		if (datosAdics.sinRCLV) datosAdics = procesos.quitaCamposRCLV(datosAdics);
		for (let campo in datosAdics) if (!datosAdics[campo]) delete datosAdics[campo];
		datosAdics.actores = procesos.valorParaActores(datosAdics);

		// Averigua la época
		datosAdics = procesos.averiguaLaEpoca(datosAdics);

		// Guarda el data entry en session y cookie
		req.session.datosAdics = datosAdics;
		res.cookie("datosAdics", req.session.datosAdics, {maxAge: unDia});

		// Si hay errores de validación, redirecciona
		let camposDA = variables.camposDA.map((m) => m.nombre);
		let errores = await valida.datosAdics(camposDA, datosAdics);
		if (errores.hay) return res.redirect(req.path.slice(1));

		// Guarda el data entry en session y cookie para el siguiente paso
		req.session.confirma = req.session.datosAdics;
		res.cookie("confirma", req.session.confirma, {maxAge: unDia});
		res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});

		// Redirecciona a la siguiente instancia
		return res.redirect("confirma");
	},
	confirmaForm: (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "confirma";
		let maximo;
		// 2. Obtiene el Data Entry de session y cookies
		let confirma = req.session.confirma ? req.session.confirma : req.cookies.confirma;
		// 3. Datos de la producción
		maximo = 50;
		let direccion = confirma.direccion;
		if (direccion.length > maximo) {
			direccion = direccion.slice(0, maximo);
			if (direccion.includes(",")) direccion = direccion.slice(0, direccion.lastIndexOf(","));
		}
		// 4. Datos de la actuación
		maximo = 170;
		let actores = confirma.actores;
		if (actores.length > maximo) {
			actores = actores.slice(0, maximo);
			if (actores.includes(",")) actores = actores.slice(0, actores.lastIndexOf(","));
		}
		// 5. Imagen derecha
		let imgDerPers = confirma.avatar ? localhost + "/imagenes/9-Provisorio/" + confirma.avatar : confirma.avatar_url;
		// 6. Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Confirma",
			dataEntry: confirma,
			direccion,
			actores,
			imgDerPers,
			tituloImgDerPers: confirma.nombre_castellano,
		});
	},
	confirmaGuardar: async (req, res) => {
		// Variables
		const userID = req.session.usuario.id;
		const entidad = req.cookies.datosOriginales.entidad;

		// Obtiene el Data Entry de session y cookies
		let confirma = req.session.confirma ? req.session.confirma : req.cookies.confirma;

		// Si se eligió algún RCLV que no existe, vuelve a la instancia anterior
		if (confirma.personaje_id || confirma.hecho_id || confirma.tema_id) {
			let existe = procesos.verificaQueExistanLosRCLV(confirma);
			if (!existe) return res.redirect("datos-adicionales");
		}
		// ORIGINAL ------------------------------------
		// Guarda el registro original
		let original = {...req.cookies.datosOriginales, creado_por_id: userID, sugerido_por_id: userID};
		let registro = await BD_genericas.agregaRegistro(entidad, original);

		// AVATAR -------------------------------------
		// Acciones para el avatar
		if (!confirma.avatar) {
			// Descarga el avatar en la carpeta 'Prods-Revisar'
			confirma.avatar = Date.now() + path.extname(confirma.avatar_url);
			let rutaYnombre = "./publico/imagenes/2-Productos/Revisar/" + confirma.avatar;
			comp.gestionArchivos.descarga(confirma.avatar_url, rutaYnombre); // No hace falta el 'await', el proceso no espera un resultado
		}
		// Si ya se había descargado el avatar, lo mueve de 'provisorio' a 'revisar'
		else comp.gestionArchivos.mueveImagen(confirma.avatar, "9-Provisorio", "2-Productos/Revisar");

		// EDICION -------------------------------------
		// Guarda los datos de 'edición' - es clave escribirlo así, para que la función no lo cambie
		await procsCRUD.guardaActEdicCRUD({original: {...registro}, edicion: {...confirma}, entidad, userID});

		// CAPÍTULOS -----------------------------------
		// Si es una "collection" o "tv" (TMDB), agrega los capítulos en forma automática  (no hace falta esperar a que concluya)
		if (confirma.fuente == "TMDB" && confirma.TMDB_entidad != "movie") {
			confirma.TMDB_entidad == "collection"
				? procesos.agregaCaps_Colec({...registro, ...confirma})
				: procesos.agregaCaps_TV({...registro, ...confirma});
		}

		// RCLV
		// Actualiza prods_aprob en RCLVs <-- esto tiene que estar después del guardado de la edición
		if (confirma.personaje_id || confirma.hecho_id || confirma.tema_id) procsCRUD.cambioDeStatus(entidad, registro);
		// No es necesario el 'await', el proceso no necesita ese resultado

		// SESSION Y COOKIES
		// Establece como vista anterior la vista del primer paso
		req.session.urlActual = "/";
		res.cookie("urlActual", "/", {maxAge: unDia});
		// Elimina todas las session y cookie del proceso AgregarProd
		procesos.borraSessionCookies(req, res, "borrarTodo");
		// Crea la cookie para 'Terminaste' para la vista siguiente
		let terminaste = {entidad, id: registro.id};
		req.session.terminaste = terminaste;
		res.cookie("terminaste", terminaste, {maxAge: unDia});

		// REDIRECCIONA --> es necesario que sea una nueva url, para que no se pueda recargar el post de 'guardar'
		return res.redirect("terminaste");
	},
	terminaste: async (req, res) => {
		// Tema y Código
		const tema = "prod_agregar";
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
		const registroProd = await BD_genericas.obtienePorIdConInclude(entidad, id, "status_registro");
		// Obtiene el nombre del producto
		const entidadNombre = comp.obtieneDesdeEntidad.entidadNombre(entidad);
		// Prepara la información sobre las imágenes de MUCHAS GRACIAS
		const carpetaMG = "0-Base/Muchas-gracias/";
		const imagenMG = "/imagenes/" + carpetaMG + comp.gestionArchivos.imagenAlAzar(carpetaMG);
		// Imagen derecha
		let imgDerPers = procsCRUD.obtieneAvatar(registroProd);
		imgDerPers = registroProd.avatar ? imgDerPers.orig : imgDerPers.edic;
		// Render del formulario
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo: "Agregar - Terminaste", imagenMG},
			...{entidad, familia: "producto", id, dataEntry: registroProd, entidadNombre, ruta: "/producto/"},
			...{imgDerPers, tituloImgDerPers: registroProd.nombre_castellano, status_id: creado_id},
		});
	},

	// Ingresos Manuales
	IM_Form: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "IM";
		// 2. Obtiene el Data Entry de session y cookies
		let IM = req.session.IM ? req.session.IM : req.cookies.IM;
		// 3. Datos para la vista
		let entidades = [
			{codigo: "peliculas", nombre: "Películas"},
			{codigo: "colecciones", nombre: "Colecciones"},
			{codigo: "capitulos", nombre: "Capítulo de una colección"},
		];
		// 4. Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Tipo de Producto",
			dataEntry: IM,
			autorizado_fa: req.session.usuario.autorizado_fa,
			entidades,
			urlActual: req.session.urlActual,
		});
	},
	IM_Guardar: async (req, res) => {
		// 1. Prepara los datos y los guarda en 'session' y 'cookie'
		let IM = {
			...req.body,
			...req.query,
			entidadNombre: comp.obtieneDesdeEntidad.entidadNombre(req.body.entidad),
		};
		IM.fuente = IM.ingreso_fa ? "FA" : "IM";
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
		return res.redirect(req.baseUrl + sigPaso.url);
	},
	copiarFA_Form: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "FA";
		// 2. Obtiene el Data Entry de session y cookies
		let FA = req.session.FA ? req.session.FA : req.cookies.FA;
		// 3. Si existe un valor para el campo 'avatarBorrar' elimina el archivo descargado
		if (FA.avatarBorrar) comp.gestionArchivos.elimina("./publico/imagenes/9-Provisorio/", FA.avatarBorrar);
		// 4. Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Copiar FA",
			dataEntry: FA,
		});
	},
	copiarFA_Guardar: async (req, res) => {
		// 1. Obtiene el Data Entry de session y cookies y actualiza la información
		let FA = req.session.FA ? req.session.FA : req.cookies.FA;

		// Guarda el data entry en session y cookie
		FA = {...FA, ...req.body};
		req.session.FA = FA;
		res.cookie("FA", FA, {maxAge: unDia});

		// Si hay errores de validación, redirecciona
		let errores = valida.FA(FA);
		if (!errores.url) {
			// Obtiene el FA_id
			FA.FA_id = procesos.obtieneFA_id(FA.url);
			// Averigua si el FA_id ya está en la BD
			let elc_id = await BD_especificas.obtieneELC_id(FA.entidad, {FA_id: FA.FA_id});
			if (elc_id) {
				errores.url = "Ya la tenemos en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		if (errores.hay) return res.redirect(req.originalUrl);

		// Si NO hay errores...
		// 1. Genera la variable 'datos' y le asigna los valores disponibles que necesita
		let datos = {...FA, ...procesos.infoFAparaDD(FA)};
		delete datos.url;
		delete datos.contenido;

		// 2. Descarga la imagen
		datos.avatar = Date.now() + path.extname(FA.avatar_url);
		let rutaYnombre = "./publico/imagenes/9-Provisorio/" + datos.avatar;
		await comp.gestionArchivos.descarga(datos.avatar_url, rutaYnombre); // Hace falta el 'await' porque el proceso espera un resultado

		// 3. Actualiza algunas session y cookie
		// 3.1. Datos Originales
		let datosOriginales = {...datos};
		delete datosOriginales.avatar; // Para estandarizar con los demás tipos de ingreso, en el original sólo van urls
		delete datosOriginales.avatar_url;
		res.cookie("datosOriginales", datosOriginales, {maxAge: unDia});
		// 3.2. Film Affinity
		FA.avatarBorrar = datos.avatar;
		req.session.FA = FA;
		res.cookie("FA", FA, {maxAge: unDia});
		// 3.3. Datos Duros
		req.session.datosDuros = datos;
		res.cookie("datosDuros", datos, {maxAge: unDia});

		// Redirecciona a la siguiente instancia
		return res.redirect("datos-duros");
	},
};
