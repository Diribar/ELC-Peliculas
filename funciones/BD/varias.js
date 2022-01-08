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

	obtenerPorParametroConInclude: (entidad, parametro, valor, includes) => {
		return db[entidad].findOne({
			where: {[parametro]: valor},
			include: includes,
		});
	},

	obtenerPorParametrosConInclude: (entidad, parametro1, valor1, parametro2, valor2, includes) => {
		return db[entidad].findOne({
			where: {[parametro1]: valor1, [parametro2]: valor2},
			include: includes,
		});
	},

	obtenerPorId: (entidad, id) => {
		return db[entidad].findByPk(id);
	},

	obtenerPorIdConInclude: (entidad, id, includes) => {
		return db[entidad].findByPk(id, {include: includes});
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
			where: {[campo]: valor},
		});
	},
};
