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
		if (req.cookies.desambiguar) res.clearCookie("desambiguar");
		if (req.cookies.copiarFA) res.clearCookie("copiarFA");
		if (req.session.desambiguar) delete req.session.desambiguar;
		if (req.session.copiarFA) delete req.session.copiarFA;
		// 4. Render del formulario
		//return res.send(req.cookies);
		autorizado_fa = req.session.usuario.autorizado_fa;
		return res.render("Home", {
			tema,
			codigo,
			autorizado_fa,
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
		if (req.cookies.datosDuros) res.clearCookie("datosDuros");
		if (req.cookies.datosDurosPartes) res.clearCookie("datosDurosPartes");
		if (req.session.datosDuros) delete req.session.datosDuros;
		if (req.session.datosDurosPartes) delete req.session.datosDurosPartes;
		// 3. Feedback de la instancia anterior
		desambiguar = req.session.desambiguar
			? req.session.desambiguar
			: req.cookies.desambiguar
			? req.cookies.desambiguar
			: "";
		if (!desambiguar)
			return res.redirect("/agregar/producto/palabras-clave");
		// 4. Render del formulario
		//return res.send(req.cookies);
		resultados = desambiguar.resultados;
		coincidencias = resultados.length;
		prod_nuevos = resultados.filter((n) => !n.YaEnBD);
		prod_yaEnBD = resultados.filter((n) => n.YaEnBD);
		return res.render("Home", {
			tema,
			codigo,
			hayMas: desambiguar.hayMas,
			coincidencias,
			prod_nuevos,
			prod_yaEnBD,
			palabrasClave: desambiguar.palabrasClave,
			fuente: desambiguar.fuente,
			link: req.originalUrl,
		});
	},

	desambiguarGuardar: async (req, res) => {
		// Completar la información del producto elegido
		req.body.entidad = entidadTMDB == "movie" ? "peliculas" : "colecciones";
		req.body.producto = entidadTMDB == "movie" ? "Película" : "Colección";
		req.body.campo_id =
			entidadTMDB == "movie" ? "peli_tmdb_id" : "colec_tmdb_id";
		// 1. Generar la session para la siguiente instancia
		req.body.fuente == "TMDB"
			? ([aux1, aux2] = await obtenerDatosDelProductoTMDB(req.body))
			: (aux1 = req.body);
		req.session.datosDuros = aux1;
		res.cookie("datosDuros", req.session.datosDuros, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		if (aux2) {
			req.session.datosDurosPartes = aux2;
			res.cookie("datosDurosPartes", req.session.datosDurosPartes, {
				maxAge: 24 * 60 * 60 * 1000,
			});
		}
		// 2. Redireccionar a la siguiente instancia
		//return res.send(req.cookies);
		res.redirect("/agregar/producto/datos-duros");
	},

	copiarFA_Form: async (req, res) => {
		// 1. Tema y Código
		tema = "agregar";
		codigo = "copiarFA";
		// 2. Eliminar session y cookie posteriores, si existen
		if (req.cookies.datosDuros) res.clearCookie("datosDuros");
		if (req.cookies.datosDurosPartes) res.clearCookie("datosDurosPartes");
		if (req.session.datosDuros) delete req.session.datosDuros;
		if (req.session.datosDurosPartes) delete req.session.datosDurosPartes;
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
		});
	},

	copiarFA_Guardar: async (req, res) => {
		// 1. Guardar el data entry en session y cookie
		let copiarFA = req.body;
		producto = entidad == "peliculas" ? "Película" : "Colección";
		campo_id = entidad == "peliculas" ? "peli_fa_id" : "colec_fa_id";
		id = await procesarProd.obtenerFA_id(req.body.direccion);

		req.session.copiarFA = copiarFA;
		res.cookie("copiarFA", copiarFA, { maxAge: 24 * 60 * 60 * 1000 });
		// 2.1. Averiguar si hay errores de validación
		let errores = await validarProd.copiarFA(copiarFA);
		// 2.2. Averiguar si el FA_id ya está en la BD
		if (!errores.direccion) {
			elc_id = await procesarProd.obtenerELC_id({
				entidad,
				campo,
				valor: fa_id,
			});
			if (elc_id) {
				errores.direccion =
					"El código interno ya se encuentra en nuestra base de datos";
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
		if (req.cookies.datosPers) {
			ruta = "./public/imagenes/9-Provisorio/";
			if (req.cookies.datosPers.avatar)
				fs.unlinkSync(ruta + req.cookies.datosPers.avatar);
			res.clearCookie("datosPers");
		}
		if (req.session.datosPers) delete req.session.datosPers;
		// 3. Feedback de la instancia anterior
		datosDuros = req.session.datosDuros
			? req.session.datosDuros
			: req.cookies.datosDuros
			? req.cookies.datosDuros
			: "";
		// 4. Detectar el origen
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
		let errores = req.session.errores
			? req.session.errores
			: await validarProd.datosDuros(datosDuros, [
					...camposDD1,
					...camposDD2,
			  ]);
		let paises = await BD_varias.obtenerTodos("paises", "nombre");
		let pais = datosDuros.pais_id
			? await varias.pais_idToNombre(datosDuros.pais_id)
			: "";
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

	DDG: async (req, res) => {
		// 1. Feedback de la instancia anterior
		aux = req.session.datosDuros
			? req.session.datosDuros
			: req.cookies.datosDuros;
		// 2. Detectar el origen
		origen =
			req.session.desambiguar || req.cookies.desambiguar
				? "desambiguar"
				: req.session.copiarFA || req.cookies.copiarFA
				? "copiar-fa"
				: "palabras-clave";
		if (!aux) return res.redirect("/agregar/producto/" + origen);
		// 3. Guardar el data entry en session y cookie
		let datosDuros = { ...aux, ...req.body };
		req.session.datosDuros = datosDuros;
		res.cookie("datosDuros", datosDuros, { maxAge: 24 * 60 * 60 * 1000 });
		// 4. Averiguar si hay errores de validación
		let errores = await validarProd.datosDuros(datosDuros, [
			...camposDD1,
			...camposDD2,
		]);
		// 5. Si no hubieron errores en el nombre_original, averiguar si el TMDB_id o el FA_id ya están en la BD
		if (!errores.nombre_original) {
			// Averiguar si hubieron errores
			elc_id = await procesarProd.obtenerELC_id({
				entidad: datosDuros.entidad,
				campo: datosDuros.campo_id,
				valor: datosDuros.id,
			});
			// Acciones si hubieron errores
			if (elc_id) {
				errores.nombre_original =
					"El código interno ya se encuentra en nuestra base de datos";
				errores.elc_id = elc_id;
				errores.hay = true;
			}
		}
		// 6. Si aún no hay errores de imagen, revisar el archivo de imagen
		if (!errores.avatar) {
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
			errores.avatar = revisarImagen(tipo, tamano);
			// Si la imagen venía de TMDB, entonces grabarla
			if (!errores.avatar && !errores.hay && datosDuros.fuente == "TMDB")
				download(datosDuros.avatar, rutaYnombre); // Grabar el archivo de url
			// Si hay errores en el avatar, marcar que sí hay errores
			if (errores.avatar) errores.hay = true;
		}
		// 7. Si hay errores de validación, redireccionar
		if (errores.hay) {
			//return res.send(errores)
			if (fs.existsSync(rutaYnombre)) fs.unlinkSync(rutaYnombre); // Borrar el archivo de imagen
			req.session.errores = errores;
			return res.redirect("/agregar/producto/datos-duros");
		}
		// 8. Generar la session para la siguiente instancia
		avatarDP =
			datosDuros.fuente == "TMDB"
				? datosDuros.avatar
				: "/imagenes/9-Provisorio/" + nombre;
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
		if (req.cookies.confirmar) res.clearCookie("confirmar");
		if (req.session.confirmar) delete req.session.confirmar;
		// 3. Feedback de la instancia anterior o Data Entry propio
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
		let errores = req.session.errores ? req.session.errores : "";
		return res.render("Home", {
			tema,
			codigo,
			link: req.originalUrl,
			dataEntry: datosPers,
			errores,
			datosPers_select: await datosPersSelect(),
			datosPers_input: datosPersInput,
		});
	},

	datosPersGuardar: async (req, res) => {
		// 1.1. Si se perdió la info anterior, volver a 'Palabra Clave'
		aux = req.session.datosPers
			? req.session.datosPers
			: req.cookies.datosPers;
		if (!aux) return res.redirect("/agregar/producto/datos-duros");
		// 1.2. Guardar el data entry en session y cookie
		let datosPers = { ...aux, ...req.body };
		if (!datosPers.personaje_historico_id)
			delete datosPers.personaje_historico_id;
		if (!datosPers.hecho_historico_id) delete datosPers.hecho_historico_id;
		req.session.datosPers = datosPers;
		res.cookie("datosPers", datosPers, { maxAge: 24 * 60 * 60 * 1000 });
		// 2.1. Averiguar si hay errores de validación
		camposDP = [...(await datosPersSelect()), ...datosPersInput];
		let errores = await validarProd.datosPers(datosPers, camposDP);
		// 2.2. Si hay errores de validación, redireccionar
		if (errores.hay) {
			req.session.errores = errores;
			return res.redirect("/agregar/producto/datos-personalizados");
		}
		// 3. Si no hay errores, obtener la calificación
		fe_valores = await BD_varias.obtenerPorParametro(
			"fe_valores",
			"id",
			req.body.fe_valores_id
		)
			.then((n) => n.valor / 3)
			.then((n) => n.toFixed(2));
		entretiene = await BD_varias.obtenerPorParametro(
			"entretiene",
			"id",
			req.body.entretiene_id
		)
			.then((n) => n.valor / 3)
			.then((n) => n.toFixed(2));
		calidad_tecnica = await BD_varias.obtenerPorParametro(
			"calidad_tecnica",
			"id",
			req.body.calidad_tecnica_id
		)
			.then((n) => n.valor / 3)
			.then((n) => n.toFixed(2));
		calificacion = (
			fe_valores * 0.5 +
			entretiene * 0.3 +
			calidad_tecnica * 0.2
		).toFixed(2);
		// Preparar la info para el siguiente paso
		req.session.confirmar = {
			...req.session.datosPers,
			entidadTMDB: req.session.datosPers.entidadTMDB,
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
		// 2. Feedback de la instancia anterior o Data Entry propio
		confirmar = req.session.confirmar
			? req.session.confirmar
			: req.cookies.confirmar
			? req.cookies.confirmar
			: "";
		if (!confirmar)
			return res.redirect("/agregar/producto/datos-personalizados");
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
		// 1. Feedback de la instancia anterior o Data Entry propio
		confirmar = req.session.confirmar
			? req.session.confirmar
			: req.cookies.confirmar
			? req.cookies.confirmar
			: "";
		if (!confirmar)
			return res.redirect("/agregar/producto/datos-personalizados");
		// 2. Guardar el registro
		registro = await BD_varias.agregarRegistro(confirmar);
		// 3. Guardar datosClaveProd
		datosClaveProd = funcDatosClaveProd({ ...confirmar, id: registro.id });
		req.session.datosClaveProd = datosClaveProd;
		res.cookie("datosClaveProd", datosClaveProd, {
			maxAge: 24 * 60 * 60 * 1000,
		});
		//return res.send(datosClaveProd)
		// 4. Actualizar "cantProductos" en "Relación con la vida"
		actualizarRCLV(
			"historicos_personajes",
			registro.personaje_historico_id
		);
		actualizarRCLV("historicos_hechos", registro.hecho_historico_id);
		// 5. Miscelaneas
		guardarCalificaciones_us(confirmar, registro);
		moverImagenCarpetaDefinitiva(confirmar.avatar);
		// 6. Si es una COLECCIÓN TMDB, agregar las partes en forma automática
		if (confirmar.entidad == "colecciones" && confirmar.fuente == "TMDB")
			agregarLasPartesDeLaColeccion(confirmar, registro);
		//return res.send(confirmar);
		// 7. Borrar session y cookies del producto
		let metodos = ["palabrasClave", "desambiguar", "copiarFA"];
		metodos.push(...["datosDuros", "datosPers", "confirmar"]);
		for (metodo of metodos) {
			if (req.session[metodo]) delete req.session[metodo];
			if (req.cookies[metodo]) res.clearCookie(metodo);
		}
		// 8. Redireccionar
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
		if (!datosClaveProd)
			return res.redirect("/agregar/producto/palabras-clave");
		// 3. Averiguar si el producto está en una colección y la colección ya está en nuestra BD
		if (datosClaveProd.en_coleccion && datosClaveProd.en_colec_tmdb_id) {
			coleccionYaEnBD = await BD_varias.obtenerELC_id({
				entidad: "colecciones",
				campo: "colec_tmdb_id",
				valor: datosClaveProd.en_colec_tmdb_id,
			});
			if (coleccionYaEnBD) datosClaveProd.coleccionYaEnBD = true;
		}
		// 4. Preparar la información sobre las imágenes
		archivos = fs.readdirSync("./public/imagenes/0-Base/");
		muchasGracias = archivos.filter(
			(n) => n > "Muchas gracias" && n < "Muchas graciat"
		);
		indice = 1 + parseInt(Math.random() * muchasGracias.length);
		//console.log(indice)
		imagen = "/imagenes/0-Agregar/Muchas gracias " + indice + ".jpg";
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
		datos = { rubro: req.url.slice(1), ...req.body };
		//return res.send(datos)
		// Eliminar session y cookie de datosClaveProd
		if (req.cookies.datosClaveProd) res.clearCookie("datosClaveProd");
		if (req.session.datosClaveProd) delete req.session.datosClaveProd;
		// Derivar a "detalle", "coleccion" o "partes-de-coleccion"
		// 1. DETALLE DE PRODUCTO *********************************************
		if (datos.rubro == "detalle") {
			// Generar la info: ruta, entidad, id
			ruta = "/detalle/producto/informacion/?entidad=";
			entidad = datos.entidad;
			id = datos.id;
			// Redirigir a Detalles
			return res.redirect(ruta + entidad + "&id=" + id);
		} else if (datos.rubro == "coleccion") {
			// 2. Agregar la Colección
			if (datos.peli_tmdb_id) {
				// 2.1. Colección TMDB ***************************************
				// Generar la info
				datosDuros = {
					fuente: "TMDB",
					rubroAPI: "collection",
					entidad: "colecciones",
					producto: "Colección",
					campo_id: "colec_tmdb_id",
					id: datos.en_colec_tmdb_id,
					nombre_original: datos.en_colec_nombre,
				};
				// Crear session y cookie para datosDuros (simil Desambiguar), a partir del ID de la colección
				let [aux1, aux2] = await obtenerDatosDelProductoTMDB(
					datosDuros
				);
				req.session.datosDuros = aux1;
				res.cookie("datosDuros", req.session.datosDuros, {
					maxAge: 24 * 60 * 60 * 1000,
				});
				req.session.datosDurosPartes = aux2;
				res.cookie("datosDurosPartes", req.session.datosDurosPartes, {
					maxAge: 24 * 60 * 60 * 1000,
				});
				// Redirigir a DatosDuros
				//return res.send(req.cookies);
				return res.redirect("/agregar/producto/datos-duros");
			} else if (datos.peli_fa_id) {
				// 2.2. Colección FA
				// Generar la info, y crear session y cookie para copiarFA, con rubro="colección"
				req.session.copiarFA = { entidad: "colecciones" };
				res.cookie("copiarFA", req.session.copiarFA, {
					maxAge: 24 * 60 * 60 * 1000,
				});
				// Redirigir a copiarFA
				return res.redirect("/agregar/producto/copiar-fa");
			} else {
				// 2.3. Ingreso Manual
				// Redirigir a palabras clave
				return res.redirect("/agregar/producto/palabras-clave");
			}
		} else if (datos.rubro == "partes-de-coleccion") {
			// 3. Agregar las Partes de una Colección
		}
		// - datosClaveProd.entidad = "peliculas" / "colecciones"
		// - datosClaveProd.producto = "Película" / "Colección"
		// - datosClaveProd.campo = "peli_tmdb_id" / "peli_fa_id" / "colec_tmdb_id" / "colec_fa_id"
		// - datosClaveProd.en_coleccion = true / false
		// - datosClaveProd.en_colec_tmdb_id = valor / null
		// - datosClaveProd.en_colec_nombre = "xxx"
		// - datosClaveProd.valor = peli_tmdb_id / peli_fa_id / colec_tmdb_id / colec_fa_id
	},

	responsabilidad: (req, res) => {
		tema = "agregar";
		codigo = "responsabilidad";
		return res.render("Home", { tema, codigo });
	},

	yaEnBD_Form: (req, res) => {
		return res.send("La Película / Colección ya está en nuestra BD");
	},
};

let obtenerDatosDelProductoTMDB = async (datos) => {
	// API Details
	let lectura = await procesarProd.obtenerAPI_TMDB(datos);
	// Obtener la info para la vista 'Datos Duros'
	datos.entidadTMDB == "movie"
		? (metodo = "pelicula_TMDB")
		: datos.entidadTMDB == "tv"
		? (metodo = "TV_TMDB")
		: datos.entidadTMDB == "collection"
		? (metodo = "coleccion_TMDB")
		: "";
	return await procesarProd[metodo](datos, lectura);
};

let revisarImagen = (tipo, tamano) => {
	tamanoMaximo = 2;
	return tipo.slice(0, 6) != "image/"
		? "Necesitamos un archivo de imagen"
		: parseInt(tamano) > tamanoMaximo * Math.pow(10, 6)
		? "El tamaño del archivo es superior a " +
		  tamanoMaximo +
		  " MB, necesitamos uno más pequeño"
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
	{ titulo: "Guión", campo: "guion", peliculas: true, colecciones: true },
	{ titulo: "Música", campo: "musica", peliculas: true, colecciones: true },
	{ titulo: "Actores", campo: "actores", peliculas: true, colecciones: true },
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
			tabla: "peliculas",
			valores: await BD_varias.obtenerTodos("en_castellano", "id"),
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
			tabla: "peliculas",
			valores: [
				{ id: 1, nombre: "SI" },
				{ id: 0, nombre: "NO" },
			],
			mensajePeli: ["SI: es a color.", "NO: es en blanco y negro."],
			mensajeColec: [
				"Si algunos capítulos no son a color, elegí lo que represente a la mayoría",
			],
		},
		{
			titulo: "Categoría",
			campo: "categoria_id",
			tabla: "peliculas",
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
			tabla: "peliculas",
			valores: await BD_varias.obtenerTodos("subcategorias", "orden"),
			peliculas: true,
			colecciones: true,
			mensajes: ["Elegí la subcategoría que mejor represente el tema."],
		},
		{
			titulo: "Público sugerido",
			campo: "publico_sugerido_id",
			tabla: "peliculas",
			valores: await BD_varias.obtenerTodos(
				"publicos_sugeridos",
				"orden"
			),
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
			tabla: "us_pel_calificaciones",
			valores: await BD_varias.obtenerTodos("fe_valores", "orden"),
			peliculas: true,
			colecciones: true,
			mensajes: ["¿Considerás que deja algo positivo en el corazón?"],
		},
		{
			titulo: "Entretiene",
			campo: "entretiene_id",
			tabla: "us_pel_calificaciones",
			valores: await BD_varias.obtenerTodos("entretiene", "orden"),
			peliculas: true,
			colecciones: true,
			mensajes: ["Se disfruta el rato viéndola"],
		},
		{
			titulo: "Calidad sonora y visual",
			campo: "calidad_tecnica_id",
			tabla: "us_pel_calificaciones",
			valores: await BD_varias.obtenerTodos("calidad_tecnica", "orden"),
			peliculas: true,
			colecciones: true,
			mensajes: ["Tené en cuenta la calidad del audio y de la imagen"],
		},
		{
			titulo: "Personaje histórico",
			campo: "personaje_historico_id",
			tabla: "peliculas",
			valores: await BD_varias.obtenerTodos(
				"historicos_personajes",
				"nombre"
			),
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
			tabla: "peliculas",
			valores: await BD_varias.obtenerTodos(
				"historicos_hechos",
				"nombre"
			),
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
		titulo: "Link del trailer",
		titulo2: "Link del 1er trailer",
		campo: "link_trailer",
		tabla: "peliculas",
		peliculas: true,
		colecciones: true,
		mensajes: [
			"Nos interesa el trailer del primer capítulo.",
			"Debe ser de un sitio seguro, sin virus.",
			"Es ideal si vincula a un link de You Tube.",
		],
	},
	{
		titulo: "Link de la película",
		titulo2: "Link de la 1a película",
		campo: "link_pelicula",
		tabla: "peliculas",
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
	// Enfoque en los datos clave
	let datosClaveProd = {
		fuente: datos.fuente,
		entidad: datos.entidad,
		producto: datos.producto,
		campo_id: datos.campo_id,
		[datos.campo_id]: datos[datos.campo_id],
		valor: datos[datosClaveProd.campo],
		nombre_castellano: datos.nombre_castellano,
		en_coleccion: datos.en_coleccion,
		en_colec_tmdb_id: datos.en_colec_tmdb_id,
		en_colec_nombre: datos.en_colec_nombre,
		ELC_id: datos.ELC_id,
	};
	// 2. Campo y valor
	// 3. Nombre del producto
	// 4. ID del producto
	return datosClaveProd;
};

let actualizarRCLV = async (entidad, id) => {
	if (id) {
		aux = await BD_varias.obtenerPorId(entidad, id);
		aux.cant_productos++;
		BD_varias.actualizarRegistro(
			entidad,
			{ cant_productos: aux.cant_productos },
			id
		);
	}
};

let guardarCalificaciones_us = (confirmar, productoEnBD) => {
	entidad_id = confirmar.rubroAPI == "movie" ? "peli_id" : "colec_id";
	let datos = {
		usuario_id: confirmar.creada_por_id,
		[entidad_id]: productoEnBD.id,
		fe_valores_id: confirmar.fe_valores_id,
		entretiene_id: confirmar.entretiene_id,
		calidad_tecnica_id: confirmar.calidad_tecnica_id,
		fe_valores_valor: confirmar.fe_valores,
		entretiene_valor: confirmar.entretiene,
		calidad_tecnica_valor: confirmar.calidad_tecnica,
		resultado: confirmar.calificacion,
	};
	BD_varias.agregarRegistro("calificaciones_us", datos);
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

let agregarLasPartesDeLaColeccion = async (confirmar, registro) => {
	partes = confirmar.partes;
	if (partes.length) {
		let orden = 0;
		for (parte of partes) {
			orden++;
			datos = {
				colec_id: registro.id,
				peli_tmdb_id: parte.peli_tmdb_id,
				orden: orden,
				creada_por_id: 2,
			};
			if (parte.nombre_original)
				datos.nombre_original = parte.nombre_original;
			if (parte.nombre_castellano)
				datos.nombre_castellano = parte.nombre_castellano;
			if (parte.ano_estreno) datos.ano_estreno = parte.ano_estreno;
			if (parte.cant_capitulos)
				datos.cant_capitulos = parte.cant_capitulos;
			if (parte.avatar) datos.avatar = parte.avatar;
			buscarPeliID = {
				entidad: "peliculas",
				campo: "peli_tmdb_id",
				valor: parte.peli_tmdb_id,
			};
			peli_id = await BD_varias.obtenerELC_id(buscarPeliID);
			if (peli_id) datos.peli_id = peli_id;
			BD_varias.agregarRegistro("colecciones_partes", datos);
		}
	}
};
