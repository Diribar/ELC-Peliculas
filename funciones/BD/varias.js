const db = require("../../base_de_datos/modelos");

module.exports = {
	// Obtener
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

	// Otras
	agregarRegistro: (datos) => {
		return db[datos.entidad].create(datos);
	},

	actualizarRegistro: (entidad, datos, id) => {
		return db[entidad].update(datos, {where: {id: id}});
	},

	contarCasos: (entidad, campo, valor) => {
		return db[entidad].count({
			where: {[campo]: valor}
		})
	}

};
