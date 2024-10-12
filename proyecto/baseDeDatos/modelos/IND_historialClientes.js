module.exports = (sequelize, dt) => {
	const alias = "historialClientes";
	const columns = {
		fecha: {type: dt.STRING(10)},

		// Fidelidad de navegantes
		altasDelDia: {type: dt.INTEGER},
		unoTres: {type: dt.INTEGER},
		cuatroDiez: {type: dt.INTEGER},
		diezTreinta: {type: dt.INTEGER},
		masDeTreinta: {type: dt.INTEGER},
	};
	const config = {
		tableName: "ind_historial_clientes",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
