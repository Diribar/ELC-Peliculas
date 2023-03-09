"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const variables = require("../../funciones/3-Procesos/Variables");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./PR-FN-Procesos");
const valida = require("./PR-FN-Validar");

// *********** Controlador ***********
module.exports = {
	prodDetEdic_Form: async (req, res) => {
		// DETALLE - EDICIÓN
		// 1. Tema y Código
		const tema = "prod_rud";
		const codigo = req.path.slice(1, -1);
		// 2. Variables
		let entidad = req.query.entidad;
		let id = req.query.id;
		let userID = req.session.usuario ? req.session.usuario.id : "";
		let imgDerPers, avatarLinksExternos, gruposPers, gruposHechos;
		let bloquesIzquierda, bloquesDerecha;
		let camposInput1, camposInput2, produccion, camposDA, paisesTop5;

		// 3. Obtiene el producto 'Original' y 'Editado'
		let [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		// 4. Obtiene la versión más completa posible del producto
		let prodComb = {...original, ...edicion, id};
		// 5. Configura el título de la vista
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let titulo =
			(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
			" de" +
			(entidad == "capitulos" ? "l " : " la ") +
			prodNombre;
		// 6. Obtiene el nombre de los países
		let paisesNombre = original.paises_id ? comp.paises_idToNombre(original.paises_id) : "";
		// 7. Info para la vista de Edicion o Detalle
		if (codigo == "edicion") {
			// Obtiene los datos de session/cookie y luego los elimina
			let edicSession;
			// Session
			if (req.session.edicProd) {
				if (req.session.edicProd.entidad == entidad && req.session.edicProd.id == id) edicSession = req.session.edicProd;
				else delete req.session.edicProd;
			}
			// Cookies
			if (req.cookies.edicProd && !edicSession) {
				if (req.cookies.edicProd.entidad == entidad && req.cookies.edicProd.id == id) edicSession = req.cookies.edicProd;
				else res.clearCookie("edicProd");
			}
			// Actualiza el producto prodComb
			prodComb = {...prodComb, ...edicSession};
			// Datos Duros - Campos Input
			let camposInput = variables.camposDD.filter((n) => n[entidad] || n.productos).filter((n) => n.campoInput);
			camposInput1 = camposInput.filter((n) => n.antesDePais);
			camposInput2 = camposInput.filter((n) => !n.antesDePais && n.nombre != "produccion");
			produccion = camposInput.find((n) => n.nombre == "produccion");
			// Datos Duros - Bases de Datos
			paisesTop5 = paises.sort((a, b) => b.cantProds - a.cantProds).slice(0, 5);
			// Datos Duros - Avatar
			imgDerPers = procsCRUD.obtieneAvatarOrigEdic(original, {...edicion, ...edicSession});
			avatarLinksExternos = variables.avatarLinksExternos(original.nombre_castellano);
			// Datos Personalizados
			camposDA = await variables.camposDA_conValores(userID);
			gruposPers = procsCRUD.gruposPers(camposDA, userID);
			gruposHechos = procsCRUD.gruposHechos(camposDA, userID);
		} else if (codigo == "detalle") {
			// Variables de 'Detalle'
			bloquesIzquierda = procesos.bloquesIzquierda(paisesNombre, prodComb);
			bloquesDerecha = procesos.bloquesDerecha(entidad, prodComb);
			imgDerPers = procsCRUD.obtieneAvatarOrigEdic(original, edicion).edic;
		}
		// Obtiene datos para la vista
		if (entidad == "capitulos")
			prodComb.capitulos = await BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
		// Va a la vista
		return res.render("CMP-0Estructura", {
			...{tema, codigo},
			...{titulo, prodNombre, producto: prodComb},
			...{status_id: original.status_registro_id, aprobado_id, inactivo_id},
			...{entidad, id, origen: req.query.origen, familia: comp.obtieneFamiliaEnSingular(entidad)},
			...{imgDerPers, tituloImgDerPers: prodComb.nombre_castellano},
			...{bloquesIzquierda, bloquesDerecha},
			...{camposInput1, camposInput2, produccion},
			...{paises, paisesTop5, idiomas, paisesNombre, camposDA, gruposPers, gruposHechos},
			vista: req.baseUrl + req.path,
			userRevisor: req.session.usuario && req.session.usuario.rol_usuario.revisor_ents,
			dataEntry: {},
			avatarLinksExternos,
			...{omitirImagenDerecha: codigo == "edicion", omitirFooter: codigo == "edicion", cartelGenerico: codigo == "edicion"},
		});
	},
	prodEdic_Guardar: async (req, res) => {
		// Variables
		const entidad = req.query.entidad;
		const id = req.query.id;
		const userID = req.session.usuario.id;
		const origen = req.query.origen;

		// Obtiene el producto 'Original' y 'Editado'
		let [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		const revisor_ents = req.session.usuario.rol_usuario.revisor_ents;
		const actualizaOrig = revisor_ents && original.status_registro.creado_aprob && !original.ediciones.length;

		// Si recibimos un avatar, se completa la información
		if (req.file) {
			req.body.avatar = req.file.filename;
			req.body.avatar_url = req.file.originalname;
			req.body.tamano = req.file.size;
		}

		// Averigua si hay errores de validación
		// 1. Se debe agregar el id del original, para verificar que no esté repetido
		// 2. Se debe agregar la edición, para que aporte su campo 'avatar'
		let prodComb = {...original, ...edicion, ...req.body, id};
		prodComb.publico = revisor_ents;
		let errores = await valida.consolidado({datos: {...prodComb, entidad}});

		// Acciones sobre el archivo avatar, si recibimos uno
		if (req.file) {
			// Si no hay errores, actualiza el archivo avatar
			if (!errores.hay) {
				if (actualizaOrig) {
					// Mueve el archivo de la edición para reemplazar el original
					comp.mueveUnArchivoImagen(prodComb.avatar, "9-Provisorio", "2-Avatar-Prods-Final");
					// Elimina el anterior archivo de imagen original
					if (original.avatar) comp.borraUnArchivo("./publico/imagenes/2-Avatar-Prods-Final/", original.avatar);
				} else {
					// Mueve el archivo de la edición para su revisión
					comp.mueveUnArchivoImagen(prodComb.avatar, "9-Provisorio", "2-Avatar-Prods-Revisar");
					// Elimina el anterior archivo de imagen editada
					if (edicion.avatar) comp.borraUnArchivo("./publico/imagenes/2-Avatar-Prods-Revisar/", edicion.avatar);
				}
			}
			// Si hay errores, borra el archivo avatar editado
			else {
				comp.borraUnArchivo("./publico/imagenes/9-Provisorio/", req.file.filename);
				// return res.send([{errores}, {...prodComb, entidad}]);
			}
		}

		// Acciones si no hay errores
		if (!errores.hay) {
			// 1. Actualiza el original
			if (actualizaOrig) {
				// Completa los datos a guardar
				prodComb.alta_analizada_por_id = userID;
				prodComb.alta_analizada_en = comp.ahora();
				// Actualiza el registro original
				await BD_genericas.actualizaPorId(entidad, id, prodComb);
				// Se fija si corresponde cambiar el status
				await procsCRUD.prodsPosibleAprobado(entidad, prodComb);
				// Limpia el valor de la edicion, para que no se recargue el url
				edicion = null;
			} else {
				// Combina la información
				edicion = {...edicion, ...req.body};
				// 2. Guarda o actualiza la edición, y achica 'edición a su mínima expresión
				edicion = await procsCRUD.guardaActEdicCRUD({original, edicion, entidad, userID});
			}
		}

		// Fin
		return edicion
			? res.redirect(req.originalUrl) // Recarga la vista
			: origen && origen == "TE"
			? res.redirect("/inactivar-captura/?entidad=" + entidad + "&id=" + id + "&origen=" + origen) // Regresa a Revisión
			: res.redirect(req.baseUrl + req.path + "?entidad=" + entidad + "&id=" + id); // Recarga la página sin la edición
	},
};
