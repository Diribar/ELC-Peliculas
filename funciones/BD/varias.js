const db = require("../../base_de_datos/modelos");

module.exports = {
	// Obtener
	obtenerTodos: (entidad, orden) => {
		return db[entidad].findAll({
			order: [[orden, "ASC"]],
		});
	},

	obtenerPorCampo: (entidad, campo, valor) => {
		return db[entidad].findOne({
			where: {[campo]: valor},
		});
	},

	obtenerPor2Campos: (entidad, campo1, valor1, campo2, valor2) => {
		return db[entidad].findOne({
			where: {[campo1]: valor1, [campo2]: valor2},
		});
	},

	obtenerPor3Campos: (entidad, campo1, valor1, campo2, valor2, campo3, valor3) => {
		return db[entidad].findOne({
			where: {[campo1]: valor1, [campo2]: valor2, [campo3]: valor3},
		});
	},

	obtenerTodosPorCampoConInclude: (entidad, campo, valor, includes) => {
		return db[entidad].findAll({
			where: {[campo]: valor},
			include: includes,
		});
	},

	obtenerPor2CamposConInclude: (entidad, campo1, valor1, campo2, valor2, includes) => {
		return db[entidad].findOne({
			where: {[campo1]: valor1, [campo2]: valor2},
			include: includes,
		});
	},

	obtenerPor3CamposConInclude: (entidad, campo1, valor1, campo2, valor2, campo3, valor3, includes) => {
		return db[entidad].findOne({
			where: {[campo1]: valor1, [campo2]: valor2, [campo3]: valor3},
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
