"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/1-BD/Genericas");
const comp = require("../../funciones/2-Procesos/Compartidas");
const procsCRUD = require("../2.0-Familias-CRUD/FM-Procesos");
const procesos = require("./PR-FN-Procesos");
const valida = require("./PR-FN-Validar");

// *********** Controlador ***********
module.exports = {
	califics: {
		delProducto: async (req, res) => {
			// Variables
			const {entidad, id: prodID} = req.query;
			const userID = req.session.usuario ? req.session.usuario.id : "";
			let datos;
			let calificaciones = [];

			// Datos generales
			datos = await BD_genericas.obtienePorId(entidad, prodID).then((n) => [
				n.feValores,
				n.entretiene,
				n.calidadTecnica,
				n.calificacion,
			]);
			calificaciones.push({autor: "Gral.", valores: datos});

			// Datos particulares
			const condics = {usuario_id: userID, entidad, entidad_id: prodID};
			const include = ["feValores", "entretiene", "calidadTecnica"];
			datos = await BD_genericas.obtienePorCondicionConInclude("cal_registros", condics, include);
			if (datos) {
				datos = [datos.feValores.valor, datos.entretiene.valor, datos.calidadTecnica.valor, datos.resultado];
				calificaciones.push({autor: "Tuya", valores: datos});
			}

			// Fin
			return res.json(calificaciones);
		},
		delUsuarioProducto: async (req, res) => {
			// Variables
			const {entidad, id: prodID} = req.query;
			const userID = req.session.usuario ? req.session.usuario.id : "";

			// Datos particulares
			const condics = {usuario_id: userID, entidad, entidad_id: prodID};
			const califGuardada = await BD_genericas.obtienePorCondicion("cal_registros", condics);

			// Fin
			return res.json({califGuardada, atributosCalific, criteriosCalif});
		},
		elimina: async (req, res) => {
			// Variables
			const {entidad, id: entidad_id} = req.query;
			const userID = req.session.usuario ? req.session.usuario.id : "";

			// Elimina
			const condics = {usuario_id: userID, entidad, entidad_id};
			await BD_genericas.eliminaTodosPorCondicion("cal_registros", condics);

			// Actualiza las calificaciones del producto
			await procesos.actualizaCalifProd({entidad, entidad_id});

			// Fin
			return res.json();
		},
	},

	// Edición del Producto
	edicion: {
		valida: async (req, res) => {
			// Obtiene los campos
			let campos = Object.keys(req.query);

			// Averigua los errores solamente para esos campos
			req.query.epocaOcurrencia = req.session.usuario.rolUsuario.revisorEnts;
			req.query.publico = req.session.usuario.rolUsuario.revisorEnts;
			let errores = await valida.consolidado({campos, datos: req.query});

			// Devuelve el resultado
			return res.json(errores);
		},
		obtieneVersionesProd: async (req, res) => {
			// Variables
			let {entidad: producto, id: prodID} = req.query;
			let userID = req.session.usuario.id;

			// Obtiene los datos ORIGINALES y EDITADOS del producto
			let [prodOrig, prodEdic] = await procsCRUD.obtieneOriginalEdicion(producto, prodID, userID);

			// Envía los datos
			return res.json([prodOrig, prodEdic]);
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
			const prodID = req.query.id;
			const userID = req.session.usuario.id;

			// Obtiene los datos ORIGINALES y EDITADOS del producto
			const [prodOrig, prodEdic] = await procsCRUD.obtieneOriginalEdicion(producto, prodID, userID);
			// No se puede eliminar la edición de un producto con status "gr_creado" y fue creado por el usuario
			const condicion = !prodOrig.statusRegistro.gr_creado || prodOrig.creadoPor_id != userID;

			if (condicion && prodEdic) {
				if (prodEdic.avatar) comp.gestionArchivos.elimina("./publico/imagenes/2-Productos/Revisar/", prodEdic.avatar);
				BD_genericas.eliminaPorId("prodsEdicion", prodEdic.id);
			}
			// Terminar
			return res.json();
		},
		envioParaSession: async (req, res) => {
			if (req.query.avatar) delete req.query.avatar;
			req.session.edicProd = req.query;
			res.cookie("edicProd", req.query, {maxAge: unDia});
			return res.json();
		},
	},

	prefsDeCampo: {
		obtieneOpciones: (req, res) => {
			return res.json(pppOpciones);
		},
		guardaLaPreferencia: async (req, res) => {
			// Variables
			const {entidad, entidad_id, opcion_id} = req.query;
			const usuario_id = req.session.usuario.id;

			// Averigua si existe el registro
			const condics = {entidad, entidad_id, usuario_id};
			const registro = await BD_genericas.obtienePorCondicion("ppp_registros", condics);

			// Acciones si la opción es Sin preferencia personal
			if (opcion_id == sinPreferencia.id) {
				if (registro) BD_genericas.eliminaPorId("ppp_registros", registro.id);
			} else {
				// Variable
				const datos = {entidad, entidad_id, opcion_id, usuario_id};

				// Agrega o actualiza
				registro
					? BD_genericas.actualizaPorId("ppp_registros", registro.id, datos)
					: BD_genericas.agregaRegistro("ppp_registros", datos);
			}

			// Fin
			return res.json();
		},
	},
};
