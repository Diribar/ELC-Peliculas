module.exports = (sequelize, dt) => {
	const alias = "habitualPorCliente";
	const columns = {
		fecha: {type: dt.STRING(10)},

		// Fidelidad de clientes
		tresDiez: {type: dt.INTEGER},
		onceTreinta: {type: dt.INTEGER},
		masDeTreinta: {type: dt.INTEGER},
		unoDos: {type: dt.INTEGER},
	};
	const config = {
		tableName: "ind_historial_clientes",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
