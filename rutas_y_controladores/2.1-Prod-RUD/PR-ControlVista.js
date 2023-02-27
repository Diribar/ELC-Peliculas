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
		let imgDerPers, avatarLinksExternos;
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
		// 6. Obtiene los países
		let paises = original.paises_id ? await comp.paises_idToNombre(original.paises_id) : "";
		// 7. Info para la vista de Edicion o Detalle
		let bloquesIzquierda, bloquesDerecha;
		let camposInput1, camposInput2, produccion, camposDA, BD_paises, BD_idiomas;
		if (codigo == "edicion") {
			// Obtiene los datos de session/cookie y luego los elimina
			let edicion = (() => {
				// Función
				let verificaReq = (dato) => {
					return req[dato] && req[dato].entidad == entidad && req[dato].id == id;
				};
				// Obtiene la información
				let resultado = verificaReq("session.edicProd")
					? req.session.edicProd
					: verificaReq("cookies.edicProd")
					? req.cookies.edicProd
					: "";
				// Borra 'session' y 'cookie'
				req.session.edicProd = "";
				res.clearCookie("edicProd");
				// Fin
				return resultado;
			})();
			// Actualiza el producto prodComb
			prodComb = {...prodComb, ...edicion};
			// Datos Duros - Campos Input
			let camposInput = variables.camposDD.filter((n) => n[entidad]).filter((n) => n.campoInput);
			camposInput1 = camposInput.filter((n) => n.antesDePais);
			camposInput2 = camposInput.filter((n) => !n.antesDePais && n.nombre != "produccion");
			produccion = camposInput.find((n) => n.nombre == "produccion");
			// Datos Duros - Bases de Datos
			BD_paises = await BD_genericas.obtieneTodos("paises", "nombre");
			BD_idiomas = await BD_genericas.obtieneTodos("idiomas", "nombre");
			// Datos Duros - Avatar
			imgDerPers = procsCRUD.obtieneAvatarOrigEdic(original, edicion);
			avatarLinksExternos = variables.avatarLinksExternos(original.nombre_castellano);
			// Datos Personalizados
			camposDA = await variables.camposDA_conValores(userID);
		} else if (codigo == "detalle") {
			// Variables de 'Detalle'
			bloquesIzquierda = procesos.bloquesIzquierda(paises, prodComb);
			bloquesDerecha = procesos.bloquesDerecha(entidad, prodComb);
			imgDerPers = procsCRUD.obtieneAvatarOrigEdic(original, edicion).edic;
		}
		// Obtiene datos para la vista
		if (entidad == "capitulos")
			prodComb.capitulos = await BD_especificas.obtieneCapitulos(prodComb.coleccion_id, prodComb.temporada);
		// Va a la vista
		// return res.send(prodComb)
		return res.render("CMP-0Estructura", {
			tema,
			codigo,
			titulo,
			entidad,
			id,
			origen: req.query.origen,
			producto: prodComb,
			imgDerPers,
			tituloImgDerPers: prodComb.nombre_castellano,
			bloquesIzquierda,
			bloquesDerecha,
			camposInput1,
			camposInput2,
			produccion,
			BD_paises,
			BD_idiomas,
			camposDA,
			vista: req.baseUrl + req.path,
			paises,
			prodNombre,
			dataEntry: {},
			avatarLinksExternos,
			omitirImagenDerecha: codigo == "edicion",
			omitirFooter: codigo == "edicion",
			cartelGenerico: codigo == "edicion",
		});
	},
	prodEdic_Guardar: async (req, res) => {
		// Variables
		let entidad = req.query.entidad;
		let id = req.query.id;
		let userID = req.session.usuario.id;
		// Obtiene el producto 'Original' y 'Editado'
		let [original, edicion] = await procsCRUD.obtieneOriginalEdicion(entidad, id, userID);
		// Adecuaciones para el avatar
		if (req.file) {
			req.body.avatar = req.file.filename;
			req.body.avatar_url = req.file.originalname;
			req.body.avatar = req.file.filename;
			req.body.tamano = req.file.size;
		}

		// Averigua si hay errores de validación
		let prodComb = {...original, ...edicion, ...req.body, id}; // se debe agregar el id, para verificar que no esté repetido
		let errores = await valida.consolidado({datos: {...prodComb, entidad}});

		// Acciones si recibimos un archivo avatar
		if (req.file) {
			// Si no hay errores, actualiza el archivo avatar
			if (!errores.hay) {
				// Mueve el archivo actual a su ubicación para ser revisado
				comp.mueveUnArchivoImagen(prodComb.avatar, "9-Provisorio", "2-Avatar-Prods-Revisar");
				// Elimina el anterior archivo de imagen
				if (edicion.avatar) comp.borraUnArchivo("./publico/imagenes/2-Avatar-Prods-Revisar/", edicion.avatar);
			}
			// Si hay errores, borra el archivo avatar
			else {
				comp.borraUnArchivo("./publico/imagenes/9-Provisorio/", req.file.filename);
				return res.send(errores);
			}
		}

		// Si no hay errores, actualiza la edición
		if (!errores.hay) {
			let edicion = {...req.body};
			if (edicion.id) edicion.id = edicion.id;
			await procsCRUD.guardaActEdicCRUD({original: original, edicion, entidad, userID});
		}

		// Fin
		return res.redirect("/producto/edicion/?entidad=" + entidad + "&id=" + id);
	},

	calificala: (req, res) => {
		return res.send("Estoy en calificala");
	},
	eliminar: (req, res) => {
		return res.send("Estoy en eliminar");
	},
};
