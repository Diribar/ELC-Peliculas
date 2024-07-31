"use strict";
// Variables
const procsFM = require("../2.0-Familias/FM-FN-Procesos");
const validacsFM = require("../2.0-Familias/FM-FN-Validar");
const procesos = require("./PR-FN-Procesos");

// *********** Controlador ***********
module.exports = {
	// Edición del Producto
	edicion: {
		valida: async (req, res) => {
			// Obtiene los campos
			let campos = Object.keys(req.query);

			// Averigua los errores solamente para esos campos
			req.query.publico = req.session.usuario.rolUsuario.autTablEnts;
			req.query.epocaOcurrencia = req.session.usuario.rolUsuario.autTablEnts;
			let errores = await validacsFM.validacs.consolidado({campos, datos: req.query});

			// Devuelve el resultado
			return res.json(errores);
		},
		obtieneVersionesProd: async (req, res) => {
			// Variables
			let {entidad: producto, id: prodId} = req.query;
			let userID = req.session.usuario.id;

			// Obtiene los datos ORIGINALES y EDITADOS del producto
			let [prodOrig, prodEdic] = await procsFM.obtieneOriginalEdicion({
				entidad: producto,
				entId: prodId,
				userID,
				excluirInclude: true,
			});

			// Envía los datos
			return res.json([prodOrig, prodEdic]);
		},
		variables: async (req, res) => {
			// Variables
			const {entidad, id} = req.query;
			const {inputVacio, selectVacio, rclvSinElegir} = {...variables};

			// Tipos de actuación
			const datos = {
				...{anime_id, documental_id, actuada_id},
				...{inputVacio, selectVacio, rclvSinElegir},
				creados_ids,
			};
			if (entidad == "capitulos")
				datos.coleccion_id = await baseDeDatos.obtienePorId("capitulos", id).then((n) => n.coleccion_id);

			// Fin
			return res.json(datos);
		},
		eliminaNueva: async (req, res) => {
			// Elimina Session y Cookies
			if (req.session.edicProd) delete req.session.edicProd;
			if (req.cookies.edicProd) res.clearCookie("edicProd");

			// Terminar
			return res.json();
		},
		eliminaGuardada: async (req, res) => {
			// Obtiene los datos identificatorios del producto
			const producto = req.query.entidad;
			const prodId = req.query.id;
			const userID = req.session.usuario.id;

			// Obtiene los datos ORIGINALES y EDITADOS del producto
			const [prodOrig, prodEdic] = await procsFM.obtieneOriginalEdicion({
				entidad: producto,
				entId: prodId,
				userID,
				excluirInclude: true,
				omitirPulirEdic: true,
			});

			// Sólo se puede eliminar la edición si el producto no tiene status "creados_ids" o fue creado por otro usuario
			const condicion = !creados_ids.includes(prodOrig.statusRegistro_id) || prodOrig.creadoPor_id != userID;

			if (condicion && prodEdic) {
				if (prodEdic.avatar) comp.gestionArchivos.elimina(carpetaExterna + "2-Productos/Revisar/", prodEdic.avatar);
				baseDeDatos.eliminaPorId("prodsEdicion", prodEdic.id);
			}
			// Terminar
			return res.json();
		},
		envioParaSession: async (req, res) => {
			if (req.query.avatar) delete req.query.avatar;
			console.log(91, req.query);
			req.session.edicProd = req.query;
			res.cookie("edicProd", req.query, {maxAge: unDia});
			return res.json();
		},
	},

	califics: {
		delProducto: async (req, res) => {
			// Variables
			const {entidad, id: prodId} = req.query;
			const userID = req.session.usuario ? req.session.usuario.id : "";
			let datos;
			let calificaciones = [];

			// Datos generales
			datos = await baseDeDatos
				.obtienePorId(entidad, prodId)
				.then((n) => [n.feValores, n.entretiene, n.calidadTecnica, n.calificacion]);
			calificaciones.push({autor: "Gral.", valores: datos});

			// Datos particulares
			const condics = {usuario_id: userID, entidad, entidad_id: prodId};
			const include = ["feValores", "entretiene", "calidadTecnica"];
			datos = await baseDeDatos.obtienePorCondicion("calRegistros", condics, include);
			if (datos) {
				datos = [datos.feValores.valor, datos.entretiene.valor, datos.calidadTecnica.valor, datos.resultado];
				calificaciones.push({autor: "Tuya", valores: datos});
			}

			// Fin
			return res.json(calificaciones);
		},
		delUsuarioProducto: async (req, res) => {
			// Variables
			const {entidad, id: prodId} = req.query;
			const userID = req.session.usuario ? req.session.usuario.id : "";

			// Datos particulares
			const condics = {usuario_id: userID, entidad, entidad_id: prodId};
			const califGuardada = await baseDeDatos.obtienePorCondicion("calRegistros", condics);

			// Fin
			return res.json({califGuardada, atributosCalific, calCriterios});
		},
		elimina: async (req, res) => {
			// Variables
			const {entidad, id: entidad_id} = req.query;
			const userID = req.session.usuario ? req.session.usuario.id : "";

			// Elimina
			const condics = {usuario_id: userID, entidad, entidad_id};
			await baseDeDatos.eliminaTodosPorCondicion("calRegistros", condics);

			// Actualiza las calificaciones del producto
			await procesos.actualizaCalifProd({entidad, entidad_id});

			// Fin
			return res.json();
		},
	},

	prefsDeCampo: {
		obtieneOpciones: (req, res) => res.json(pppOpcsSimples),
		guardaLaPreferencia: async (req, res) => {
			// Variables
			const {entidad, entidad_id, ppp_id} = req.query;
			const usuario_id = req.session.usuario.id;

			// Si existe el registro, lo elimina
			const condics = {entidad, entidad_id, usuario_id};
			const registro = await baseDeDatos.obtienePorCondicion("pppRegistros", condics);
			if (registro) baseDeDatos.eliminaPorId("pppRegistros", registro.id);

			// Si la opción no es sinPref, agrega el registro
			if (ppp_id != pppOpcsObj.sinPref.id) {
				const datos = {entidad, entidad_id, usuario_id, ppp_id};
				baseDeDatos.agregaRegistro("pppRegistros", datos);
			}

			// Fin
			return res.json();
		},
	},
};
