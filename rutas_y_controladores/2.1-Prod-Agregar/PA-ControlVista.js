"use strict";
// Definir variables
const fs = require("fs");
const path = require("path");
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
		req.session.datosPers = datosDuros;
		res.cookie("datosPers", datosDuros, {maxAge: unDia});
		// Redirecciona a la siguiente instancia
		return res.redirect("datos-personalizados");
	},
	datosPersForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "datosPers";
		let userID = req.session.usuario.id;
		// 2. Eliminar session y cookie posteriores, si existen
		procesos.borraSessionCookies(req, res, "datosPers");
		// 3. Si se perdió la info anterior, vuelve a esa instancia
		let datosPers = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
		if (!datosPers) return res.redirect("datos-duros");
		// 5. Prepara variables para la vista
		let camposDP = await variables.camposDP(userID);
		// Imagen derecha
		let imgDerPers = datosPers.avatar
			? "/imagenes/9-Provisorio/" + datosPers.avatar
			: datosPers.avatar_url;
		// 6. Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Datos Personalizados",
			dataEntry: datosPers,
			camposDP,
			imgDerPers,
			tituloImgDerPers: datosPers.nombre_castellano,
		});
	},
	datosPersGuardar: async (req, res) => {
		// 1. Si se perdió la info anterior, volver a esa instancia
		let aux = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
		if (!aux) return res.redirect("datos-duros");
		// 2. Sumar el req.body a lo que ya se tenía
		let datosPers = {...aux, ...req.body};
		// 3. Borrar campos innecesarios
		for (let campo in datosPers) {
			if (!datosPers[campo]) delete datosPers[campo];
		}
		// 4. Guarda el data entry en session y cookie
		req.session.datosPers = datosPers;
		res.cookie("datosPers", req.session.datosPers, {maxAge: unDia});
		res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});
		// 5. Averigua si hay errores de validación
		let camposDP = await variables.camposDP().then((n) => n.map((m) => m.nombre));
		let errores = await valida.datosPers(camposDP, datosPers);
		// 6. Si hay errores de validación, redireccionar
		if (errores.hay) return res.redirect("datos-personalizados");
		// Si no hay errores, continuar
		// 7. Preparar la info para el siguiente paso
		req.session.confirma = req.session.datosPers;
		res.cookie("confirma", req.session.confirma, {maxAge: unDia});
		res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});
		// 8. Redirecciona a la siguiente instancia
		return res.redirect("confirma");
	},
	confirmaForm: (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "confirma";
		let maximo, indice;
		// 2. Si se perdió la info anterior, volver a esa instancia
		let confirma = req.session.confirma ? req.session.confirma : req.cookies.confirma;
		if (!confirma) return res.redirect("datos-personalizados");
		// 3. Datos de la producción
		maximo = 50;
		let direccion = confirma.direccion.slice(0, maximo);
		indice = direccion.lastIndexOf(",") != -1 ? direccion.lastIndexOf(",") : maximo;
		direccion = direccion.slice(0, indice);
		// 4. Datos de la actuación
		maximo = 170;
		let actuacion = confirma.actuacion.slice(0, maximo);
		indice = actuacion.lastIndexOf(",") != -1 ? actuacion.lastIndexOf(",") : maximo;
		actuacion = actuacion.slice(0, indice);
		// Imagen derecha
		let imgDerPers = confirma.avatar ? "/imagenes/9-Provisorio/" + confirma.avatar : confirma.avatar_url;
		// 5. Render del formulario
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Confirma",
			dataEntry: confirma,
			direccion,
			actuacion,
			imgDerPers,
			tituloImgDerPers: confirma.nombre_castellano,
		});
	},
	confirmaGuardar: async (req, res) => {
		// 1. Si se perdió la info, volver a la instancia anterior
		let confirma = req.session.confirma ? req.session.confirma : req.cookies.confirma;
		if (!confirma) return res.redirect("datos-personalizados");
		// Descarga la imagen del url
		let descargaOK;
		if (!confirma.avatar) {
			confirma.avatar = Date.now() + path.extname(confirma.avatar_url);
			let rutaYnombre = "./publico/imagenes/9-Provisorio/" + confirma.avatar;
			descargaOK = comp.descarga(confirma.avatar_url, rutaYnombre);
		}
		// 2. Obtiene la calificación
		let [fe_valores, entretiene, calidad_tecnica] = await Promise.all([
			BD_genericas.obtienePorId("fe_valores", confirma.fe_valores_id).then((n) => n.valor),
			BD_genericas.obtienePorId("entretiene", confirma.entretiene_id).then((n) => n.valor),
			BD_genericas.obtienePorId("calidad_tecnica", confirma.calidad_tecnica_id).then((n) => n.valor),
		]);
		let calificacion = fe_valores * 0.5 + entretiene * 0.3 + calidad_tecnica * 0.2;
		let calificaciones = {fe_valores, entretiene, calidad_tecnica, calificacion};
		// 3. Guarda los datos de 'Original'
		let original = {
			...req.cookies.datosOriginales,
			...calificaciones,
			creado_por_id: req.session.usuario.id,
		};
		let registro = await BD_genericas.agregaRegistro(original.entidad, original);
		// 4. Guarda los datos de 'Edición'
		await procsCRUD.guardaEdicion(
			confirma.entidad,
			"prods_edicion",
			registro,
			confirma,
			req.session.usuario.id
		);
		// 5. Si es una "collection" o "tv" (TMDB), agregar las partes en forma automática
		if (confirma.fuente == "TMDB" && confirma.TMDB_entidad != "movie") {
			confirma.TMDB_entidad == "collection"
				? procesos.agregaCapitulosDeCollection({...confirma, ...registro})
				: procesos.agregaCapitulosDeTV({...confirma, ...registro});
		}
		// 6. Guarda las calificaciones
		procesos.guarda_cal_registros({...confirma, ...calificaciones}, registro);
		// 8. Elimina todas las session y cookie del proceso AgregarProd
		procesos.borraSessionCookies(req, res, "borrarTodo");
		// 9. Borra la vista actual para que no vaya a vistaAnterior
		req.session.urlActual = "/";
		res.cookie("urlActual", "/", {maxAge: unDia});
		// 10. Crea la cookie para 'Terminaste'
		let prodTerminaste = {entidad: confirma.entidad, id: registro.id};
		res.cookie("prodTerminaste", prodTerminaste, {maxAge: 3000});
		// 7. Mueve el avatar de 'provisorio' a 'revisar'
		Promise.all([descargaOK]);
		comp.mueveUnArchivoImagen(confirma.avatar, "9-Provisorio", "2-Avatar-Prods-Revisar");
		// 11. Redirecciona
		return res.redirect("terminaste");
	},
	terminasteForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		const codigo = "terminaste";
		// 2. Si se perdió la info, redirije a 'palabras clave'
		let prodTerminaste = req.cookies.prodTerminaste;
		if (!prodTerminaste) return res.redirect("palabras-clave");
		// 3. Obtiene los datos clave del producto
		let {entidad, id} = prodTerminaste;
		// 4. Obtiene los demás datos del producto
		let registroProd = await BD_genericas.obtienePorIdConInclude(entidad, id, "status_registro");
		// Problema: PRODUCTO NO ENCONTRADO
		if (!registroProd) {
			let informacion = {
				mensajes: ["Producto no encontrado"],
				iconos: [
					{
						nombre: "fa-circle-left",
						link: req.session.urlAnterior,
						titulo: "Ir a la vista anterior",
					},
				],
			};
			return res.render("CMP-0Estructura", {informacion});
		}
		// Problema: PRODUCTO YA REVISADO
		if (!registroProd.status_registro.gr_creado)
			return res.redirect("/producto/detalle/?entidad=" + entidad + "&id=" + id);
		// 5. Obtiene el producto
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		// 6. Preparar la información sobre las imágenes de MUCHAS GRACIAS
		let muchasGracias = fs.readdirSync("./publico/imagenes/0-Base/Muchas-gracias/");
		let indice = parseInt(Math.random() * muchasGracias.length);
		if (indice == muchasGracias.length) indice--;
		let imagenMuchasGracias = "/imagenes/0-Base/Muchas-gracias/" + muchasGracias[indice];
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
