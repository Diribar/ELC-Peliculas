module.exports = (sequelize, dt) => {
	const alias = "clientesAcums";
	const columns = {
		fecha: {type: dt.STRING(10)},
		diaSem: {type: dt.STRING(3)},
		anoMes: {type: dt.STRING(3)},

		// Cantidad de clientes
		logins: {type: dt.INTEGER},
		usSinLogin: {type: dt.INTEGER},
		visitas: {type: dt.INTEGER},

		// Calidad de clientes
		altasDelDia: {type: dt.INTEGER},
		unaSola: {type: dt.INTEGER},
		menosDeCinco: {type: dt.INTEGER},
		masDeTreinta: {type: dt.INTEGER},
		otras: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_clientes_acums",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
