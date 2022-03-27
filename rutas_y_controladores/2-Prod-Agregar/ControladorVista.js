"use strict";
// Definir variables
const fs = require("fs");
const path = require("path");
const requestPromise = require("request-promise");
const buscar_x_PC = require("../../funciones/Prod-Agregar/1-Buscar_x_PC");
const procesarProd = require("../../funciones/Prod-Agregar/2-Procesar");
const validarProd = require("../../funciones/Prod-Agregar/3-Validar");
const variables = require("../../funciones/Varias/Variables");
const BD_genericas = require("../../funciones/BD/Genericas");
const BD_especificas = require("../../funciones/BD/Especificas");
const especificas = require("../../funciones/Varias/Especificas");

module.exports = {
	palabrasClaveForm: async (req, res) => {
		// 1. Tema y Código
		let tema = "agregar";
		let codigo = "palabrasClave";
		// 2. Data Entry propio y errores
		let palabrasClave = req.session.palabrasClave ? req.session.palabrasClave : req.cookies.palabrasClave;
		let errores = req.session.erroresPC
			? req.session.erroresPC
			: palabrasClave
			? await validarProd.palabrasClave(palabrasClave)
			: "";
		// 3. Eliminar session y cookie posteriores, si existen
		especificas.borrarSessionCookies(req, res, "palabrasClave");
		if (req.cookies.datosTerminaste) res.clearCookie("datosTerminaste");
		if (req.session.datosTerminaste) delete req.session.datosTerminaste;
		// 4. Render del formulario
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Agregar - Palabras Clave",
			link: req.originalUrl,
			palabrasClave,
			errores,
		});
	},

	palabrasClaveGuardar: async (req, res) => {
		// 1. Guardar el data entry en session y cookie
		let palabrasClave = req.body.palabrasClave;
		req.session.palabrasClave = palabrasClave;
		res.cookie("palabrasClave", palabrasClave, {maxAge: unDia});
		// 2. Si hay errores de validación, redireccionar
		let errores = await validarProd.palabrasClave(palabrasClave);
		if (errores.palabrasClave) {
			req.session.erroresPC = errores;
			return res.redirect("/producto/agregar/palabras-clave");
		}
		// 3. Generar la session para la siguiente instancia
		req.session.desambiguar = palabrasClave;
		res.cookie("desambiguar", palabrasClave, {maxAge: unDia});
		// 4. Redireccionar a la siguiente instancia
		req.session.erroresPC = false;
		return res.redirect("/producto/agregar/desambiguar");
	},

	desambiguarForm: async (req, res) => {
		// 1. Tema y Código
		let tema = "agregar";
		let codigo = "desambiguar";
		// 2. Eliminar session y cookie posteriores, si existen
		especificas.borrarSessionCookies(req, res, "desambiguar");
		if (req.cookies.datosTerminaste) res.clearCookie("datosTerminaste");
		if (req.session.datosTerminaste) delete req.session.datosTerminaste;
		// 3. Si se perdió la info anterior, volver a esa instancia
		let palabrasClave = req.session.desambiguar ? req.session.desambiguar : req.cookies.desambiguar;
		if (!palabrasClave) return res.redirect("/producto/agregar/palabras-clave");
		// 3. Errores
		let errores = req.session.erroresDES ? req.session.erroresDES : "";
		// 4. Preparar los datos
		let desambiguar = await buscar_x_PC.search(palabrasClave);
		let {prod_nuevos, prod_yaEnBD, mensaje} = prepararMensaje(desambiguar);
		// 5. Render del formulario
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Agregar - Desambiguar",
			link: req.originalUrl,
			prod_nuevos,
			prod_yaEnBD,
			mensaje,
			palabrasClave: desambiguar.palabrasClave,
			errores,
		});
	},

	desambiguarGuardar: async (req, res) => {
		// 1. Obtener más información del producto
		let infoTMDBparaDD = await procesarProd["infoTMDBparaDD_" + req.body.entidad_TMDB](req.body);
		// 2. Averiguar si hay errores de validación
		let errores = await validarProd.desambiguar(infoTMDBparaDD);
		// 3. Si la colección está creada, pero su capítulo NO, actualizar los capítulos y redireccionar
		if (errores.mensaje == "agregarCapitulos") {
			await procesarProd.agregarCapitulosNuevos(errores.en_colec_id, errores.colec_TMDB_id);
			return res.redirect("/producto/agregar/desambiguar");
		}
		// 4. Si es una película de una colección que no existe en la BD, cambiar la película por la colección
		if (errores.mensaje == "agregarColeccion")
			infoTMDBparaDD = await procesarProd.infoTMDBparaDD_collection({
				TMDB_id: errores.colec_TMDB_id,
			});
		// 5. Generar la session para la siguiente instancia
		req.session.datosDuros = infoTMDBparaDD;
		res.cookie("datosDuros", infoTMDBparaDD, {maxAge: unDia});
		res.cookie("datosOriginales", infoTMDBparaDD, {maxAge: unDia});
		// 6. Redireccionar a la siguiente instancia
		req.session.erroresDES = false;
		res.redirect("/producto/agregar/datos-duros");
	},

	tipoProd_Form: async (req, res) => {
		// 1. Tema y Código
		let tema = "agregar";
		let codigo = "tipoProducto";
		// 2. Eliminar session y cookie posteriores, si existen
		especificas.borrarSessionCookies(req, res, "tipoProducto");
		// 3. Data Entry propio
		let tipoProd = req.session.tipoProd ? req.session.tipoProd : req.cookies.tipoProd;
		// 4. Obtener los errores
		let errores = req.session.erroresTP ? req.session.erroresTP : "";
		// 5. Render del formulario
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Agregar - Tipo de Producto",
			link: req.originalUrl,
			dataEntry: tipoProd,
			autorizado_fa: req.session.usuario.autorizado_fa,
			errores,
		});
	},

	tipoProd_Guardar: async (req, res) => {
		// 1. Preparar los datos a guardar
		// 1. Guardar el data entry en session y cookie
		let tipoProd = {
			...req.body,
			fuente: "IM",
			productoNombre: especificas.entidadNombre(req.body.entidad),
		};
		req.session.tipoProd = tipoProd;
		res.cookie("tipoProd", tipoProd, {maxAge: unDia});
		// 2. Averiguar si hay errores de validación
		//let errores = await validarProd.desambiguar(infoTMDBparaDD);
		// 3. Si hay errores, redireccionar al Form
		// 4. Generar la session para la siguiente instancia
		req.session.datosDuros = tipoProd;
		res.cookie("datosDuros", tipoProd, {maxAge: unDia});
		res.cookie("datosOriginales", tipoProd, {maxAge: unDia});
		// 6. Redireccionar a la siguiente instancia
		req.session.erroresTP = false;
		res.redirect("/producto/agregar/datos-duros");
	},

	copiarFA_Form: async (req, res) => {
		// 1. Tema y Código
		let tema = "agregar";
		let codigo = "copiarFA";
		// 2. Eliminar session y cookie posteriores, si existen
		especificas.borrarSessionCookies(req, res, "copiarFA");
		// 3. Generar la cookie de datosOriginales
		if (req.body && req.body.entidad) {
			req.body.productoNombre = especificas.entidadNombre(req.body.entidad);
			req.body.fuente = "FA";
			req.session.copiarFA = req.body;
			res.cookie("copiarFA", req.body, {maxAge: unDia});
			res.cookie("datosOriginales", req.body, {maxAge: unDia});
		}
		// 4. Si se perdió la info anterior, volver a esa instancia
		let copiarFA = req.session.copiarFA ? req.session.copiarFA : req.cookies.copiarFA;
		if (!copiarFA) return res.redirect("/producto/agregar/tipo-producto");
		// 5. Detectar errores
		let errores = req.session.erroresFA
			? req.session.erroresFA
			: copiarFA
			? await validarProd.copiarFA(copiarFA)
			: "";
		// 6. Render del formulario
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Agregar - Copiar FA",
			link: "/producto/agregar/copiar-fa",
			dataEntry: copiarFA,
			errores,
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
		let errores = await validarProd.copiarFA(copiarFA);
		// 2.2. Averiguar si el FA_id ya está en la BD
		FA_id = await procesarProd.obtenerFA_id(req.body.direccion);
		if (!errores.direccion) {
			let elc_id = await BD_especificas.obtenerELC_id(copiarFA.entidad, "FA_id", FA_id);
			if (elc_id) {
				errores.direccion = "El código interno ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// 2.3. Si hay errores de validación, redireccionar
		if (errores.hay) {
			req.session.erroresFA = errores;
			return res.redirect("/producto/agregar/copiar-fa");
		}
		// 3. Si NO hay errores, generar la session para la siguiente instancia
		req.session.datosDuros = await procesarProd.infoFAparaDD(copiarFA);
		res.cookie("datosDuros", req.session.datosDuros, {maxAge: unDia});
		// 4. Completar la cookie datosOriginales con el FA_id
		let cookie = req.cookies.datosOriginales;
		cookie.FA_id = req.session.datosDuros.FA_id;
		res.cookie("datosOriginales", cookie, {maxAge: unDia});
		// 4. Redireccionar a la siguiente instancia
		req.session.erroresFA = false;
		return res.redirect("/producto/agregar/datos-duros");
	},

	datosDurosForm: async (req, res) => {
		// 1. Tema y Código
		let tema = "agregar";
		let codigo = "datosDuros";
		// 2. Eliminar session y cookie posteriores, si existen
		if (req.cookies.datosPers && req.cookies.datosPers.avatarDP) {
			especificas.borrarArchivo(req.cookies.datosPers.avatarBD, "./public/imagenes/9-Provisorio/");
		}
		especificas.borrarSessionCookies(req, res, "datosDuros");
		// 3. Si se perdió la info anterior, volver a esa instancia
		let datosDuros = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;
		if (!datosDuros) return res.redirect("/producto/agregar/desambiguar");
		// Averiguar el origen
		let origen =
			datosDuros.fuente == "TMDB"
				? "desambiguar"
				: datosDuros.fuente == "FA"
				? "copiar-fa"
				: datosDuros.fuente == "IM"
				? "tipo-producto"
				: "palabras-clave";
		// 4. Obtiene los campos que corresponden para la 'entidad'
		let camposDD = variables.camposDD().filter((n) => n[datosDuros.entidad]);
		// 5. Obtiene los errores
		let camposDD_errores = camposDD.map((n) => n.nombreDelCampo);
		let errores = req.session.erroresDD
			? req.session.erroresDD
			: await validarProd.datosDuros(camposDD_errores, datosDuros);
		// 6. Preparar variables para la vista
		let paises = datosDuros.paises_id
			? await especificas.paises_idToNombre(datosDuros.paises_id)
			: await BD_genericas.obtenerTodos("paises", "nombre");
		let idiomas = await BD_genericas.obtenerTodos("idiomas", "nombre");
		let camposDD_vista = camposDD.filter((n) => !n.omitirRutinaVista);
		// 7. Render del formulario
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Agregar - Datos Duros",
			link: req.originalUrl,
			dataEntry: datosDuros,
			errores,
			camposDD1: camposDD_vista.filter((n) => n.antesDePais),
			camposDD2: camposDD_vista.filter((n) => !n.antesDePais),
			paises,
			idiomas,
			origen,
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
		let errores = await validarProd.datosDuros(camposDD_errores, {...datosDuros, avatar});
		// 4. Si no hubieron errores en el nombre_original, averiguar si el TMDB_id/FA_id ya está en la BD
		if (!errores.nombre_original && datosDuros.fuente != "IM") {
			let elc_id = await BD_especificas.obtenerELC_id(
				datosDuros.entidad,
				datosDuros.fuente + "_id",
				datosDuros[datosDuros.fuente + "_id"]
			);
			if (elc_id) {
				errores.nombre_original = "El código interno ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// 5. Si no hay errores de imagen, revisar el archivo de imagen
		let rutaYnombre = req.file ? req.file.path : "";
		let tipo, tamano, nombre;
		if (!errores.avatar) {
			if (req.file) {
				// En caso de archivo por multer
				tipo = req.file.mimetype;
				tamano = req.file.size;
				nombre = req.file.filename;
			} else if (datosDuros.avatar) {
				// En caso de archivo sin multer
				let datos = await requestPromise
					.head(datosDuros.avatar)
					.then((n) => [n["content-type"], n["content-length"]]);
				tipo = datos[0];
				tamano = datos[1];
				nombre = Date.now() + path.extname(datosDuros.avatar);
				rutaYnombre = "./public/imagenes/9-Provisorio/" + nombre;
			}
			// Revisar errores nuevamente
			errores.avatar = especificas.revisarImagen(tipo, tamano);
			if (errores.avatar) errores.hay = true;
		}
		// 6. Si hay errores de validación, redireccionar
		if (errores.hay) {
			// Si se había grabado una archivo de imagen, borrarlo
			especificas.borrarArchivo(nombre, "./public/imagenes/9-Provisorio/");
			// Guardar los errores en session
			req.session.erroresDD = errores;
			// Redireccionar
			return res.redirect("/producto/agregar/datos-duros");
		}
		// 7. Configurar los valores de la variable 'avatar'
		let avatarDP = "/imagenes/9-Provisorio/" + nombre;
		let avatarBD = nombre;
		// 8. Si la imagen venía de TMDB, entonces grabarla
		if (datosDuros.fuente == "TMDB" && datosDuros.avatar && !req.file) {
			especificas.download(datosDuros.avatar, rutaYnombre);
			avatarDP = datosDuros.avatar;
		}
		// 9. Generar la session para la siguiente instancia
		req.session.datosPers = {
			...req.session.datosDuros,
			avatarDP,
			avatarBD,
		};
		res.cookie("datosPers", req.session.datosPers, {maxAge: unDia});
		// 10. Si la fuente es "IM", guardar algunos datos en la cookie "datosOriginales"
		let cookie = req.cookies.datosOriginales;
		if (datosDuros.fuente == "IM") cookie.nombre_original = datosDuros.nombre_original;
		if (datosDuros.fuente == "IM") cookie.nombre_castellano = datosDuros.nombre_castellano;
		res.cookie("datosOriginales", cookie, {maxAge: unDia});
		// 11. Redireccionar a la siguiente instancia
		req.session.erroresDD = false;
		return res.redirect("/producto/agregar/datos-personalizados");
	},

	datosPersForm: async (req, res) => {
		// 1. Tema y Código
		let tema = "agregar";
		let codigo = "datosPers";
		// 2. Eliminar session y cookie posteriores, si existen
		especificas.borrarSessionCookies(req, res, "datosPers");
		// 3. Si se perdió la info anterior, volver a esa instancia
		let datosPers = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
		if (!datosPers) return res.redirect("/producto/agregar/datos-duros");
		// 5. Preparar variables para la vista
		let camposDP = await variables.camposDP();
		// 4. Obtener los errores
		let errores = await validarProd.datosPers(camposDP, datosPers);
		// 6. Render del formulario
		//return res.send(errores)
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Agregar - Datos Personalizados",
			link: req.originalUrl,
			dataEntry: datosPers,
			errores,
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
		// 4. Guardar el data entry en session y cookie
		req.session.datosPers = datosPers;
		res.cookie("datosPers", req.session.datosPers, {maxAge: unDia});
		res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});
		// 5. Averiguar si hay errores de validación
		let camposDP = await variables.camposDP().then((n) => n.map((m) => m.nombreDelCampo));
		let errores = await validarProd.datosPers(camposDP, datosPers);
		// 6. Si hay errores de validación, redireccionar
		if (errores.hay) return res.redirect("/producto/agregar/datos-personalizados");
		// Si no hay errores, continuar
		// 8. Preparar la info para el siguiente paso
		req.session.confirma = req.session.datosPers;
		res.cookie("confirma", req.session.confirma, {maxAge: unDia});
		res.cookie("datosOriginales", req.cookies.datosOriginales, {maxAge: unDia});
		// 9. Redireccionar a la siguiente instancia
		req.session.erroresDP = false;
		return res.redirect("/producto/agregar/confirma");
	},

	confirmaForm: (req, res) => {
		// 1. Tema y Código
		let tema = "agregar";
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
		return res.render("Home", {
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
		// 7. Obtener la calificación
		let [fe_valores, entretiene, calidad_tecnica] = await Promise.all([
			BD_genericas.obtenerPorCampo("fe_valores", "id", confirma.fe_valores_id).then((n) => n.valor),
			BD_genericas.obtenerPorCampo("entretiene", "id", confirma.entretiene_id).then((n) => n.valor),
			BD_genericas.obtenerPorCampo("calidad_tecnica", "id", confirma.calidad_tecnica_id).then(
				(n) => n.valor
			),
		]);
		let calificacion = fe_valores * 0.5 + entretiene * 0.3 + calidad_tecnica * 0.2;
		let objetoCalificacion = {
			fe_valores,
			entretiene,
			calidad_tecnica,
			calificacion,
		};
		// 2. Guardar los datos de 'Original'
		let original = {
			...req.cookies.datosOriginales,
			...objetoCalificacion,
			creado_por_id: req.session.usuario.id,
		};
		let registro = await BD_genericas.agregarRegistro(original.entidad, original).then((n) => n.toJSON());
		// 3. Guardar los datos de 'Edición'
		confirma.avatar = confirma.avatarBD;
		let producto_id = especificas.entidad_id(confirma.entidad);
		let edicion = {
			// Datos de 'confirma'
			...confirma,
			editado_por_id: req.session.usuario.id,
			// Datos varios
			entidad: "productos_edic",
			["elc_" + producto_id]: registro.id,
		};
		edicion = BD_especificas.quitarDeEdicionLasCoincidenciasConOriginal(original, edicion);
		await BD_genericas.agregarRegistro(edicion.entidad, edicion);
		// 4. Si es una "collection" o "tv" (TMDB), agregar las partes en forma automática
		if (confirma.fuente == "TMDB" && confirma.entidad_TMDB != "movie") {
			confirma.entidad_TMDB == "collection"
				? procesarProd.agregarCapitulosDeCollection({...confirma, ...registro})
				: procesarProd.agregarCapitulosDeTV({...confirma, ...registro});
		}
		// 5. Guarda las calificaciones
		guardar_cal_registros({...confirma, ...objetoCalificacion}, registro);
		// 6. Mueve el avatar de 'provisorio' a 'revisar'
		especificas.moverImagenCarpetaDefinitiva(confirma.avatar, "3-ProdRevisar");
		// 7. Elimina todas las session y cookie del proceso AgregarProd
		especificas.borrarSessionCookies(req, res, "borrarTodo");
		// 8. Redireccionar
		return res.redirect(
			"/producto/agregar/terminaste/?entidad=" + confirma.entidad + "&id=" + registro.id
		);
	},

	terminasteForm: async (req, res) => {
		// 1. Tema y Código
		let tema = "agregar";
		let codigo = "terminaste";
		// 2. Obtener los datos clave del producto
		let entidad = req.query.entidad;
		let id = req.query.id;
		// 4. Obtener los demás datos del producto
		let registroProd = await BD_genericas.obtenerPorIdConInclude(entidad, id, "status_registro");
		// Problema: PRODUCTO NO ENCONTRADO
		if (!registroProd) {
			let informacion = {
				mensaje: "Producto no encontrado",
				iconos: [
					{
						nombre: "fa-circle-left",
						link: req.session.urlAnterior,
						titulo: "Ir a la vista anterior",
					},
				],
			};
			return res.render("Errores", {informacion});
		}
		// Problema: PRODUCTO YA REVISADO
		if (!registroProd.status_registro.pend_aprobar)
			return res.redirect("/producto/detalle/?entidad=" + entidad + "&valor=" + id);
		// 5. Obtener el producto
		let productoNombre = especificas.entidadNombre(entidad);
		// 6. Preparar la información sobre las imágenes de MUCHAS GRACIAS
		let muchasGracias = fs.readdirSync("./public/imagenes/8-Agregar/Muchas-gracias/");
		let indice = parseInt(Math.random() * muchasGracias.length);
		if (indice == muchasGracias.length) indice--;
		let imagenMuchasGracias = "/imagenes/8-Agregar/Muchas-gracias/" + muchasGracias[indice];
		// 4. Render del formulario
		return res.render("Home", {
			tema,
			codigo,
			titulo: "Agregar - Terminaste",
			entidad,
			id,
			dataEntry: registroProd,
			productoNombre,
			imagenMuchasGracias,
			ruta: "/producto/",
		});
	},

	responsabilidad: (req, res) => {
		let tema = "agregar";
		let codigo = "responsabilidad";
		let titulo = "Agregar - Responsabilidad";
		return res.render("Home", {tema, codigo, titulo});
	},
};

let guardar_cal_registros = (confirma, registro) => {
	let producto_id = especificas.entidad_id(confirma.entidad);
	let datos = {
		entidad: "cal_registros",
		usuario_id: registro.creado_por_id,
		[producto_id]: registro.id,
		fe_valores: confirma.fe_valores,
		entretiene: confirma.entretiene,
		calidad_tecnica: confirma.calidad_tecnica,
		resultado: confirma.calificacion,
	};
	BD_genericas.agregarRegistro(datos.entidad, datos);
};

let prepararMensaje = (desambiguar) => {
	let prod_nuevos = desambiguar.resultados.filter((n) => !n.YaEnBD);
	let prod_yaEnBD = desambiguar.resultados.filter((n) => n.YaEnBD);
	let coincidencias = desambiguar.resultados.length;
	let nuevos = prod_nuevos && prod_nuevos.length ? prod_nuevos.length : 0;
	let hayMas = desambiguar.hayMas;
	let mensaje =
		"Encontramos " +
		(coincidencias == 1
			? "una sola coincidencia, que " + (nuevos == 1 ? "no" : "ya")
			: (hayMas ? "muchas" : coincidencias) +
			  " coincidencias" +
			  (hayMas ? ". Te mostramos " + coincidencias : "") +
			  (nuevos == coincidencias ? ", ninguna" : nuevos ? ", " + nuevos + " no" : ", todas ya")) +
		" está" +
		(nuevos > 1 && nuevos < coincidencias ? "n" : "") +
		" en nuestra BD.";
	return {prod_nuevos, prod_yaEnBD, mensaje};
};
