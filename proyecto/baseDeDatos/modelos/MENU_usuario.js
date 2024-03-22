module.exports = (sequelize, dt) => {
	const alias = "menuUsuario";
	const columns = {
		orden: {type: dt.INTEGER},
		titulo: {type: dt.STRING(30)},
		icono: {type: dt.STRING(30)},
		href: {type: dt.STRING(30)},

		hr: {type: dt.BOOLEAN},
		permInputs: {type: dt.BOOLEAN},
		actualizado: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "menu_usuario",
		timestamps: false,
	};

	const entidad = sequelize.define(alias, columns, config);

	return entidad;
};
