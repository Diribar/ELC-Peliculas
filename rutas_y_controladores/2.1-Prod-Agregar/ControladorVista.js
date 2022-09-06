"use strict";
// Definir variables
const fs = require("fs");
const path = require("path");
const requestPromise = require("request-promise");
// Definir funciones
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const compartidas = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const buscar_x_PC = require("./FN-Buscar_x_PC");
const procesos = require("./FN-Procesos");
const validar = require("./FN-Validar");

module.exports = {
	palabrasClaveForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		let codigo = "palabrasClave";
		// 2. Data Entry propio y errores
		let palabrasClave = req.session.palabrasClave ? req.session.palabrasClave : req.cookies.palabrasClave;
		// 3. Eliminar session y cookie posteriores, si existen
		procesos.borrarSessionCookies(req, res, "palabrasClave");
		// 4. Render del formulario
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Palabras Clave",
			link: req.originalUrl,
			palabrasClave,
		});
	},
	palabrasClaveGuardar: async (req, res) => {
		// 1. Guardar el data entry en session y cookie
		let palabrasClave = req.body.palabrasClave;
		req.session.palabrasClave = palabrasClave;
		res.cookie("palabrasClave", palabrasClave, {maxAge: unDia});
		// 2. Si hay errores de validación, redireccionar
		let errores = await validar.palabrasClave(palabrasClave);
		if (errores.palabrasClave) return res.redirect("/producto/agregar/palabras-clave");
		// 3. Redireccionar a la siguiente instancia
		return res.redirect("/producto/agregar/desambiguar");
	},
	desambiguarForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		let codigo = "desambiguar";
		// 2. Eliminar session y cookie posteriores, si existen
		procesos.borrarSessionCookies(req, res, "desambiguar");
		// 3. Si se perdió la info anterior, volver a esa instancia
		let palabrasClave = req.session.palabrasClave ? req.session.palabrasClave : req.cookies.palabrasClave;
		if (!palabrasClave) return res.redirect("/producto/agregar/palabras-clave");
		// 4. Preparar los datos
		let desambiguar = req.session.desambiguar
			? req.session.desambiguar
			: await buscar_x_PC.search(palabrasClave, true);
		let [prod_nuevos, prod_yaEnBD, mensaje] = procesos.DS_prepararMensaje(desambiguar);
		// Conservar la información en session para no tener que procesarla de nuevo
		req.session.desambiguar = desambiguar;
		// 5. Render del formulario
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Desambiguar",
			link: req.originalUrl,
			prod_nuevos,
			prod_yaEnBD,
			mensaje,
			palabrasClave: desambiguar.palabrasClave,
		});
	},
	desambiguarGuardar: async (req, res) => {
		// 1. Obtener más información del producto
		let infoTMDBparaDD = await procesos["DS_infoTMDBparaDD_" + req.body.TMDB_entidad](req.body);
		// 2. Averiguar si hay errores de validación
		let errores = await validar.desambiguar(infoTMDBparaDD);
		// 3. Si la colección está creada, pero su capítulo NO, actualizar los capítulos y redireccionar
		if (errores.mensaje == "agregarCapitulos") {
			await procesos.agregarCapitulosNuevos(errores.en_colec_id, errores.colec_TMDB_id);
			return res.redirect("/producto/agregar/desambiguar");
		}
		// 4. Si es una película de una colección que no existe en la BD, cambiar la película por la colección
		if (errores.mensaje == "agregarColeccion")
			infoTMDBparaDD = await procesos.DS_infoTMDBparaDD_collection({
				TMDB_id: errores.colec_TMDB_id,
			});
		// 5. Generar la session para la siguiente instancia
		req.session.datosDuros = infoTMDBparaDD;
		res.cookie("datosDuros", infoTMDBparaDD, {maxAge: unDia});
		res.cookie("datosOriginales", infoTMDBparaDD, {maxAge: unDia});
		// 6. Redireccionar a la siguiente instancia
		res.redirect("/producto/agregar/datos-duros");
	},
	tipoProd_Form: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		let codigo = "tipoProducto";
		// 2. Eliminar session y cookie posteriores, si existen
		procesos.borrarSessionCookies(req, res, "tipoProducto");
		// 3. Data Entry propio
		let tipoProd = req.session.tipoProd ? req.session.tipoProd : req.cookies.tipoProd;
		// 5. Render del formulario
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Tipo de Producto",
			link: req.originalUrl,
			dataEntry: tipoProd,
			autorizado_fa: req.session.usuario.autorizado_fa,
		});
	},
	tipoProd_Guardar: async (req, res) => {
		// 1. Preparar los datos a guardar
		// 1. Guardar el data entry en session y cookie
		let tipoProd = {
			...req.body,
			fuente: "IM",
			prodNombre: compartidas.obtenerEntidadNombre(req.body.entidad),
		};
		req.session.tipoProd = tipoProd;
		res.cookie("tipoProd", tipoProd, {maxAge: unDia});
		// 2. Averiguar si hay errores de validación
		//let errores = await validar.desambiguar(infoTMDBparaDD);
		// 3. Si hay errores, redireccionar al Form
		// 4. Generar la session para la siguiente instancia
		req.session.datosDuros = tipoProd;
		res.cookie("datosDuros", tipoProd, {maxAge: unDia});
		res.cookie("datosOriginales", tipoProd, {maxAge: unDia});
		// 6. Redireccionar a la siguiente instancia
		res.redirect("/producto/agregar/datos-duros");
	},
	copiarFA_Form: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		let codigo = "copiarFA";
		// 2. Eliminar session y cookie posteriores, si existen
		procesos.borrarSessionCookies(req, res, "copiarFA");
		// 3. Generar la cookie de datosOriginales
		if (req.body && req.body.entidad) {
			req.body.prodNombre = compartidas.obtenerEntidadNombre(req.body.entidad);
			req.body.fuente = "FA";
			req.session.copiarFA = req.body;
			res.cookie("copiarFA", req.body, {maxAge: unDia});
			res.cookie("datosOriginales", req.body, {maxAge: unDia});
		}
		// 4. Si se perdió la info anterior, volver a esa instancia
		let copiarFA = req.session.copiarFA ? req.session.copiarFA : req.cookies.copiarFA;
		if (!copiarFA) return res.redirect("/producto/agregar/tipo-producto");
		// 5. Render del formulario
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Copiar FA",
			link: "/producto/agregar/copiar-fa",
			dataEntry: copiarFA,
		});
	},
	copiarFA_Guardar: async (req, res) => {
		// 1. Si se perdió la info anterior, volver a esa instancia
		let aux = req.session.copiarFA ? req.session.copiarFA : req.cookies.copiarFA;
		if (!aux) return res.redirect("/producto/agregar/tipo-producto");
		// 1. Guardar el data entry en session y cookie
		let copiarFA = {...aux, ...req.body};
		req.session.copiarFA = copiarFA;
		res.cookie("copiarFA", copiarFA, {maxAge: unDia});
		// 2.1. Averiguar si hay errores de validación
		let errores = await validar.copiarFA(copiarFA);
		// 2.2. Averiguar si el FA_id ya está en la BD
		FA_id = await procesos.obtenerFA_id(req.body.direccion);
		if (!errores.direccion) {
			let elc_id = await BD_especificas.obtenerELC_id(copiarFA.entidad, {FA_id: FA_id});
			if (elc_id) {
				errores.direccion = "El código interno ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// 2.3. Si hay errores de validación, redireccionar
		if (errores.hay) return res.redirect("/producto/agregar/copiar-fa");
		// 3. Si NO hay errores, generar la session para la siguiente instancia
		req.session.datosDuros = await procesos.infoFAparaDD(copiarFA);
		res.cookie("datosDuros", req.session.datosDuros, {maxAge: unDia});
		// 4. Completar la cookie datosOriginales con el FA_id
		let cookie = req.cookies.datosOriginales;
		cookie.FA_id = req.session.datosDuros.FA_id;
		res.cookie("datosOriginales", cookie, {maxAge: unDia});
		// 4. Redireccionar a la siguiente instancia
		return res.redirect("/producto/agregar/datos-duros");
	},
	datosDurosForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		let codigo = "datosDuros";
		// Borrar archivo de imagen si existe
		let aux = req.cookies.datosPers;
		if (aux && aux.avatar_archivo)
			compartidas.borrarArchivo("./publico/imagenes/9-Provisorio/", aux.avatar_archivo);
		// 2. Eliminar session y cookie posteriores, si existen
		procesos.borrarSessionCookies(req, res, "datosDuros");
		// 3. Si se perdió la info anterior, volver a esa instancia
		let datosDuros = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;
		if (!datosDuros) return res.redirect("/producto/agregar/desambiguar");
		// 4. Variables
		let origen =
			datosDuros.fuente == "TMDB"
				? "desambiguar"
				: datosDuros.fuente == "FA"
				? "copiar-fa"
				: datosDuros.fuente == "IM"
				? "tipo-producto"
				: "palabras-clave";
		let camposDD = variables.camposDD().filter((n) => n[datosDuros.entidad]);
		// 5. Obtiene los errores
		let camposDD_errores = camposDD.map((n) => n.nombreDelCampo);
		let errores = req.session.erroresDD
			? req.session.erroresDD
			: await validar.datosDuros(camposDD_errores, datosDuros);
		// 6. Preparar variables para la vista
		let paises = datosDuros.paises_id ? await compartidas.paises_idToNombre(datosDuros.paises_id) : "";
		let BD_paises = !datosDuros.paises_id ? await BD_genericas.obtenerTodos("paises", "nombre") : [];
		let idiomas = await BD_genericas.obtenerTodos("idiomas", "nombre");
		let camposDD_vista = camposDD.filter((n) => !n.omitirRutinaVista);
		// 7. Render del formulario
		//return res.send(BD_paises)
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Datos Duros",
			link: req.originalUrl,
			dataEntry: datosDuros,
			camposDD1: camposDD_vista.filter((n) => n.antesDePais),
			camposDD2: camposDD_vista.filter((n) => !n.antesDePais),
			paises,
			BD_paises,
			idiomas,
			origen,
			errores,
		});
	},
	datosDurosGuardar: async (req, res) => {
		// 1. Si se perdió la info anterior, volver a esa instancia
		let aux = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;
		let origen =
			req.session.desambiguar || req.cookies.desambiguar
				? "desambiguar"
				: req.session.copiarFA || req.cookies.copiarFA
				? "copiar-fa"
				: "palabras-clave";
		if (!aux) return res.redirect("/producto/agregar/" + origen);
		// 2. Guardar el data entry en session y cookie
		let datosDuros = {...aux, ...req.body};
		req.session.datosDuros = datosDuros;
		res.cookie("datosDuros", datosDuros, {maxAge: unDia});
		res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});
		// 3. Averiguar si hay errores de validación
		let camposDD = variables.camposDD().filter((n) => n[datosDuros.entidad]);
		let camposDD_errores = camposDD.map((n) => n.nombreDelCampo);
		let avatar = req.file ? req.file.filename : datosDuros.avatar;
		let errores = await validar.datosDuros(camposDD_errores, {...datosDuros, avatar});
		// 4. Si no hubieron errores en el nombre_original, averiguar si el TMDB_id/FA_id ya está en la BD
		if (!errores.nombre_original && datosDuros.fuente != "IM") {
			let fuente_id = datosDuros.fuente + "_id";
			let elc_id = await BD_especificas.obtenerELC_id(datosDuros.entidad, {
				[fuente_id]: datosDuros[fuente_id],
			});
			if (elc_id) {
				errores.nombre_original = "El código interno ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// 5. Si no hay errores de imagen, revisar el archivo de imagen
		let avatar_archivo, rutaYnombre, tipo, tamano;
		if (!errores.avatar) {
			if (req.file) {
				// En caso de archivo por multer
				tipo = req.file.mimetype;
				tamano = req.file.size;
				avatar_archivo = req.file.filename;
				rutaYnombre = req.file.path;
			} else {
				// En caso de archivo sin multer
				let datos = await requestPromise.head(datosDuros.avatar);
				tipo = datos["content-type"];
				tamano = datos["content-length"];
				avatar_archivo = Date.now() + path.extname(datosDuros.avatar);
				rutaYnombre = "./publico/imagenes/9-Provisorio/" + avatar_archivo;
				// Descargar
				compartidas.descargar(datosDuros.avatar, rutaYnombre);
			}
			// Revisar errores nuevamente
			errores.avatar = compartidas.revisarImagen(tipo, tamano);
			if (errores.avatar) errores.hay = true;
		}
		// 6. Si hay errores de validación, redireccionar
		if (errores.hay) {
			// Si se había grabado una archivo de imagen, borrarlo
			compartidas.borrarArchivo("./publico/imagenes/9-Provisorio/", avatar_archivo);
			// Guardar los errores en 'session' porque pueden ser muy específicos
			req.session.erroresDD = errores;
			// Redireccionar
			return res.redirect("/producto/agregar/datos-duros");
		}
		// Armar campo 'mostrarAvatar'
		let mostrarAvatar = datosDuros.avatar.startsWith("http")
			? datosDuros.avatar
			: "/imagenes/9-Provisorio/" + datosDuros.avatar_archivo;
		// 9. Generar la session para la siguiente instancia
		req.session.datosPers = {
			...req.session.datosDuros,
			avatar_archivo,
			mostrarAvatar,
		};
		res.cookie("datosPers", req.session.datosPers, {maxAge: unDia});
		// 10. Si la fuente es "IM", guardar algunos datos en la cookie "datosOriginales"
		if (datosDuros.fuente == "IM") {
			let cookie = req.cookies.datosOriginales;
			cookie.nombre_original = datosDuros.nombre_original;
			cookie.nombre_castellano = datosDuros.nombre_castellano;
			res.cookie("datosOriginales", cookie, {maxAge: unDia});
		}
		// 11. Redireccionar a la siguiente instancia
		return res.redirect("/producto/agregar/datos-personalizados");
	},
	datosPersForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		let codigo = "datosPers";
		let userID = req.session.usuario.id;
		// 2. Eliminar session y cookie posteriores, si existen
		procesos.borrarSessionCookies(req, res, "datosPers");
		// 3. Si se perdió la info anterior, volver a esa instancia
		let datosPers = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
		if (!datosPers) return res.redirect("/producto/agregar/datos-duros");
		// 5. Preparar variables para la vista
		let camposDP = await variables.camposDP(userID);
		// 6. Render del formulario
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Datos Personalizados",
			link: req.originalUrl,
			dataEntry: datosPers,
			camposDP,
		});
	},
	datosPersGuardar: async (req, res) => {
		// 1. Si se perdió la info anterior, volver a esa instancia
		let aux = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
		if (!aux) return res.redirect("/producto/agregar/datos-duros");
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
		// 5. Averiguar si hay errores de validación
		let camposDP = await variables.camposDP().then((n) => n.map((m) => m.nombreDelCampo));
		let errores = await validar.datosPers(camposDP, datosPers);
		// 6. Si hay errores de validación, redireccionar
		if (errores.hay) return res.redirect("/producto/agregar/datos-personalizados");
		// Si no hay errores, continuar
		// 7. Preparar la info para el siguiente paso
		req.session.confirma = req.session.datosPers;
		res.cookie("confirma", req.session.confirma, {maxAge: unDia});
		res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});
		// 8. Redireccionar a la siguiente instancia
		return res.redirect("/producto/agregar/confirma");
	},
	confirmaForm: (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		let codigo = "confirma";
		let maximo, indice;
		// 2. Si se perdió la info anterior, volver a esa instancia
		let confirma = req.session.confirma ? req.session.confirma : req.cookies.confirma;
		if (!confirma) return res.redirect("/producto/agregar/datos-personalizados");
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
		// 5. Render del formulario
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Confirma",
			link: req.originalUrl,
			dataEntry: confirma,
			direccion,
			actuacion,
		});
	},
	confirmaGuardar: async (req, res) => {
		// 1. Si se perdió la info, volver a la instancia anterior
		let confirma = req.session.confirma ? req.session.confirma : req.cookies.confirma;
		if (!confirma) return res.redirect("/producto/agregar/datos-personalizados");
		// 2. Obtener la calificación
		let [fe_valores, entretiene, calidad_tecnica] = await Promise.all([
			BD_genericas.obtenerPorCampos("fe_valores", {id: confirma.fe_valores_id}).then((n) => n.valor),
			BD_genericas.obtenerPorCampos("entretiene", {id: confirma.entretiene_id}).then((n) => n.valor),
			BD_genericas.obtenerPorCampos("calidad_tecnica", {id: confirma.calidad_tecnica_id}).then(
				(n) => n.valor
			),
		]);
		let calificacion = fe_valores * 0.5 + entretiene * 0.3 + calidad_tecnica * 0.2;
		let calificaciones = {
			fe_valores,
			entretiene,
			calidad_tecnica,
			calificacion,
		};
		// 3. Guardar los datos de 'Original'
		let original = {
			...req.cookies.datosOriginales,
			...calificaciones,
			creado_por_id: req.session.usuario.id,
		};
		let registro = await BD_genericas.agregarRegistro(original.entidad, original);
		// 4. Guardar los datos de 'Edición'
		compartidas.guardar_edicion(
			confirma.entidad,
			"prods_edicion",
			registro,
			{...confirma}, // Se debe enviar así para preservar la variable de cambios
			req.session.usuario.id
		);
		// 5. Si es una "collection" o "tv" (TMDB), agregar las partes en forma automática
		if (confirma.fuente == "TMDB" && confirma.TMDB_entidad != "movie") {
			confirma.TMDB_entidad == "collection"
				? procesos.agregarCapitulosDeCollection({...confirma, ...registro})
				: procesos.agregarCapitulosDeTV({...confirma, ...registro});
		}
		// 6. Guarda las calificaciones
		procesos.guardar_cal_registros({...confirma, ...calificaciones}, registro);
		// 7. Mueve el avatar de 'provisorio' a 'revisar'
		compartidas.moverImagen(confirma.avatar_archivo, "9-Provisorio", "4-ProdRevisar");
		// 8. Elimina todas las session y cookie del proceso AgregarProd
		procesos.borrarSessionCookies(req, res, "borrarTodo");
		// 9. Borra la vista actual para que no vaya a vistaAnterior
		req.session.urlActual = "/";
		res.cookie("urlActual", "/", {maxAge: unDia});
		// 10. Redireccionar
		return res.redirect(
			"/producto/agregar/terminaste/?entidad=" + confirma.entidad + "&id=" + registro.id
		);
	},
	terminasteForm: async (req, res) => {
		// 1. Tema y Código
		const tema = "prod_agregar";
		let codigo = "terminaste";
		// 2. Obtener los datos clave del producto
		let entidad = req.query.entidad;
		let id = req.query.id;
		// 4. Obtener los demás datos del producto
		let registroProd = await BD_genericas.obtenerPorIdConInclude(entidad, id, "status_registro");
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
			return res.render("MI-Cartel", {informacion});
		}
		// Problema: PRODUCTO YA REVISADO
		if (!registroProd.status_registro.gr_creado)
			return res.redirect("/producto/detalle/?entidad=" + entidad + "&id=" + id);
		// 5. Obtener el producto
		let prodNombre = compartidas.obtenerEntidadNombre(entidad);
		// 6. Preparar la información sobre las imágenes de MUCHAS GRACIAS
		let muchasGracias = fs.readdirSync("./publico/imagenes/8-Agregar/Muchas-gracias/");
		let indice = parseInt(Math.random() * muchasGracias.length);
		if (indice == muchasGracias.length) indice--;
		let imagenMuchasGracias = "/imagenes/8-Agregar/Muchas-gracias/" + muchasGracias[indice];
		// 4. Render del formulario
		return res.render("GN0-Estructura", {
			tema,
			codigo,
			titulo: "Agregar - Terminaste",
			entidad,
			id,
			dataEntry: registroProd,
			prodNombre,
			imagenMuchasGracias,
			ruta: "/producto/",
		});
	},
};
