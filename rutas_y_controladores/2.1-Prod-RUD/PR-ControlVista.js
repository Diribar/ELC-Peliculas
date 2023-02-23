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
		let prodID = req.query.id;
		let userID = req.session.usuario ? req.session.usuario.id : "";
		let imgDerPers, avatarLinksExternos;
		// 3. Obtiene el producto 'Original' y 'Editado'
		let [prodOrig, prodEdic] = await procsCRUD.obtieneOriginalEdicion(entidad, prodID, userID);
		// 4. Obtiene la versión más completa posible del producto
		let prodComb = {...prodOrig, ...prodEdic, id: prodID};
		// 5. Configura el título de la vista
		let prodNombre = comp.obtieneEntidadNombre(entidad);
		let titulo =
			(codigo == "detalle" ? "Detalle" : codigo == "edicion" ? "Edición" : "") +
			" de" +
			(entidad == "capitulos" ? "l " : " la ") +
			prodNombre;
		// 6. Obtiene los países
		let paises = prodOrig.paises_id ? await comp.paises_idToNombre(prodOrig.paises_id) : "";
		// 7. Info para la vista de Edicion o Detalle
		let bloquesIzquierda, bloquesDerecha;
		let camposInput1, camposInput2, produccion, camposDA, BD_paises, BD_idiomas;
		if (codigo == "edicion") {
			// Obtiene los datos de session/cookie y luego los elimina
			let edicion = (() => {
				// Función
				let verificaReq = (dato) => {
					return req[dato] && req[dato].entidad == entidad && req[dato].id == prodID;
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
			imgDerPers = procsCRUD.obtieneAvatarOrigEdic(prodOrig, prodEdic);
			avatarLinksExternos = variables.avatarLinksExternos(prodOrig.nombre_castellano);
			// Datos Personalizados
			camposDA = await variables.camposDA_conValores(userID);
		} else if (codigo == "detalle") {
			// Variables de 'Detalle'
			bloquesIzquierda = procesos.bloquesIzquierda(paises, prodComb);
			bloquesDerecha = procesos.bloquesDerecha(entidad, prodComb);
			imgDerPers = procsCRUD.obtieneAvatarOrigEdic(prodOrig, prodEdic).edic;
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
			prodID,
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
		let prodID = req.query.id;
		let userID = req.session.usuario.id;
		// Obtiene el producto 'Original' y 'Editado'
		let [prodOrig, prodEdic] = await procsCRUD.obtieneOriginalEdicion(entidad, prodID, userID);
		// Adecuaciones para el avatar
		if (req.file) {
			req.body.avatar = req.file.filename;
			req.body.avatar_url = req.file.originalname;
			req.body.avatar = req.file.filename;
			req.body.tamano = req.file.size;
		}

		// Averigua si hay errores de validación
		let prodComb = {...prodOrig, ...prodEdic, ...req.body, id: prodID}; // se debe agregar el prodID, para verificar que no esté repetido
		let errores = await valida.consolidado("", {...prodComb, entidad});

		// Acciones si recibimos un archivo avatar
		if (req.file) {
			// Si no hay errores, actualiza el archivo avatar
			if (!errores.hay) {
				// Mueve el archivo actual a su ubicación para ser revisado
				comp.mueveUnArchivoImagen(prodComb.avatar, "9-Provisorio", "2-Avatar-Prods-Revisar");
				// Elimina el anterior archivo de imagen
				if (prodEdic.avatar) comp.borraUnArchivo("./publico/imagenes/2-Avatar-Prods-Revisar/", prodEdic.avatar);
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
			if (prodEdic.id) edicion.id = prodEdic.id;
			await procsCRUD.guardaActEdicCRUD({original: prodOrig, edicion, entidad, userID});
		}

		// Fin
		return res.redirect("/producto/edicion/?entidad=" + entidad + "&id=" + prodID);
	},

	calificala: (req, res) => {
		return res.send("Estoy en calificala");
	},
	eliminar: (req, res) => {
		return res.send("Estoy en eliminar");
	},
};
