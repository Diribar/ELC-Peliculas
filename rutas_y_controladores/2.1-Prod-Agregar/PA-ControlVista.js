"use strict";
// Definir funciones
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./PA-FN-Procesos");
const valida = require("./PA-FN-Validar");
const path = require("path");

module.exports = {
	palabrasClaveForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "palabrasClave";
		// 2. Obtiene el Data Entry de session y cookies
		let palabrasClave = req.session.palabrasClave ? req.session.palabrasClave : req.cookies.palabrasClave;
		// 3. Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Palabras Clave",
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
			cartelEscondido: true,
		});
	},
	datosDurosForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "datosDuros";
		// 2. Obtiene el Data Entry de session y cookies
		let datosDuros = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;
		// Variables
		let camposDD = variables.camposDD.filter((n) => n[datosDuros.entidad]);
		// Obtiene los errores
		let camposDD_nombre = camposDD.map((n) => n.nombre);
		let errores = req.session.erroresDD ? req.session.erroresDD : await valida.datosDuros(camposDD_nombre, datosDuros);
		// Preparar variables para la vista
		let paises = datosDuros.paises_id ? await comp.paises_idToNombre(datosDuros.paises_id) : "";
		let BD_paises = !datosDuros.paises_id ? await BD_genericas.obtieneTodos("paises", "nombre") : [];
		let idiomas = await BD_genericas.obtieneTodos("idiomas", "nombre");
		let camposInput = camposDD.filter((n) => n.campoInput);
		// Imagen derecha
		let imgDerPers = datosDuros.avatar
			? localhost + "/imagenes/9-Provisorio/" + datosDuros.avatar
			: datosDuros.avatar_url
			? datosDuros.avatar_url
			: localhost + "/imagenes/0-Base/Avatar/Prod-Sin-Avatar.jpg";
		// Datos para la vista
		let origen =
			req.session.FA || req.cookies.FA ? "ingreso-fa" : req.session.IM || req.cookies.IM ? "ingreso-manual" : "desambiguar";
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
		// 1. Obtiene el Data Entry de session y cookies
		let datosDuros = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;
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
			return res.redirect(req.path.slice(1));
		} else delete req.session.erroresDD;
		// Guarda el data entry en session y cookie de Datos Originales
		if (datosDuros.fuente == "IM" || datosDuros.fuente == "FA") {
			let fuente = datosDuros.fuente == "IM" ? "IM" : "FA";
			let sessionCookie = req.session[fuente] ? req.session[fuente] : req.cookies[fuente];
			let {nombre_castellano, ano_estreno} = datosDuros;
			sessionCookie = {...sessionCookie, nombre_castellano, ano_estreno};
			res.cookie("datosOriginales", sessionCookie, {maxAge: unDia});
		}
		// Guarda el data entry en session y cookie de Datos Adicionales
		req.session.datosAdics = datosDuros;
		res.cookie("datosAdics", datosDuros, {maxAge: unDia});
		// Redirecciona a la siguiente instancia
		return res.redirect("datos-adicionales");
	},
	datosAdicsForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "datosAdics";
		let userID = req.session.usuario.id;
		// 2. Obtiene el Data Entry de session y cookies
		let datosAdics = req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics;
		// 3. Prepara variables para la vista
		let camposDA = await variables.camposDA_conValores(userID);
		let camposDE = Object.keys(datosAdics);
		// 4. Imagen derecha
		let imgDerPers = datosAdics.avatar ? localhost + "/imagenes/9-Provisorio/" + datosAdics.avatar : datosAdics.avatar_url;
		// 5. Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Datos Personalizados",
			dataEntry: datosAdics,
			camposDA,
			camposDE,
			imgDerPers,
			tituloImgDerPers: datosAdics.nombre_castellano,
		});
	},
	datosAdicsGuardar: async (req, res) => {
		// 1. Obtiene el Data Entry de session y cookies
		let datosAdics = req.session.datosAdics ? req.session.datosAdics : req.cookies.datosAdics;
		// Obtiene los DatosAdics y elimina los campos sin datos
		delete datosAdics.sinRCLV;
		datosAdics = {...datosAdics, ...req.body};
		if (datosAdics.sinRCLV) datosAdics = procesos.quitaCamposRCLV(datosAdics);
		for (let campo in datosAdics) if (!datosAdics[campo]) delete datosAdics[campo];
		// Valor para actores
		if (!datosAdics.actores) datosAdics.actores = procesos.valorParaActores(datosAdics);
		// Guarda el data entry en session y cookie
		req.session.datosAdics = datosAdics;
		res.cookie("datosAdics", req.session.datosAdics, {maxAge: unDia});
		// Si hay errores de validación, redirecciona
		let camposDA = variables.camposDA.map((m) => m.nombre);
		let errores = await valida.datosAdics(camposDA, datosAdics);
		if (errores.hay) return res.redirect(req.path.slice(1));
		// Si no hay errores, prepara la info para el siguiente paso
		req.session.confirma = req.session.datosAdics;
		res.cookie("confirma", req.session.confirma, {maxAge: unDia});
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
		// 1. Obtiene el Data Entry de session y cookies
		let confirma = req.session.confirma ? req.session.confirma : req.cookies.confirma;
		// Si no existe algún RCLV, vuelve a la instancia anterior
		if (confirma.personaje_id || confirma.hecho_id || confirma.valor_id) {
			let existe = procesos.verificaQueExistanLosRCLV(confirma);
			if (!existe) return res.redirect("datos-adicionales");
		}
		// Guarda los datos de 'Original'
		let original = {
			...req.cookies.datosOriginales,
			creado_por_id: req.session.usuario.id,
		};
		let registro = await BD_genericas.agregaRegistro(original.entidad, original);
		// Descarga el avatar y lo mueve de 'provisorio' a 'revisar'
		if (!confirma.avatar) confirma.avatar = Date.now() + path.extname(confirma.avatar_url);
		procesos.descargaMueveElAvatar(confirma); // No hace falta el 'await', el proceso no espera un resultado
		// Guarda los datos de 'Edición'
		await procsCRUD.guardaActEdicCRUD({
			original: {...registro},
			edicion: {...confirma}, // es clave escribirlo así, para que la función no lo cambie
			entidad: original.entidad,
			userID: req.session.usuario.id,
		});
		// Actualiza prods_aprob en RCLVs <-- esto tiene que estar después del guardado de la edición
		if (confirma.personaje_id || confirma.hecho_id || confirma.valor_id) {
			let producto = {...confirma, id: registro.id};
			procsCRUD.rclvConProd_status(producto); // No es necesario el 'await', el proceso no necesita ese resultado
		}

		// Si es una "collection" o "tv" (TMDB), agrega los capítulos en forma automática  (no hace falta esperar a que concluya)
		if (confirma.fuente == "TMDB" && confirma.TMDB_entidad != "movie") {
			confirma.TMDB_entidad == "collection"
				? procesos.agregaCapitulosDeCollection({...confirma, ...registro})
				: procesos.agregaCapitulosDeTV({...confirma, ...registro});
		}

		// Establece como vista anterior la vista del primer paso
		req.session.urlActual = "/";
		res.cookie("urlActual", "/", {maxAge: unDia});
		// Elimina todas las session y cookie del proceso AgregarProd
		procesos.borraSessionCookies(req, res, "borrarTodo");
		// Crea la cookie para 'Terminaste' para la vista siguiente
		let terminaste = {entidad: confirma.entidad, id: registro.id};
		req.session.terminaste = terminaste;
		res.cookie("terminaste", terminaste, {maxAge: unDia});
		// Redirecciona --> es necesario que sea una nueva url, para que no se pueda recargar el post de 'guardar'
		return res.redirect("terminaste");
	},
	terminaste: async (req, res) => {
		// Tema y Código
		const tema = "prod_agregar";
		const codigo = "terminaste";
		// Obtiene el Data Entry de session y cookies
		let terminaste = req.session.terminaste ? req.session.terminaste : req.cookies.terminaste;
		// Borra 'session' y 'cookie' para que no se pueda recargar la página
		delete req.session.terminaste;
		res.clearCookie("terminaste");
		// Si se perdió la info, redirige a 'palabras clave'
		if (!terminaste) return res.redirect("palabras-clave");
		// Obtiene los datos clave del producto
		let {entidad, id} = terminaste;
		// Obtiene los demás datos del producto
		let registroProd = await BD_genericas.obtienePorIdConInclude(entidad, id, "status_registro");
		// Obtiene el producto
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		// Prepara la información sobre las imágenes de MUCHAS GRACIAS
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
		});
	},
	IM_Guardar: async (req, res) => {
		// 1. Prepara los datos y los guarda en 'session' y 'cookie'
		let IM = {
			...req.body,
			...req.query,
			fuente: "IM",
			prodNombre: comp.obtieneEntidadNombre(req.body.entidad),
		};
		req.session.IM = IM;
		res.cookie("IM", IM, {maxAge: unDia});
		// 2. Averigua si hay errores de validación
		let errores = await valida.IM(IM);
		// 3. Si hay errores de validación, redirecciona al Form
		if (errores.hay) return res.redirect(req.path.slice(1));
		// Guarda el data entry en session y cookie
		req.session.IM = IM;
		res.cookie("IM", req.session.datosAdics, {maxAge: unDia});
		// Guarda el data entry en datosOriginales
		res.cookie("datosOriginales", IM, {maxAge: unDia});
		// Averigua cuál es la siguiente instancia
		let siguienteInstancia = IM.ingreso_fa ? {codigo: "FA", url: "ingreso-fa"} : {codigo: "datosDuros", url: "datos-duros"};
		// Genera la session para la siguiente instancia
		req.session[siguienteInstancia.codigo] = IM;
		res.cookie(siguienteInstancia.codigo, IM, {maxAge: unDia});
		// Redirecciona a la siguiente instancia
		res.redirect(siguienteInstancia.url);
	},
	copiarFA_Form: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "FA";
		// 2. Obtiene el Data Entry de session y cookies
		let FA = req.session.FA ? req.session.FA : req.cookies.FA;
		FA.fuente = "FA";
		req.session.FA = FA;
		res.cookie("FA", FA, {maxAge: unDia});
		// 3. Genera la cookie de datosOriginales
		res.cookie("datosOriginales", FA, {maxAge: unDia});
		// 5. Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Copiar FA",
			dataEntry: FA,
		});
	},
	copiarFA_Guardar: async (req, res) => {
		// 1. Obtiene el Data Entry de session y cookies
		let FA = req.session.FA ? req.session.FA : req.cookies.FA;
		// Actualiza la información
		let FA_id = await procesos.obtieneFA_id(req.body.direccion);
		FA = {...FA, ...req.body, FA_id};
		// Guarda el data entry en session y cookie
		req.session.FA = FA;
		res.cookie("FA", FA, {maxAge: unDia});
		// Averigua si hay errores de validación
		let errores = await valida.FA(FA);
		if (!errores.direccion) {
			// Averigua si el FA_id ya está en la BD
			let elc_id = await BD_especificas.obtieneELC_id(FA.entidad, {FA_id});
			if (elc_id) {
				errores.direccion = "El código interno ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// Si hay errores de validación, redirecciona
		if (errores.hay) return res.redirect(req.path.slice(1));
		// Si NO hay errores, genera la session para la siguiente instancia
		let datosDuros = await procesos.infoFAparaDD(FA);
		req.session.datosDuros = datosDuros;
		res.cookie("datosDuros", datosDuros, {maxAge: unDia});
		// Completa la cookie datosOriginales con el FA_id
		let cookie = {...req.cookies.datosOriginales, FA_id};
		res.cookie("datosOriginales", cookie, {maxAge: unDia});
		// Redirecciona a la siguiente instancia
		return res.redirect("datos-duros");
	},
};
