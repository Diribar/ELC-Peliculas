// ************ Requires ************
let fs = require("fs");
let path = require("path");
let requestPromise = require("request-promise");
let buscar_x_PC = require("../../funciones/Prod-Agregar/1-Buscar_x_PC");
let procesarProd = require("../../funciones/Prod-Agregar/2-Procesar");
let validarProd = require("../../funciones/Prod-Agregar/3-Errores");
let variables = require("../../funciones/Prod-Agregar/4-Variables");
let BD_varias = require("../../funciones/BD/varias");
let varias = require("../../funciones/Varias/Varias");

// *********** Controlador ***********
module.exports = {
	palabrasClaveForm: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "palabrasClave";
		// 2. Data Entry propio y errores
		let palabrasClave = req.session.palabrasClave
			? req.session.palabrasClave
			: req.cookies.palabrasClave
			? req.cookies.palabrasClave
			: "";
		let errores = req.session.erroresPC
			? req.session.erroresPC
			: palabrasClave
			? await validarProd.palabrasClave(palabrasClave)
			: "";
		// 3. Eliminar session y cookie posteriores, si existen
		borrarSessionCookies(req, res, "palabrasClave");
		// 4. Render del formulario
		//return res.send(req.cookies);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			palabrasClave,
			errores,
		});
	},

	palabrasClaveGuardar: async (req, res) => {
		// 1. Guardar el data entry en session y cookie
		let palabrasClave = req.body.palabrasClave;
		req.session.palabrasClave = palabrasClave;
		res.cookie("palabrasClave", palabrasClave, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 2. Si hay errores de validación, redireccionar
		let errores = await validarProd.palabrasClave(palabrasClave);
		if (errores.palabrasClave) {
			req.session.erroresPC = errores;
			return res.redirect("/producto/agregar/palabras-clave");
		}
		// 3. Redireccionar a la siguiente instancia
		req.session.erroresPC = false;
		return res.redirect("/producto/agregar/desambiguar");
	},

	desambiguarForm: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "desambiguar";
		// 2. Eliminar session y cookie posteriores, si existen
		borrarSessionCookies(req, res, "desambiguar");
		// 3. Si se perdió la info anterior, volver a esa instancia
		let palabrasClave = req.session.palabrasClave
			? req.session.palabrasClave
			: req.cookies.palabrasClave
			? req.cookies.palabrasClave
			: "";
		if (!palabrasClave) return res.redirect("/producto/agregar/palabras-clave");
		// 3. Errores
		let errores = req.session.erroresDES ? req.session.erroresDES : "";
		// 4. Preparar los datos
		let desambiguar = await buscar_x_PC.search(palabrasClave);
		let {prod_nuevos, prod_yaEnBD, mensaje} = prepararMensaje(desambiguar);
		// 5. Render del formulario
		//return res.send(req.cookies);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			prod_nuevos,
			prod_yaEnBD,
			mensaje,
			palabrasClave: desambiguar.palabrasClave,
			errores,
		});
	},

	desambiguarGuardar: async (req, res) => {
		//return res.send(req.body)
		// 1. Obtener más información del producto
		infoTMDBparaDD = await procesarProd["infoTMDBparaDD_" + req.body.entidad_TMDB](req.body);
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
		res.cookie("datosDuros", infoTMDBparaDD, {maxAge: 24 * 60 * 60 * 1000});
		// 7. Redireccionar a la siguiente instancia
		req.session.erroresDES = false;
		res.redirect("/producto/agregar/datos-duros");
	},

	tipoProducto_Form: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "tipoProducto";
		// 2. Eliminar session y cookie posteriores, si existen
		borrarSessionCookies(req, res, "tipoProducto");
		// 3. Data Entry propio y errores
		let tipoProducto = req.session.tipoProducto
			? req.session.tipoProducto
			: req.cookies.tipoProducto
			? req.cookies.tipoProducto
			: "";
		let errores = req.session.erroresTP
			? req.session.erroresTP
			: // : tipoProducto
			  // ? await validarProd.tipoProducto(tipoProducto)
			  "";
		autorizado_fa = req.session.usuario.autorizado_fa;
		// 4. Render del formulario
		//return res.send(req.cookies);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry: tipoProducto,
			errores,
			autorizado_fa,
		});
	},

	tipoProducto_Guardar: async (req, res) => {
		return res.send("Estoy en tipoProducto_Guardar");
	},

	copiarFA_Form: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "copiarFA";
		// 2. Eliminar session y cookie posteriores, si existen
		borrarSessionCookies(req, res, "copiarFA");
		// 3. Data Entry propio y errores
		let copiarFA = req.session.copiarFA
			? req.session.copiarFA
			: req.cookies.copiarFA
			? req.cookies.copiarFA
			: "";
		let errores = req.session.erroresCFA
			? req.session.erroresCFA
			: copiarFA
			? await validarProd.copiarFA(copiarFA)
			: "";
		// 4. Render del formulario
		//return res.send(req.cookies);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry: copiarFA,
			errores,
			colecPropias,
			colecAjenas,
		});
	},

	copiarFA_Guardar: async (req, res) => {
		// 1. Guardar el data entry en session y cookie
		let copiarFA = req.body;
		req.session.copiarFA = copiarFA;
		res.cookie("copiarFA", copiarFA, {maxAge: 24 * 60 * 60 * 1000});
		// 2.1. Averiguar si hay errores de validación
		let errores = await validarProd.copiarFA(copiarFA);
		// 2.2. Averiguar si el FA_id ya está en la BD
		FA_id = await procesarProd.obtenerFA_id(req.body.direccion);
		if (!errores.direccion) {
			elc_id = await BD_varias.obtenerELC_id({
				entidad: copiarFA.entidad,
				campo: "FA_id",
				valor: FA_id,
			});
			if (elc_id) {
				errores.direccion = "El código interno ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// 2.3. Si hay errores de validación, redireccionar
		if (errores.hay) {
			req.session.erroresCFA = errores;
			return res.redirect("/producto/agregar/copiar-fa");
		}
		// 3. Si NO hay errores, generar la session para la siguiente instancia
		req.session.datosDuros = await procesarProd.infoFAparaDD(copiarFA);
		res.cookie("datosDuros", req.session.datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Redireccionar a la siguiente instancia
		req.session.erroresCFA = false;
		return res.redirect("/producto/agregar/datos-duros");
	},

	datosDurosForm: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "datosDuros";
		// 2. Eliminar session y cookie posteriores, si existen
		if (req.cookies.datosPers && req.cookies.datosPers.avatarDP) {
			rutaYnombre = "./public/imagenes/9-Provisorio/" + req.cookies.datosPers.avatarDP;
			if (fs.existsSync(rutaYnombre)) fs.unlinkSync(rutaYnombre);
		}
		borrarSessionCookies(req, res, "datosDuros");
		//return res.send(req.cookies);
		// 3. Si se perdió la info anterior, volver a esa instancia
		datosDuros = req.session.datosDuros
			? req.session.datosDuros
			: req.cookies.datosDuros
			? req.cookies.datosDuros
			: "";
		origen =
			!!req.session.desambiguar || req.cookies.desambiguar
				? "desambiguar"
				: !!req.session.copiarFA || req.cookies.copiarFA
				? "copiar-fa"
				: "palabras-clave";
		if (!datosDuros) return res.redirect("/producto/agregar/" + origen);
		// 5. Guardar DatosTerminaste
		datosTerminaste = funcDatosTerminaste(datosDuros);
		req.session.datosTerminaste = datosTerminaste;
		res.cookie("datosTerminaste", datosTerminaste, {maxAge: 24 * 60 * 60 * 1000});
		// 6. Detectar errores
		let errores = req.session.erroresDD
			? req.session.erroresDD
			: await validarProd.datosDuros(datosDuros, [
					...variables.camposDD1(),
					...variables.camposDD2(),
			  ]);
		//return res.send(errores)
		let paises = datosDuros.paises_id
			? await varias.paises_idToNombre(datosDuros.paises_id)
			: await BD_varias.obtenerTodos("paises", "nombre");
		// 7. Render del formulario
		//return res.send(datosDuros);
		//return res.send(req.cookies);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry: datosDuros,
			paises,
			errores,
			camposDD1: variables.camposDD1(),
			camposDD2: variables.camposDD2(),
		});
	},

	datosDurosGuardar: async (req, res) => {
		// 1. Si se perdió la info anterior, volver a esa instancia
		aux = req.session.datosDuros ? req.session.datosDuros : req.cookies.datosDuros;
		origen =
			req.session.desambiguar || req.cookies.desambiguar
				? "desambiguar"
				: req.session.copiarFA || req.cookies.copiarFA
				? "copiar-fa"
				: "palabras-clave";
		if (!aux) return res.redirect("/producto/agregar/" + origen);
		// 3. Guardar el data entry en session y cookie
		let datosDuros = {...aux, ...req.body};
		req.session.datosDuros = datosDuros;
		res.cookie("datosDuros", datosDuros, {maxAge: 24 * 60 * 60 * 1000});
		// 4. Averiguar si hay errores de validación. Se usa el nombre del archivo multer, si existe
		avatar = req.file ? req.file.filename : datosDuros.avatar;
		let errores = await validarProd.datosDuros({...datosDuros, avatar}, [
			...variables.camposDD1(),
			...variables.camposDD2(),
		]);
		// 5. Si no hubieron errores en el nombre_original, averiguar si el TMDB_id/FA_id ya está en la BD
		if (!errores.nombre_original) {
			elc_id = await BD_varias.obtenerELC_id({
				entidad: datosDuros.entidad,
				campo: datosDuros.fuente + "_id",
				valor: datosDuros[datosDuros.fuente + "_id"],
			});
			if (elc_id) {
				errores.nombre_original =
					"El código interno ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// 6. Si aún no hay errores de imagen, revisar el archivo de imagen
		rutaYnombre = req.file ? req.file.path : "";
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
			errores.avatar = varias.revisarImagen(tipo, tamano);
			if (errores.avatar) errores.hay = true;
		}
		// 7. Si hay errores de validación, redireccionar
		if (errores.hay) {
			// Si se había grabado una archivo de imagen, borrarlo
			if (rutaYnombre && fs.existsSync(rutaYnombre)) fs.unlinkSync(rutaYnombre);
			// Guardar los errores en session
			req.session.erroresDD = errores;
			// Redireccionar
			return res.redirect("/producto/agregar/datos-duros");
		}
		// Configurar los valores de la variable 'avatar'
		let avatarDP = "/imagenes/9-Provisorio/" + nombre;
		let avatarCF = nombre;
		// Si la imagen venía de TMDB, entonces grabarla
		if (datosDuros.fuente == "TMDB" && datosDuros.avatar && !req.file) {
			varias.download(datosDuros.avatar, rutaYnombre);
			avatarDP = datosDuros.avatar;
		}
		// 8. Generar la session para la siguiente instancia
		req.session.datosPers = {
			...req.session.datosDuros,
			avatarDP,
			avatarCF,
		};
		res.cookie("datosPers", req.session.datosPers, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 9. Redireccionar a la siguiente instancia
		req.session.erroresDD = false;
		return res.redirect("/producto/agregar/datos-personalizados");
	},

	datosPersForm: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "datosPers";
		// 2. Eliminar session y cookie posteriores, si existen
		borrarSessionCookies(req, res, "datosPers");
		// 3. Si se perdió la info anterior, volver a esa instancia
		datosPers = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers
			? req.cookies.datosPers
			: "";
		if (!datosPers) return res.redirect("/producto/agregar/datos-duros");
		// 4. Render del formulario
		// return res.send(req.cookies);
		let errores = req.session.erroresDP ? req.session.erroresDP : "";
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry: datosPers,
			errores,
			datosPersSelect: await variables.datosPersSelect(),
			datosPersInput: variables.datosPersInput(),
		});
	},

	datosPersGuardar: async (req, res) => {
		// 1.1. Si se perdió la info anterior, volver a esa instancia
		aux = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
		if (!aux) return res.redirect("/producto/agregar/datos-duros");
		// 1.2. Sumar el req.body a lo que ya se tenía
		let datosPers = {...aux, ...req.body};
		// 1.3. Si no se guardaron datos de RCLV, se quitan del dataEntry para evitar conflicto con la BD
		if (!datosPers.personaje_historico_id) delete datosPers.personaje_historico_id;
		if (!datosPers.hecho_historico_id) delete datosPers.hecho_historico_id;
		// 1.4. Guardar el data entry en session y cookie
		req.session.datosPers = datosPers;
		res.cookie("datosPers", datosPers, {maxAge: 24 * 60 * 60 * 1000});
		// 2.1. Averiguar si hay errores de validación
		camposDP = [...(await variables.datosPersSelect()), ...variables.datosPersInput()];
		let errores = await validarProd.datosPers(datosPers, camposDP);
		// 2.2. Si hay errores de validación, redireccionar
		if (errores.hay) {
			req.session.erroresDP = errores;
			return res.redirect("/producto/agregar/datos-personalizados");
		}
		// 3. Si no hay errores, continuar
		// Obtener la calificación
		fe_valores = await BD_varias.filtrarPorParametro(
			"fe_valores",
			"id",
			req.body.fe_valores_id
		).then((n) => n.valor);
		entretiene = await BD_varias.filtrarPorParametro(
			"entretiene",
			"id",
			req.body.entretiene_id
		).then((n) => n.valor);
		calidad_tecnica = await BD_varias.filtrarPorParametro(
			"calidad_tecnica",
			"id",
			req.body.calidad_tecnica_id
		).then((n) => n.valor);
		calificacion = fe_valores * 0.5 + entretiene * 0.3 + calidad_tecnica * 0.2;
		// Preparar la info para el siguiente paso
		req.session.confirma = {
			...req.session.datosPers,
			fe_valores,
			entretiene,
			calidad_tecnica,
			calificacion,
			creada_por_id: req.session.usuario.id,
		};
		res.cookie("confirma", req.session.confirma, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		//Redireccionar a la siguiente instancia
		req.session.erroresDP = false;
		return res.redirect("/producto/agregar/confirma");
	},

	confirmaForm: (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "confirma";
		// 2. Si se perdió la info anterior, volver a esa instancia
		confirma = req.session.confirma
			? req.session.confirma
			: req.cookies.confirma
			? req.cookies.confirma
			: "";
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
		//return res.send(req.cookies);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry: confirma,
			direccion,
			actuacion,
		});
	},

	confirmaGuardar: async (req, res) => {
		// 1. Si se perdió la info anterior, volver a esa instancia
		confirma = req.session.confirma
			? req.session.confirma
			: req.cookies.confirma
			? req.cookies.confirma
			: "";
		if (!confirma) return res.redirect("/producto/agregar/datos-personalizados");
		// 2. Guardar el registro del producto
		confirma.avatar = confirma.avatarCF;
		registro = await BD_varias.agregarRegistro(confirma);
		// 3. Guardar datosTerminaste
		datosTerminaste = funcDatosTerminaste({...confirma, id: registro.id});
		req.session.datosTerminaste = datosTerminaste;
		res.cookie("datosTerminaste", datosTerminaste, {maxAge: 24 * 60 * 60 * 1000});
		// 4. Funciones anexas
		// Guardar la relación producto-paises
		guardarRelacionConPaises({...confirma, producto_id: registro.id});
		// Si es una "collection" o "tv" (TMDB), agregar las partes en forma automática
		if (confirma.fuente == "TMDB" && confirma.entidad_TMDB != "movie") {
			confirma.entidad_TMDB == "collection"
				? procesarProd.agregarCapitulosDeCollection({...confirma, ...registro.dataValues})
				: procesarProd.agregarCapitulosDeTV({...confirma, ...registro.dataValues});
		}
		// Actualizar "cantProductos" en "Relación con la vida"
		actualizarRCLV("historicos_personajes", registro.personaje_historico_id);
		actualizarRCLV("historicos_hechos", registro.hecho_historico_id);
		// Miscelaneas
		guardar_us_calificaciones(confirma, registro);
		varias.moverImagenCarpetaDefinitiva(confirma.avatar, "2-Productos");
		// Eliminar todas las session y cookie del proceso AgregarProd
		borrarSessionCookies(req, res, "borrarTodo");
		// 5. Redireccionar
		return res.redirect("/producto/agregar/terminaste");
	},

	terminasteForm: (req, res) => {
		//return res.send(req.cookies);
		// 1. Tema y Código
		tema = "agregar";
		codigo = "terminaste";
		// 2. Obtener los datos clave del producto
		datosTerminaste = req.session.datosTerminaste
			? req.session.datosTerminaste
			: req.cookies.datosTerminaste
			? req.cookies.datosTerminaste
			: "";
		if (!datosTerminaste) return res.redirect("/producto/agregar/palabras-clave");
		// 3. Preparar la información sobre las imágenes de MUCHAS GRACIAS
		archivos = fs.readdirSync("./public/imagenes/8-Agregar/Muchas-gracias/");
		muchasGracias = archivos.filter((n) => n.includes("Muchas gracias"));
		indice = parseInt(Math.random() * muchasGracias.length);
		imagenMuchasGracias = "/imagenes/8-Agregar/Muchas-gracias/" + muchasGracias[indice];
		// 4. Generar la info para redirigir a Detalle
		ruta = "/producto/detalle/?entidad=";
		entidad = datosTerminaste.entidad;
		id = datosTerminaste.id;
		urlDetalle = ruta + entidad + "&id=" + id;
		// 5. Eliminar session y cookie de datosTerminaste
		if (req.cookies.datosTerminaste) res.clearCookie("datosTerminaste");
		if (req.session.datosTerminaste) delete req.session.datosTerminaste;
		// 6. Render del formulario
		//return res.send(req.cookies);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry: datosTerminaste,
			imagenMuchasGracias,
			urlDetalle,
		});
	},

	responsabilidad: (req, res) => {
		tema = "agregar";
		codigo = "responsabilidad";
		return res.render("Home", {tema, codigo});
	},

	yaEnBD_Form: (req, res) => {
		return res.send("La Película / Colección ya está en nuestra BD");
	},
};

