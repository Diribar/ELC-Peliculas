module.exports = (sequelize, dt) => {
	const alias = "navegsAcums";
	const columns = {
		fecha: {type: dt.STRING(10)},
		diaSem: {type: dt.STRING(3)},
		anoMes: {type: dt.STRING(3)},

		// Tipos de navegantes
		logins: {type: dt.INTEGER},
		usSinLogin: {type: dt.INTEGER},
		visitas: {type: dt.INTEGER},

		// Calidad de navegantes
		altasDelDia: {type: dt.INTEGER},
		transicion: {type: dt.INTEGER},
		unoATres: {type: dt.INTEGER},
		unoADiez: {type: dt.INTEGER},
		masDeDiez: {type: dt.INTEGER},
		masDeTreinta: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_navegs_acums",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};
