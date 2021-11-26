const db = require("../../base_de_datos/modelos");

module.exports = {
	obtenerTodos: (entidad, orden) => {
		return db[entidad].findAll({
			order: [[orden, "ASC"]],
		});
	},

	obtenerPorParametro: (entidad, parametro, valor) => {
		return db[entidad].findOne({
			where: {[parametro]: valor},
		});
	},

	obtenerPorId: (entidad, id) => {
		return db[entidad].findByPk(id);
	},

	obtenerELC_id: (datos) => {
		return db[datos.entidad].findOne({where: {[datos.campo]: datos.valor}}).then((n) => {
			return n ? n.id : false;
		});
	},

	agregarRegistro: (datos) => {
		return db[datos.entidad].create(datos);
	},

	actualizarRegistro: (entidad, datos, id) => {
		return db[entidad].update(datos, {where: {id: id}});
	},
};
