// ************ Requires ************
let fs = require("fs");
let path = require("path");
let axios = require("axios");
let requestPromise = require("request-promise");
let buscar_x_PC = require("../../funciones/Productos/1-Buscar_x_PC");
let procesarProd = require("../../funciones/Productos/2-Procesar");
let validarProd = require("../../funciones/Productos/3-Errores");
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
			return res.redirect("/agregar/producto/palabras-clave");
		}
		// 3. Generar la session para la siguiente instancia
		req.session.desambiguar = await buscar_x_PC.search(palabrasClave);
		res.cookie("desambiguar", req.session.desambiguar, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/agregar/producto/desambiguar");
	},

	desambiguarForm: (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "desambiguar";
		// 2. Eliminar session y cookie posteriores, si existen
		borrarSessionCookies(req, res, "desambiguar");
		// 3. Si se perdió la info anterior, volver a esa instancia
		desambiguar = req.session.desambiguar
			? req.session.desambiguar
			: req.cookies.desambiguar
			? req.cookies.desambiguar
			: "";
		if (!desambiguar) return res.redirect("/agregar/producto/palabras-clave");
		// 3. Errores
		let errores = req.session.errores ? req.session.errores : "";
		// 4. Preparar los datos
		let resultados = desambiguar.resultados;
		let {prod_nuevos, prod_yaEnBD, mensaje} = prepararMensaje(resultados);
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
		desambiguar = await obtenerDatosDelProductoTMDB(req.body);
		// 2. Averiguar si hay errores de validación
		let errores = await validarProd.desambiguar(desambiguar);
		// 3. Si no supera el filtro anterior, redireccionar
		if (errores.hay) {
			req.session.errores = errores;
			return res.redirect("/agregar/producto/desambiguar");
		}
		// 4. Si la colección está creada, pero su capítulo NO, actualizar las partes
		// 5. Generar la session para la siguiente instancia
		req.session.datosDuros = desambiguar;
		res.cookie("datosDuros", desambiguar, {maxAge: 24 * 60 * 60 * 1000});
		// 6. Redireccionar a la siguiente instancia
		res.redirect("/agregar/producto/datos-duros");
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
			elc_id = await procesarProd.obtenerELC_id({
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
			return res.redirect("/agregar/producto/copiar-fa");
		}
		// 3. Si NO hay errores, generar la session para la siguiente instancia
		req.session.datosDuros = await procesarProd.producto_FA(copiarFA);
		res.cookie("datosDuros", req.session.datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Redireccionar a la siguiente instancia
		req.session.errores = false;
		return res.redirect("/agregar/producto/datos-duros");
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
		if (!datosDuros) return res.redirect("/agregar/producto/" + origen);
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
			: await validarProd.datosDuros(datosDuros, [IM, ...camposDD1, ...camposDD2]);
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
			camposDD1,
			camposDD2,
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
		if (!aux) return res.redirect("/agregar/producto/" + origen);
		// 3. Guardar el data entry en session y cookie
		if (req.file && !req.body.avatar) req.body.avatar = req.file.filename;
		let datosDuros = {...aux, ...req.body};
		req.session.datosDuros = datosDuros;
		res.cookie("datosDuros", datosDuros, {maxAge: 24 * 60 * 60 * 1000});
		// 4. Averiguar si hay errores de validación
		let errores = await validarProd.datosDuros(datosDuros, [...camposDD1, ...camposDD2]);
		// return res.send(errores);
		// 5. Si no hubieron errores en el nombre_original, averiguar si el TMDB_id/FA_id ya está en la BD
		if (!errores.nombre_original) {
			elc_id = await procesarProd.obtenerELC_id({
				entidad: datosDuros.entidad,
				campo: [datosDuros.fuente + "_id"],
				valor: datosDuros[this.campo],
			});
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
		if (!errores.avatar) errores.avatar = revisarImagen(tipo, tamano);
		if (errores.avatar) errores.hay = true;
		// 7. Si hay errores de validación, redireccionar
		if (errores.hay) {
			//return res.send(errores)
			if (fs.existsSync(rutaYnombre)) fs.unlinkSync(rutaYnombre); // Borrar el archivo de imagen
			req.session.errores = errores;
			return res.redirect("/agregar/producto/datos-duros");
		}
		// Si la imagen venía de TMDB, entonces grabarla
		if (datosDuros.fuente == "TMDB") download(datosDuros.avatar, rutaYnombre);
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
		return res.redirect("/agregar/producto/datos-personalizados");
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
		if (!datosPers) return res.redirect("/agregar/producto/datos-duros");
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
			datosPersSelect: await datosPersSelect(),
			datosPersInput: datosPersInput,
		});
	},

	datosPersGuardar: async (req, res) => {
		// 1.1. Si se perdió la info anterior, volver a esa instancia
		aux = req.session.datosPers ? req.session.datosPers : req.cookies.datosPers;
		if (!aux) return res.redirect("/agregar/producto/datos-duros");
		// 1.2. Sumar el req.body a lo que ya se tenía
		let datosPers = {...aux, ...req.body};
		// 1.3. Si no se guardaron datos de RCLV, se quitan del dataEntry para evitar conflicto con la BD
		if (!datosPers.personaje_historico_id) delete datosPers.personaje_historico_id;
		if (!datosPers.hecho_historico_id) delete datosPers.hecho_historico_id;
		// 1.4. Guardar el data entry en session y cookie
		req.session.datosPers = datosPers;
		res.cookie("datosPers", datosPers, {maxAge: 24 * 60 * 60 * 1000});
		// 2.1. Averiguar si hay errores de validación
		camposDP = [...(await datosPersSelect()), ...datosPersInput];
		let errores = await validarProd.datosPers(datosPers, camposDP);
		// 2.2. Si hay errores de validación, redireccionar
		if (errores.hay) {
			req.session.errores = errores;
			return res.redirect("/agregar/producto/datos-personalizados");
		}
		// 3. Si no hay errores, continuar
		// Obtener la calificación
		fe_valores = await BD_varias.obtenerPorParametro("fe_valores", "id", req.body.fe_valores_id)
			.then((n) => n.valor / 3)
			.then((n) => n.toFixed(2));
		entretiene = await BD_varias.obtenerPorParametro("entretiene", "id", req.body.entretiene_id)
			.then((n) => n.valor / 3)
			.then((n) => n.toFixed(2));
		calidad_tecnica = await BD_varias.obtenerPorParametro(
			"calidad_tecnica",
			"id",
			req.body.calidad_tecnica_id
		)
			.then((n) => n.valor / 3)
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
		return res.redirect("/agregar/producto/confirmar");
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
		if (!confirmar) return res.redirect("/agregar/producto/datos-personalizados");
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
		if (!confirmar) return res.redirect("/agregar/producto/datos-personalizados");
		// 2. Guardar el registro del producto
		registro = await BD_varias.agregarRegistro(confirmar);
		// 3. Guardar datosClaveProd
		datosClaveProd = funcDatosClaveProd({...confirmar, id: registro.id});
		req.session.datosClaveProd = datosClaveProd;
		res.cookie("datosClaveProd", datosClaveProd, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		// 4. Funciones anexas
		// 4.1 Si es una "collection" (TMDB), agregar las partes en forma automática
		if (confirmar.fuente == "TMDB" && confirmar.entidad_TMDB == "collection")
			await agregarPeliculasCollection(confirmar.capitulosId, registro.id);
		//return res.send(aux)
		// 4.2 Si es una "tv" (TMDB), agregar las partes en forma automática
		if (confirmar.fuente == "TMDB" && confirmar.entidad_TMDB == "tv")
			await agregarCapitulosTV(confirmar.TMDB_id, confirmar.capitulosCant, registro.id);
		// 4.3. Actualizar "cantProductos" en "Relación con la vida"
		actualizarRCLV("historicos_personajes", registro.personaje_historico_id);
		actualizarRCLV("historicos_hechos", registro.hecho_historico_id);
		// 4.4. Miscelaneas
		guardar_us_calificaciones(confirmar, registro);
		moverImagenCarpetaDefinitiva(confirmar.avatar);
		borrarSessionCookies(req, res, "borrarTodo");
		// 5. Redireccionar
		return res.redirect("/agregar/producto/conclusion");
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
		if (!datosClaveProd) return res.redirect("/agregar/producto/palabras-clave");
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
		// Derivar a "detalle", "coleccion" o "partes-de-coleccion"
		// 1. DETALLE DE PRODUCTO *********************************************
		if (datos.url == "detalle") {
			// Generar la info: ruta, entidad, id
			ruta = "/detalle/producto/informacion/?entidad=";
			entidad = datos.entidad;
			id = datos.id;
			// Redirigir a Detalles
			return res.redirect(ruta + entidad + "&id=" + id);
		} else if (datos.url == "coleccion") {
			// 2. Agregar la Colección
			if (datos.TMDB_id) {
				// 2.1. Colección TMDB ***************************************
				// Generar la info
				datosDuros = {
					fuente: "TMDB",
					producto: "Colección",
					entidad: "colecciones",
					entidad_TMDB: "collection",
					TMDB_id: datos.en_colec_TMDB_id,
					nombre_original: datos.en_colec_nombre,
				};
				// Crear session y cookie para datosDuros (simil Desambiguar)
				let [aux1, aux2] = await obtenerDatosDelProductoTMDB(datosDuros);
				req.session.datosDuros = aux1;
				res.cookie("datosDuros", req.session.datosDuros, {
					maxAge: 24 * 60 * 60 * 1000,
				});
				req.session.datosDurosPartes = aux2;
				res.cookie("datosDurosPartes", aux2, {
					maxAge: 24 * 60 * 60 * 1000,
				});
				// Redirigir a DatosDuros
				//return res.send(req.cookies);
				return res.redirect("/agregar/producto/datos-duros");
			} else if (datos.FA_id) {
				// 2.2. Colección FA ****************************************
				req.session.copiarFA = {entidad: "colecciones"};
				res.cookie("copiarFA", req.session.copiarFA, {
					maxAge: 24 * 60 * 60 * 1000,
				});
				// Redirigir a copiarFA
				return res.redirect("/agregar/producto/copiar-fa");
			} else {
				// 2.3. Ingreso Manual
				req.session.datosDuros = {fuente: "IM", entidad: "colecciones"};
				res.cookie("datosDuros", req.session.datosDuros, {maxAge: 24 * 60 * 60 * 1000});
				// Redirigir a palabras clave
				return res.redirect("/agregar/producto/datos-duros");
			}
		} else if (datos.url == "partes-de-coleccion") {
			entidad = "colecciones_partes";
			// 3. Agregar las Partes de una Colección
		}
		// - datosClaveProd.entidad = "peliculas" / "colecciones"
		// - datosClaveProd.producto = "Película" / "Colección"
		// - datosClaveProd.campo = "peli_TMDB_id" / "peli_FA_id" / "colec_TMDB_id" / "colec_FA_id"
		// - datosClaveProd.en_coleccion = true / false
		// - datosClaveProd.en_colec_TMDB_id = valor / null
		// - datosClaveProd.en_colec_nombre = "xxx"
		// - datosClaveProd.valor = peli_TMDB_id / peli_FA_id / colec_TMDB_id / colec_FA_id
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

let obtenerDatosDelProductoTMDB = async (datos) => {
	// API Details
	let lectura = await procesarProd.obtenerAPI_TMDB(datos);
	// Procesar la info para la vista 'Datos Duros'
	datos.entidad_TMDB == "movie"
		? (metodo = "pelicula_TMDB")
		: datos.entidad_TMDB == "tv"
		? (metodo = "TV_TMDB")
		: datos.entidad_TMDB == "collection"
		? (metodo = "coleccion_TMDB")
		: "";
	return await procesarProd[metodo](datos, lectura);
};

let obtenerCapitulosTV = async ({TMDB_id, season}) => {
	// API Details
	let lectura = await procesarProd.obtenerAPI_TMDB_season({TMDB_id, entidad_TMDB: season});
	return lectura
	// Procesar la info para la vista 'Datos Duros'
	return await procesarProd.capituloTV(TMDB_id, season, lectura);
};

let revisarImagen = (tipo, tamano) => {
	tamanoMaximo = 2;
	return tipo.slice(0, 6) != "image/"
		? "Necesitamos un archivo de imagen"
		: parseInt(tamano) > tamanoMaximo * Math.pow(10, 6)
		? "El tamaño del archivo es superior a " + tamanoMaximo + " MB, necesitamos uno más pequeño"
		: "";
};

let download = async (url, rutaYnombre) => {
	let writer = fs.createWriteStream(rutaYnombre);
	let response = await axios({
		method: "GET",
		url: url,
		responseType: "stream",
	});
	response.data.pipe(writer);
	return new Promise((resolve, reject) => {
		writer.on("finish", () => resolve(console.log("Imagen guardada")));
		writer.on("error", (err) => reject(err));
	});
};

let camposDD1 = [
	{
		titulo: "Título original",
		campo: "nombre_original",
		peliculas: true,
		colecciones: true,
	},
	{
		titulo: "Título en castellano",
		campo: "nombre_castellano",
		peliculas: true,
		colecciones: true,
	},
	{
		titulo: "Año de estreno",
		campo: "ano_estreno",
		id: true,
		peliculas: true,
		colecciones: true,
	},
	{
		titulo: "Año de finalización",
		campo: "ano_fin",
		id: true,
		peliculas: false,
		colecciones: true,
	},
	{
		titulo: "Duración (minutos)",
		campo: "duracion",
		id: true,
		peliculas: true,
		colecciones: false,
	},
];

let camposDD2 = [
	{
		titulo: "Director",
		campo: "director",
		peliculas: true,
		colecciones: true,
	},
	{titulo: "Guión", campo: "guion", peliculas: true, colecciones: true},
	{titulo: "Música", campo: "musica", peliculas: true, colecciones: true},
	{titulo: "Actores", campo: "actores", peliculas: true, colecciones: true},
	{
		titulo: "Productor",
		campo: "productor",
		peliculas: true,
		colecciones: true,
	},
];

let datosPersSelect = async () => {
	return [
		{
			titulo: "Existe una versión en castellano",
			campo: "en_castellano_id",
			valores: await BD_varias.obtenerTodos("en_castellano", "id"),
			peliculas: true,
			colecciones: true,
			mensajePeli: [
				'Para poner "SI", estate seguro de que hayas escuchado LA PELÍCULA ENTERA en ese idioma. No te guíes por el trailer.',
			],
			mensajeColec: [
				'En caso de que algunos capítulos no estén en castellano, elegí "SI-Parcial"',
			],
		},
		{
			titulo: "Es a Color",
			campo: "color",
			valores: [
				{id: 1, nombre: "SI"},
				{id: 0, nombre: "NO"},
			],
			peliculas: true,
			colecciones: true,
			mensajePeli: ["SI: es a color.", "NO: es en blanco y negro."],
			mensajeColec: [
				"Si algunos capítulos no son a color, elegí lo que represente a la mayoría",
			],
		},
		{
			titulo: "Categoría",
			campo: "categoria_id",
			valores: await BD_varias.obtenerTodos("categorias", "orden"),
			peliculas: true,
			colecciones: true,
			mensajes: [
				'"Centradas en la Fe Católica", significa que el rol de la Fe Católica es protagónico.',
				'Si es cristiana pero no católica, se pone como "Valores Presentes en la Cultura".',
				'Para ponerla como "Valores Presentes en la Cultura", los buenos valores deben ser evidentes.',
			],
		},
		{
			titulo: "Sub-categoría",
			campo: "subcategoria_id",
			valores: await BD_varias.obtenerTodos("subcategorias", "orden"),
			peliculas: true,
			colecciones: true,
			mensajes: ["Elegí la subcategoría que mejor represente el tema."],
		},
		{
			titulo: "Público sugerido",
			campo: "publico_sugerido_id",
			valores: await BD_varias.obtenerTodos("publicos_sugeridos", "orden"),
			peliculas: true,
			colecciones: true,
			mensajes: [
				"Mayores solamente: sensualidad o crueldad explícita, puede dañar la sensibilidad de un niño de 12 años.",
				"Mayores apto familia: para mayores, sin dañar la sensibilidad de un niño.",
				"Familia: ideal para compartir en familia y que todos disfruten",
				"Menores apto familia: para menores, también la puede disfrutar un adulto.",
				"Menores solamente: apuntado a un público solamente infantil.",
			],
		},
		{
			titulo: "Inspira fe y/o valores",
			campo: "fe_valores_id",
			valores: await BD_varias.obtenerTodos("fe_valores", "orden"),
			peliculas: true,
			colecciones: true,
			mensajes: ["¿Considerás que deja algo positivo en el corazón?"],
		},
		{
			titulo: "Entretiene",
			campo: "entretiene_id",
			valores: await BD_varias.obtenerTodos("entretiene", "orden"),
			peliculas: true,
			colecciones: true,
			mensajes: ["Se disfruta el rato viéndola"],
		},
		{
			titulo: "Calidad sonora y visual",
			campo: "calidad_tecnica_id",
			valores: await BD_varias.obtenerTodos("calidad_tecnica", "orden"),
			peliculas: true,
			colecciones: true,
			mensajes: ["Tené en cuenta la calidad del audio y de la imagen"],
		},
		{
			titulo: "Personaje histórico",
			campo: "personaje_historico_id",
			valores: await BD_varias.obtenerTodos("historicos_personajes", "nombre"),
			peliculas: true,
			colecciones: true,
			mensajes: [
				"Podés ingresar un registro nuevo, haciendo click acá.",
				"Si agregás un registro, tenés que actualizar la vista para poderlo ver.",
			],
			link: "personaje-historico",
		},
		{
			titulo: "Hecho histórico",
			campo: "hecho_historico_id",
			valores: await BD_varias.obtenerTodos("historicos_hechos", "nombre"),
			peliculas: true,
			colecciones: true,
			mensajes: [
				"Podés ingresar un registro nuevo, haciendo click en el ícono de al lado.",
				"Si agregás un registro, tenés que actualizar la vista para poderlo ver.",
			],
			link: "hecho-historico",
		},
	];
};

let datosPersInput = [
	{
		tituloPeli: "Link del trailer",
		tituloColec: "Link del 1er trailer",
		campo: "link_trailer",
		peliculas: true,
		colecciones: true,
		mensajes: [
			"Nos interesa el trailer del primer capítulo.",
			"Debe ser de un sitio seguro, sin virus.",
			"Es ideal si vincula a un link de You Tube.",
		],
	},
	{
		tituloPeli: "Link de la película",
		tituloColec: "Link de la 1a película",
		campo: "link_pelicula",
		peliculas: true,
		colecciones: true,
		mensajes: [
			"Nos interesa el link del primer capítulo.",
			"Debe ser de un sitio seguro, sin virus.",
			"Debe ser de un sitio con política de respeto al copyright. Ej: You Tube.",
			"Pedimos un link con una antigüedad mayor a 3 meses.",
			"En lo posible, elegí un link en castellano y de buena calidad.",
		],
	},
];

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
	entidad_id = confirmar.entidad == "peliculas" ? "pelicula_id" : "coleccion_id";
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

let moverImagenCarpetaDefinitiva = (nombre) => {
	let rutaProvisoria = "./public/imagenes/9-Provisorio/" + nombre;
	let rutaDefinitiva = "./public/imagenes/2-Productos/" + nombre;
	fs.rename(rutaProvisoria, rutaDefinitiva, function (err) {
		if (err) {
			throw err;
		} else {
			console.log("Archivo de imagen movido a su carpeta definitiva");
		}
	});
};

let agregarPeliculasCollection = async (capitulosId, coleccion_id) => {
	// Obtener las API de cada capítulo, y luego crear el registro de cada capítulo
	for (let i = 0; i < capitulosId.length; i++) {
		await obtenerDatosDelProductoTMDB({TMDB_id: capitulosId[i], entidad_TMDB: "movie"})
			.then((n) => {
				return {
					...n,
					coleccion_id,
					temporada: 0,
					capitulo: i + 1,
					creada_por_id: 2,
					entidad: "capitulos",
				};
			})
			.then((n) => BD_varias.agregarRegistro(n));
	}
	return;
};

let agregarCapitulosTV = async (TMDB_id, capitulosCant, coleccion_id) => {
	// Obtener las API de cada capítulo, y luego crear el registro de cada capítulo
	for (let i = 0; i < capitulosCant; i++) {
		await obtenerCapitulosTV({TMDB_id, season: i})
			// .then((n) => {
			// 	return {
			// 		...n,
			// 		coleccion_id,
			// 		temporada: 0,
			// 		capitulo: i + 1,
			// 		creada_por_id: 2,
			// 		entidad: "capitulos",
			// 	};
			// })
			// .then((n) => BD_varias.agregarRegistro(n));
	}
	return;
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

let prepararMensaje = (datos) => {
	let prod_nuevos = datos.filter((n) => !n.YaEnBD);
	let prod_yaEnBD = datos.filter((n) => n.YaEnBD);
	let coincidencias = datos.length;
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
		(nuevos > 1 ? "n" : "") +
		" en nuestra BD.";
	return {prod_nuevos, prod_yaEnBD, mensaje};
};
