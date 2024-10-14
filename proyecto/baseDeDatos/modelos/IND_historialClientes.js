module.exports = (sequelize, dt) => {
	const alias = "historialClientes";
	const columns = {
		fecha: {type: dt.STRING(10)},

		// Fidelidad de clientes
		// altasDelDia: {type: dt.INTEGER},
		tresDiez: {type: dt.INTEGER},
		diezTreinta: {type: dt.INTEGER},
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