let funcDatosTerminaste = (datos) => {
	let datosClave = {
		entidad: datos.entidad,
		producto: datos.producto,
		fuente: datos.fuente,
		[datos.fuente + "_id"]: datos[datos.fuente + "_id"],
		nombre_castellano: datos.nombre_castellano,
	};
	if (datosClave.entidad == "capitulos") datosClave.coleccion_id = datos.coleccion_id
	if (datos.id) datosClave.id = datos.id;
	return datosClave;
};

let actualizarRCLV = async (entidad, id) => {
	if (id) {
		aux = await BD_varias.filtrarPorId(entidad, id);
		aux.cant_productos++;
		BD_varias.actualizarRegistro(entidad, {cant_productos: aux.cant_productos}, id);
	}
};

let guardar_us_calificaciones = (confirma, registro) => {
	entidad_id =
		confirma.entidad == "peliculas"
			? "pelicula_id"
			: confirma.entidad == "colecciones"
			? "coleccion_id"
			: "capitulo_id";
	let datos = {
		entidad: "us_calificaciones",
		usuario_id: confirma.creada_por_id,
		[entidad_id]: registro.id,
		fe_valores_id: confirma.fe_valores_id,
		entretiene_id: confirma.entretiene_id,
		calidad_tecnica_id: confirma.calidad_tecnica_id,
		fe_valores_valor: confirma.fe_valores,
		entretiene_valor: confirma.entretiene,
		calidad_tecnica_valor: confirma.calidad_tecnica,
		resultado: confirma.calificacion,
	};
	BD_varias.agregarRegistro(datos);
};

