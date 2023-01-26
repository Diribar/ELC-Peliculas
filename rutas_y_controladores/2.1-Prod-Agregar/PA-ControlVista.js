"use strict";
// Definir funciones
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./PA-FN-Procesos");
const valida = require("./PA-FN-Validar");

module.exports = {
	palabrasClaveForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "palabrasClave";
		// 2. Data Entry propio y errores
		let dataEntry = {};
		dataEntry.palabrasClave = req.session.palabrasClave
			? req.session.palabrasClave
			: req.cookies.palabrasClave;
		// 3. Eliminar session y cookie posteriores, si existen
		procesos.borraSessionCookies(req, res, "palabrasClave");
		// 4. Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Palabras Clave",
			dataEntry,
		});
	},
	palabrasClaveGuardar: async (req, res) => {
		// 1. Guarda el data entry en session y cookie
		let palabrasClave = req.body.palabrasClave;
		req.session.palabrasClave = palabrasClave;
		res.cookie("palabrasClave", palabrasClave, {maxAge: unDia});
		// 2. Si hay errores de validación, redireccionar
		let errores = await valida.palabrasClave(palabrasClave);
		if (errores.palabrasClave) return res.redirect("palabras-clave");
		// 3. Redirecciona a la siguiente instancia
		return res.redirect("desambiguar");
	},
	desambiguarForm: async (req, res) => {
		// Tema y Código
		const tema = "prod_agregar";
		const codigo = "desambiguar";
		// Elimina session y cookie posteriores, si existen
		procesos.borraSessionCookies(req, res, "desambiguar");
		// Si se perdió la info anterior, vuelve a esa instancia
		let palabrasClave = req.session.palabrasClave ? req.session.palabrasClave : req.cookies.palabrasClave;
		if (!palabrasClave) return res.redirect("palabras-clave");
		// Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Desambiguar",
			palabrasClave,
			omitirImagenDerecha: true,
			mostrarCartel: true,
		});
	},
	datosDurosForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "datosDuros";
		// 2. Elimina session y cookie posteriores, si existen
		procesos.borraSessionCookies(req, res, "datosDuros");
		// 3. Si se perdió la info anterior, vuelve a esa instancia
		let datosDuros = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;
		let origen =
			datosDuros.fuente == "TMDB"
				? "desambiguar"
				: datosDuros.fuente == "FA"
				? "ingreso-fa"
				: datosDuros.fuente == "IM"
				? "ingreso-manual"
				: "palabras-clave";
		if (!datosDuros) return res.redirect(origen);
		// 4. Variables
		let camposDD = variables.camposDD.filter((n) => n[datosDuros.entidad]);
		// 5. Obtiene los errores
		let camposDD_nombre = camposDD.map((n) => n.nombre);
		let errores = req.session.erroresDD
			? req.session.erroresDD
			: await valida.datosDuros(camposDD_nombre, datosDuros);
		// Preparar variables para la vista
		let paises = datosDuros.paises_id ? await comp.paises_idToNombre(datosDuros.paises_id) : "";
		let BD_paises = !datosDuros.paises_id ? await BD_genericas.obtieneTodos("paises", "nombre") : [];
		let idiomas = await BD_genericas.obtieneTodos("idiomas", "nombre");
		let camposInput = camposDD.filter((n) => n.campoInput);
		// Imagen derecha
		let imgDerPers = datosDuros.avatar
			? "/imagenes/9-Provisorio/" + datosDuros.avatar
			: datosDuros.avatar_url
			? datosDuros.avatar_url
			: "/imagenes/0-Base/Avatar/Prod-Sin-Avatar.jpg";
		// Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Datos Duros",
			dataEntry: datosDuros,
			camposInput1: camposInput.filter((n) => n.antesDePais),
			camposInput2: camposInput.filter((n) => !n.antesDePais),
			paises,
			BD_paises,
			idiomas,
			origen,
			errores,
			imgDerPers,
		});
	},
	datosDurosGuardar: async (req, res) => {
		// Si se perdió la info anterior, vuelve a esa instancia
		let datosDuros = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;
		if (!datosDuros) {
			// Obtiene el origen
			let origen =
				req.session.desambiguar || req.cookies.desambiguar
					? "desambiguar"
					: req.session.FA || req.cookies.FA
					? "ingreso-fa"
					: "palabras-clave";
			// Redirecciona
			return res.redirect(origen);
		}
		// Actualiza datosDuros con la info ingresada
		if (req.file) {
			datosDuros.avatar = req.file.filename;
			datosDuros.tamano = req.file.size;
		}
		datosDuros = {...datosDuros, ...req.body};
		// Guarda el data entry en session y cookie
		req.session.datosDuros = datosDuros;
		res.cookie("datosDuros", datosDuros, {maxAge: unDia});
		res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});
		// Averigua si hay errores de validación
		let camposDD = variables.camposDD.filter((n) => n[datosDuros.entidad]);
		let camposRevisar = camposDD.map((n) => n.nombre);
		let errores = await valida.datosDuros(camposRevisar, datosDuros);
		// Si hay errores de validación, redirecciona
		if (errores.hay) {
			// Guarda los errores en 'session' porque pueden ser muy específicos
			req.session.erroresDD = errores;
			// Redirecciona
			return res.redirect("datos-duros");
		} else delete req.session.erroresDD;
		// Guarda el data entry en session y cookie de Datos Originales
		if (datosDuros.fuente == "IM") {
			let IM = req.session.IM ? req.session.IM : req.cookies.IM;
			let {nombre_castellano, ano_estreno} = datosDuros;
			IM = {...IM, nombre_castellano, ano_estreno};
			res.cookie("datosOriginales", IM, {maxAge: unDia});
		}
		// Guarda el data entry en session y cookie de Datos Personales
		req.session.datosAdics = datosDuros;
		res.cookie("datosAdics", datosDuros, {maxAge: unDia});
		res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});
		// Redirecciona a la siguiente instancia
		return res.redirect("datos-adicionales");
	},
	datosAdicsForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "datosAdics";
		let userID = req.session.usuario.id;
		// 2. Eliminar session y cookie posteriores, si existen
		procesos.borraSessionCookies(req, res, "datosAdics");
		// 3. Si se perdió la info anterior, vuelve a esa instancia
		let datosAdics = req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics;
		if (!datosAdics) return res.redirect("datos-duros");
		// 5. Prepara variables para la vista
		let camposDP = await variables.camposDP_conValores(userID);
		let camposDE = Object.keys(datosAdics);
		// Imagen derecha
		let imgDerPers = datosAdics.avatar
			? "/imagenes/9-Provisorio/" + datosAdics.avatar
			: datosAdics.avatar_url;
		// 6. Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Datos Personalizados",
			dataEntry: datosAdics,
			camposDP,
			camposDE,
			imgDerPers,
			tituloImgDerPers: datosAdics.nombre_castellano,
		});
	},
	datosAdicsGuardar: async (req, res) => {
		// 1. Si se perdió la info anterior, vuelve a esa instancia
		let aux = req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics;
		if (!aux) return res.redirect("datos-duros");
		// 2. Obtiene los DatosAdics y elimina los campos sin datos
		delete aux.sinRCLV;
		let datosAdics = {...aux, ...req.body};
		if (datosAdics.sinRCLV) datosAdics = procesos.quitaCamposRCLV(datosAdics);
		for (let campo in datosAdics) if (!datosAdics[campo]) delete datosAdics[campo];
		// 3. Guarda el data entry en session y cookie
		req.session.datosAdics = datosAdics;
		res.cookie("datosAdics", req.session.datosAdics, {maxAge: unDia});
		res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});
		// 4. Si hay errores de validación, redirecciona
		let camposDP = variables.camposDP.map((m) => m.nombre);
		let errores = await valida.datosAdics(camposDP, datosAdics);
		if (errores.hay) return res.redirect("datos-adicionales");
		// 5. Si no hay errores, prepara la info para el siguiente paso
		req.session.confirma = req.session.datosAdics;
		res.cookie("confirma", req.session.confirma, {maxAge: unDia});
		res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});
		// 6. Redirecciona a la siguiente instancia
		return res.redirect("confirma");
	},
	confirmaForm: (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "confirma";
		let maximo;
		// 2. Si se perdió la info anterior, volver a esa instancia
		let confirma = req.session.confirma ? req.session.confirma : req.cookies.confirma;
		if (!confirma) return res.redirect("datos-adicionales");
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
		// Imagen derecha
		let imgDerPers = confirma.avatar ? "/imagenes/9-Provisorio/" + confirma.avatar : confirma.avatar_url;
		// 5. Render del formulario
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
		// Si se perdió la info, vuelve a la instancia anterior
		let confirma = req.session.confirma ? req.session.confirma : req.cookies.confirma;
		if (!confirma) return res.redirect("datos-adicionales");
		// Si no existe algún RCLV, vuelve a la instancia anterior
		let existe = procesos.verificaQueExistanLosRCLV(confirma);
		if (!existe) return res.redirect("datos-adicionales");
		// Guarda los datos de 'Original'
		let original = {
			...req.cookies.datosOriginales,
			creado_por_id: req.session.usuario.id,
		};
		let registro = await BD_genericas.agregaRegistro(original.entidad, original);
		// Guarda los datos de 'Edición' (no hace falta esperar a que concluya)
		procsCRUD.guardaEdicion({
			entidadOrig: original.entidad,
			entidadEdic: "prods_edicion",
			original: registro,
			edicion: confirma,
			userID: req.session.usuario.id,
		});
		// Si es una "collection" o "tv" (TMDB), agrega los capítulos en forma automática  (no hace falta esperar a que concluya)
		if (confirma.fuente == "TMDB" && confirma.TMDB_entidad != "movie") {
			confirma.TMDB_entidad == "collection"
				? procesos.agregaCapitulosDeCollection({...confirma, ...registro})
				: procesos.agregaCapitulosDeTV({...confirma, ...registro});
		}
		// Descarga el avatar y lo mueve de 'provisorio' a 'revisar'  (no hace falta esperar a que concluya)
		procesos.descargaMueveElAvatar(confirma);
		// Elimina todas las session y cookie del proceso AgregarProd
		procesos.borraSessionCookies(req, res, "borrarTodo");
		// Establece como vista anterior la vista del primer paso
		req.session.urlActual = "/";
		res.cookie("urlActual", "/", {maxAge: unDia});
		// Crea la cookie para 'Terminaste' por sólo 5 segs, para la vista siguiente
		let prodTerm = {entidad: confirma.entidad, id: registro.id};
		req.session.prodTerm = prodTerm;
		res.cookie("prodTerm", prodTerm, {maxAge: 5000});
		// Redirecciona
		return res.redirect("terminaste");
	},
	terminasteForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "terminaste";
		// 2. Si se perdió la info, redirije a 'palabras clave'
		let prodTerm = req.session.prodTerm ? req.session.prodTerm : req.cookies.prodTerm;
		delete req.session.prodTerm;
		if (!prodTerm) return res.redirect("palabras-clave");
		// 3. Obtiene los datos clave del producto
		let {entidad, id} = prodTerm;
		// 4. Obtiene los demás datos del producto
		let registroProd = await BD_genericas.obtienePorIdConInclude(entidad, id, "status_registro");
		// Problemas
		let resultado = procesos.revisaProblemas({registroProd, entidad, id, req});
		if (resultado) res[resultado.objeto](...resultado.parentesis);
		// 5. Obtiene el producto
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		// 6. Prepara la información sobre las imágenes de MUCHAS GRACIAS
		let imagenMuchasGracias = procesos.imagenMuchasGracias();
		// Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Terminaste",
			entidad,
			id,
			dataEntry: registroProd,
			prodNombre,
			imagenMuchasGracias,
			ruta: "/producto/",
			imgDerPers: procsCRUD.avatarOrigEdic(registroProd).orig,
			tituloImgDerPers: registroProd.nombre_castellano,
		});
	},
	responsabilidad: (req, res) => {
		return res.render("CMP-0Estructura", {
			tema: "prod_agregar",
			codigo: "responsab",
			titulo: "Responsabilidad",
			urlSalir: req.session.urlSinPermInput,
		});
	},
	IM_Form: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "IM";
		// 2. Eliminar session y cookie posteriores, si existen
		procesos.borraSessionCookies(req, res, "IM");
		// 3. Data Entry propio
		let IM = req.session.IM ? req.session.IM : req.cookies.IM;
		// 4. Datos para la vista
		let entidades = [
			{codigo: "peliculas", nombre: "Películas"},
			{codigo: "colecciones", nombre: "Colecciones"},
			{codigo: "capitulos", nombre: "Capítulo de una colección"},
		];
		// 5. Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Tipo de Producto",
			dataEntry: IM,
			autorizado_fa: req.session.usuario.autorizado_fa,
			entidades,
		});
	},
	IM_Guardar: async (req, res) => {
		// 1. Prepara los datos y los guarda en 'session' y 'cookie'
		let IM = {
			...req.body,
			fuente: "IM",
			prodNombre: comp.obtieneEntidadNombre(req.body.entidad),
		};
		req.session.IM = IM;
		res.cookie("IM", IM, {maxAge: unDia});
		// Los 'datos originales' se completan en 'Datos Duros'
		res.cookie("datosOriginales", IM, {maxAge: unDia});
		// 2. Averigua si hay errores de validación
		let errores = await valida.IM(IM);
		// 3. Si hay errores de validación, redirecciona al Form
		if (errores.hay) return res.redirect("ingreso-manual");
		// 4. Genera la session para la siguiente instancia
		req.session.datosDuros = IM;
		res.cookie("datosDuros", IM, {maxAge: unDia});
		// 6. Redirecciona a la siguiente instancia
		res.redirect("datos-duros");
	},
	copiarFA_Form: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "FA";
		// 2. Eliminar session y cookie posteriores, si existen
		procesos.borraSessionCookies(req, res, "FA");
		// 3. Generar la cookie de datosOriginales
		if (req.body && req.body.entidad) {
			req.body.prodNombre = comp.obtieneEntidadNombre(req.body.entidad);
			req.body.fuente = "FA";
			req.session.FA = req.body;
			res.cookie("FA", req.body, {maxAge: unDia});
			res.cookie("datosOriginales", req.body, {maxAge: unDia});
		}
		// 4. Si se perdió la info anterior, volver a esa instancia
		let FA = req.session.FA ? req.session.FA : req.cookies.FA;
		if (!FA) return res.redirect("ingreso-manual");
		// 5. Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Copiar FA",
			dataEntry: FA,
		});
	},
	copiarFA_Guardar: async (req, res) => {
		// 1. Si se perdió la info anterior, volver a esa instancia
		let aux = req.session.FA ? req.session.FA : req.cookies.FA;
		if (!aux) return res.redirect("ingreso-manual");
		// 1. Guarda el data entry en session y cookie
		let FA = {...aux, ...req.body};
		req.session.FA = FA;
		res.cookie("FA", FA, {maxAge: unDia});
		// 2.1. Averigua si hay errores de validación
		let errores = await valida.FA(FA);
		// 2.2. Averigua si el FA_id ya está en la BD
		FA_id = await procesos.obtieneFA_id(req.body.direccion);
		if (!errores.direccion) {
			let elc_id = await BD_especificas.obtieneELC_id(FA.entidad, {FA_id: FA_id});
			if (elc_id) {
				errores.direccion = "El código interno ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// 2.3. Si hay errores de validación, redireccionar
		if (errores.hay) return res.redirect("ingreso-fa");
		// 3. Si NO hay errores, generar la session para la siguiente instancia
		req.session.datosDuros = await procesos.infoFAparaDD(FA);
		res.cookie("datosDuros", req.session.datosDuros, {maxAge: unDia});
		// 4. Completar la cookie datosOriginales con el FA_id
		let cookie = req.cookies.datosOriginales;
		cookie.FA_id = req.session.datosDuros.FA_id;
		res.cookie("datosOriginales", cookie, {maxAge: unDia});
		// 4. Redirecciona a la siguiente instancia
		return res.redirect("datos-duros");
	},
};
