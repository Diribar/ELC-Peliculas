let db = require("../../base_de_datos/modelos");
let usuarios = db.usuarios;
//const { Op } = require("sequelize");

module.exports = {
	obtenerProductos: (entidad, orden) => {
		return db[entidad].findAll({
			where: { borrado: false },
			order: [[orden, "ASC"]],
		});
	},

	obtenerProductosConInclude: (entidad, orden, includes) => {
		return db[entidad].findAll({
			where: { borrado: false },
			include: includes,
			order: [[orden, "ASC"]],
		});
	},

	obtenerProductoPorIdConInclude: (entidad, id, includes) => {
		return db[entidad].findByPk(id, {
			include: includes,
		});
	},


	obtenerUsuarioPorID: (id) => {
		return usuarios.findByPk(id, {
			include: [
				"rol_usuario",
				"sexo",
				"status_registro",
				"pais",
				"estado_eclesial",
			],
		});
	},

	obtenerUsuarioPorMail: (email) => {
		return usuarios.findOne({
			where: { email: email },
			include: [
				"rol_usuario",
				"sexo",
				"status_registro",
				"pais",
				"estado_eclesial",
			],
		});
	},

	obtenerAutorizadoFA: (id) => {
		return usuarios.findByPk(id).then((n) => n.autorizado_fa);
	},
};