let borrarSessionCookies = (req, res, paso) => {
	let pasos = [
		"borrarTodo",
		"palabrasClave",
		"tipoProducto",
		"desambiguar",
		"tipoProducto",
		"copiarFA",
		"datosDuros",
		"datosPers",
		"confirma",
	];
	let indice = pasos.indexOf(paso) + 1;
	for (indice; indice < pasos.length; indice++) {
		if (req.session && req.session[pasos[indice]]) delete req.session[pasos[indice]];
		if (req.cookies && req.cookies[pasos[indice]]) res.clearCookie(pasos[indice]);
	}
};

let prepararMensaje = (desambiguar) => {
	let prod_nuevos = desambiguar.resultados.filter((n) => !n.YaEnBD);
	let prod_yaEnBD = desambiguar.resultados.filter((n) => n.YaEnBD);
	let coincidencias = desambiguar.resultados.length;
	nuevos = prod_nuevos && prod_nuevos.length ? prod_nuevos.length : 0;
	let hayMas = desambiguar.hayMas;
	mensaje =
		"Encontramos " +
		(coincidencias == 1
			? "una sola coincidencia, que " + (nuevos == 1 ? "no" : "ya")
			: (hayMas ? "muchas" : coincidencias) +
			  " coincidencias" +
			  (hayMas ? ". Te mostramos " + coincidencias : "") +
			  (nuevos == coincidencias
					? ", ninguna"
					: nuevos
					? ", " + nuevos + " no"
					: ", todas ya")) +
		" está" +
		(nuevos > 1 && nuevos < coincidencias ? "n" : "") +
		" en nuestra BD.";
	return {prod_nuevos, prod_yaEnBD, mensaje};
};

let guardarRelacionConPaises = async (datos) => {
	producto_id = (datos.entidad == "peliculas" ? "pelicula" : "coleccion") + "_id";
	paises_idArray = datos.paises_id.split(", ");
	for (pais_id of paises_idArray) {
		await BD_varias.agregarRegistro({
			entidad: "relacion_pais_prod",
			pais_id,
			[producto_id]: datos.producto_id,
		});
	}
};
