// ************ Requires ************
let fs = require("fs");
let path = require("path");
let requestPromise = require("request-promise");
let buscar_x_PC = require("../../funciones/Productos/1-Buscar_x_PC");
let procesarProd = require("../../funciones/Productos/2-Procesar");
let validarProd = require("../../funciones/Productos/3-Errores");
let variables = require("../../funciones/Productos/4-Variables");
let BD_varias = require("../../funciones/BD/varias");
let varias = require("../../funciones/Varias/varias");

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
		let errores = req.session.errores
			? req.session.errores
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
			req.session.errores = errores;
			return res.redirect("/producto/agregar/palabras-clave");
		}
		// 3. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/producto/agregar/desambiguar");
	},

	desambiguarForm: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "desambiguar";
		// 2. Eliminar session y cookie posteriores, si existen
		borrarSessionCookies(req, res, "desambiguar");
		// 3. Si se perdió la info anterior, volver a esa instancia
		//return res.send(req.cookies.desambiguar)
		let palabrasClave = req.session.palabrasClave
			? req.session.palabrasClave
			: req.cookies.palabrasClave
			? req.cookies.palabrasClave
			: "";
		if (!palabrasClave) return res.redirect("/producto/agregar/palabras-clave");
		// 3. Errores
		let errores = req.session.errores ? req.session.errores : "";
		// 4. Preparar los datos
		let desambiguar = await buscar_x_PC.search(palabrasClave)
		//return res.send(desambiguar)
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
		// 1. Obtener más información del producto
		infoParaDD = await procesarProd["infoParaDD_" + req.body.entidad_TMDB](req.body);
		//return res.send(infoParaDD)
		//if (infoParaDD.)
		// 2. Averiguar si hay errores de validación
		let errores = await validarProd.desambiguar(infoParaDD);
		// 3. Si no supera el filtro anterior, redireccionar
		//return res.send(errores);
		if (errores.hay) {
			req.session.errores = errores;
			if (errores.mensaje == "agregarColeccion") {
				return res.redirect("/producto/agregar/desambiguar");
			} else if (errores.mensaje == "agregarCapitulos") {
				// 4. Si la colección está creada, pero su capítulo NO, actualizar los capítulos
				//return res.send(errores)
				await procesarProd.agregarCapitulosFaltantes(
					errores.en_colec_id,
					errores.colec_TMDB_id
				);
				return res.redirect("/producto/agregar/desambiguar");
			} else return res.send("línea 113 - error de proceso");
		}
		// 5. Generar la session para la siguiente instancia
		req.session.datosDuros = infoParaDD;
		res.cookie("datosDuros", infoParaDD, {maxAge: 24 * 60 * 60 * 1000});
		// 6. Redireccionar a la siguiente instancia
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
		let errores = req.session.errores
			? req.session.errores
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
		let errores = req.session.errores
			? req.session.errores
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
			req.session.errores = errores;
			return res.redirect("/producto/agregar/copiar-fa");
		}
		// 3. Si NO hay errores, generar la session para la siguiente instancia
		req.session.datosDuros = await procesarProd.infoParaDD_prodFA(copiarFA);
		res.cookie("datosDuros", req.session.datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/producto/agregar/datos-duros");
	},

	datosDurosForm: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "datosDuros";
		// 2. Eliminar session y cookie posteriores, si existen
		if (req.cookies.datosPers && req.cookies.datosPers.avatar) {
			rutaYnombre = "./public/imagenes/9-Provisorio/" + req.cookies.datosPers.avatar;
			if (fs.existsSync(rutaYnombre)) fs.unlinkSync(rutaYnombre);
		}
		//return res.send(req.cookies);
		borrarSessionCookies(req, res, "datosDuros");
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
		// 5. Guardar datosClaveProd
		datosClaveProd = funcDatosClaveProd(datosDuros);
		req.session.datosClaveProd = datosClaveProd;
		res.cookie("datosClaveProd", datosClaveProd, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 6. Detectar errores
		let IM = datosDuros.fuente == "IM" ? {campo: "en_coleccion", peliculas: true} : {};
		let errores = req.session.errores
			? req.session.errores
			: await validarProd.datosDuros(datosDuros, [
					IM,
					...variables.camposDD1(),
					...variables.camposDD2(),
			  ]);
		//return res.send(errores)
		let paises = await BD_varias.obtenerTodos("paises", "nombre");
		let pais = datosDuros.pais_id ? await varias.pais_idToNombre(datosDuros.pais_id) : "";
		// 7. Render del formulario
		//return res.send(req.cookies);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry: datosDuros,
			pais,
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
		if (req.file && !req.body.avatar) req.body.avatar = req.file.filename;
		let datosDuros = {...aux, ...req.body};
		req.session.datosDuros = datosDuros;
		res.cookie("datosDuros", datosDuros, {maxAge: 24 * 60 * 60 * 1000});
		// 4. Averiguar si hay errores de validación
		let errores = await validarProd.datosDuros(datosDuros, [
			...variables.camposDD1(),
			...variables.camposDD2(),
		]);
		// return res.send(errores);
		// 5. Si no hubieron errores en el nombre_original, averiguar si el TMDB_id/FA_id ya está en la BD
		if (!errores.nombre_original) {
			datos={
				entidad: datosDuros.entidad,
				campo: datosDuros.fuente + "_id",
				valor: datosDuros[datosDuros.fuente + "_id"],
			}
			elc_id = await BD_varias.obtenerELC_id(datos);
			if (elc_id) {
				errores.nombre_original =
					"El código interno ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// 6. Si aún no hay errores de imagen, revisar el archivo de imagen
		if (req.file) {
			// En caso de archivo por multer
			tipo = req.file.mimetype;
			tamano = req.file.size;
			nombre = req.file.filename;
			rutaYnombre = req.file.path;
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
		// Revisar errores
		if (!errores.avatar) errores.avatar = varias.revisarImagen(tipo, tamano);
		if (errores.avatar) errores.hay = true;
		// 7. Si hay errores de validación, redireccionar
		if (errores.hay) {
			//return res.send(errores)
			if (fs.existsSync(rutaYnombre)) fs.unlinkSync(rutaYnombre); // Borrar el archivo de imagen
			req.session.errores = errores;
			return res.redirect("/producto/agregar/datos-duros");
		}
		// Si la imagen venía de TMDB, entonces grabarla
		if (datosDuros.fuente == "TMDB") varias.download(datosDuros.avatar, rutaYnombre);
		// 8. Generar la session para la siguiente instancia
		avatarDP =
			datosDuros.fuente == "TMDB" ? datosDuros.avatar : "/imagenes/9-Provisorio/" + nombre;
		req.session.datosPers = {
			...req.session.datosDuros,
			avatarDP: avatarDP,
			avatar: nombre,
		};
		res.cookie("datosPers", req.session.datosPers, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 9. Redireccionar a la siguiente instancia
		req.session.errores = false;
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
		// 4. Guardar datosClaveProd
		datosClaveProd = funcDatosClaveProd(datosPers);
		req.session.datosClaveProd = datosClaveProd;
		res.cookie("datosClaveProd", datosClaveProd, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 5. Render del formulario
		//return res.send(req.cookies);
		//return res.send(datosPers);
		let errores = req.session.errores ? req.session.errores : "";
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
			req.session.errores = errores;
			return res.redirect("/producto/agregar/datos-personalizados");
		}
		// 3. Si no hay errores, continuar
		// Obtener la calificación
		fe_valores = await BD_varias.obtenerPorParametro("fe_valores", "id", req.body.fe_valores_id)
			.then((n) => n.valor / 4)
			.then((n) => n.toFixed(2));
		entretiene = await BD_varias.obtenerPorParametro("entretiene", "id", req.body.entretiene_id)
			.then((n) => n.valor / 4)
			.then((n) => n.toFixed(2));
		calidad_tecnica = await BD_varias.obtenerPorParametro(
			"calidad_tecnica",
			"id",
			req.body.calidad_tecnica_id
		)
			.then((n) => n.valor / 4)
			.then((n) => n.toFixed(2));
		calificacion = (fe_valores * 0.5 + entretiene * 0.3 + calidad_tecnica * 0.2).toFixed(2);
		// Preparar la info para el siguiente paso
		req.session.confirmar = {
			...req.session.datosPers,
			fe_valores,
			entretiene,
			calidad_tecnica,
			calificacion,
			creada_por_id: req.session.usuario.id,
		};
		res.cookie("confirmar", req.session.confirmar, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		//Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/producto/agregar/confirmar");
	},

	confirmarForm: (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "confirmar";
		// 2. Si se perdió la info anterior, volver a esa instancia
		confirmar = req.session.confirmar
			? req.session.confirmar
			: req.cookies.confirmar
			? req.cookies.confirmar
			: "";
		if (!confirmar) return res.redirect("/producto/agregar/datos-personalizados");
		// 3. Guardar datosClaveProd
		datosClaveProd = funcDatosClaveProd(confirmar);
		req.session.datosClaveProd = datosClaveProd;
		res.cookie("datosClaveProd", datosClaveProd, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Render del formulario
		//return res.send(req.cookies);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry: confirmar,
		});
	},

	confirmarGuardar: async (req, res) => {
		// 1. Si se perdió la info anterior, volver a esa instancia
		confirmar = req.session.confirmar
			? req.session.confirmar
			: req.cookies.confirmar
			? req.cookies.confirmar
			: "";
		if (!confirmar) return res.redirect("/producto/agregar/datos-personalizados");
		// 2. Guardar el registro del producto
		registro = await BD_varias.agregarRegistro(confirmar);
		// 3. Guardar datosClaveProd
		datosClaveProd = funcDatosClaveProd({...confirmar, id: registro.id});
		req.session.datosClaveProd = datosClaveProd;
		res.cookie("datosClaveProd", datosClaveProd, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Funciones anexas
		// 4.1 Si es una "collection" o "tv" (TMDB), agregar las partes en forma automática
		confirmar.fuente == "TMDB" && confirmar.entidad_TMDB != "movie"
			? confirmar.entidad_TMDB == "collection"
				? procesarProd.agregarCapitulosDeCollection(registro.id, confirmar.capitulosId)
				: procesarProd.agregarCapitulosDeTV(
						registro,
						confirmar.TMDB_id,
						confirmar.cantTemporadas,
						confirmar.numeroPrimeraTemp
				  )
			: "";
		// 4.2. Actualizar "cantProductos" en "Relación con la vida"
		actualizarRCLV("historicos_personajes", registro.personaje_historico_id);
		actualizarRCLV("historicos_hechos", registro.hecho_historico_id);
		// 4.3. Miscelaneas
		guardar_us_calificaciones(confirmar, registro);
		varias.moverImagenCarpetaDefinitiva(confirmar.avatar, "2-Productos");
		borrarSessionCookies(req, res, "borrarTodo");
		// 5. Redireccionar
		return res.redirect("/producto/agregar/conclusion");
	},

	conclusionForm: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "conclusion";
		// 2. Obtener los datos clave del producto
		datosClaveProd = req.session.datosClaveProd
			? req.session.datosClaveProd
			: req.cookies.datosClaveProd
			? req.cookies.datosClaveProd
			: "";
		if (!datosClaveProd) return res.redirect("/producto/agregar/palabras-clave");
		// 3. Averiguar si el producto está en una colección y si la colección ya está en nuestra BD
		if (datosClaveProd.en_coleccion && datosClaveProd.en_colec_TMDB_id) {
			coleccionYaEnBD = await BD_varias.obtenerELC_id({
				entidad: "colecciones",
				campo: "TMDB_id",
				valor: datosClaveProd.en_colec_TMDB_id,
			});
			if (coleccionYaEnBD) datosClaveProd.coleccionYaEnBD = true;
		}
		// 4. Preparar la información sobre las imágenes de MUCHAS GRACIAS
		archivos = fs.readdirSync("./public/imagenes/0-Agregar/Muchas-gracias/");
		muchasGracias = archivos.filter((n) => n.includes("Muchas gracias"));
		indice = parseInt(Math.random() * muchasGracias.length);
		imagen = "/imagenes/0-Agregar/Muchas-gracias/" + muchasGracias[indice];
		// 5. Render del formulario
		//return res.send(req.cookies);
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry: datosClaveProd,
			imagen,
		});
	},

	conclusionGuardar: async (req, res) => {
		datos = {...req.body, url: req.url.slice(1)};
		//return res.send(datos);
		// Eliminar session y cookie de datosClaveProd
		if (req.cookies.datosClaveProd) res.clearCookie("datosClaveProd");
		if (req.session.datosClaveProd) delete req.session.datosClaveProd;
		// Generar la info para redirigir a Detalle
		ruta = "/producto/detalle/?entidad=";
		entidad = datos.entidad;
		id = datos.id;
		// Redirigir a Detalles
		return res.redirect(ruta + entidad + "&id=" + id);
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

let funcDatosClaveProd = (datos) => {
	let datosClave = {
		producto: datos.producto,
		entidad: datos.entidad,
		fuente: datos.fuente,
		[datos.fuente + "_id"]: datos[datos.fuente + "_id"],
		nombre_castellano: datos.nombre_castellano,
	};
	if (datos.fuente == "TMDB") datosClave.entidad_TMDB = datos.entidad_TMDB;
	if (datosClave.entidad == "peliculas") {
		datosClave.en_coleccion = datos.en_coleccion;
		if (datos.en_coleccion && datos.fuente == "TMDB") {
			datosClave.en_colec_TMDB_id = datos.en_colec_TMDB_id;
			datosClave.en_colec_nombre = datos.en_colec_nombre;
		}
	}
	if (datos.id) datosClave.id = datos.id;
	return datosClave;
};

let actualizarRCLV = async (entidad, id) => {
	if (id) {
		aux = await BD_varias.obtenerPorId(entidad, id);
		aux.cant_productos++;
		BD_varias.actualizarRegistro(entidad, {cant_productos: aux.cant_productos}, id);
	}
};

let guardar_us_calificaciones = (confirmar, registro) => {
	entidad_id =
		confirmar.entidad == "peliculas"
			? "pelicula_id"
			: confirmar.entidad == "colecciones"
			? "coleccion_id"
			: "capitulo_id";
	let datos = {
		entidad: "us_calificaciones",
		usuario_id: confirmar.creada_por_id,
		[entidad_id]: registro.id,
		fe_valores_id: confirmar.fe_valores_id,
		entretiene_id: confirmar.entretiene_id,
		calidad_tecnica_id: confirmar.calidad_tecnica_id,
		fe_valores_valor: confirmar.fe_valores,
		entretiene_valor: confirmar.entretiene,
		calidad_tecnica_valor: confirmar.calidad_tecnica,
		resultado: confirmar.calificacion,
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
		"datosDurosPartes",
		"datosDuros",
		"datosPers",
		"confirmar",
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
