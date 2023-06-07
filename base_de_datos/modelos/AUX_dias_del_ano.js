module.exports = (sequelize, dt) => {
	const alias = "diasDelAno";
	const columns = {
		dia: {type: dt.INTEGER},
		mes_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(6)},
		epocaDelAno_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_diasDelAno",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.meses, {as: "mes", foreignKey: "mes_id"});
		entidad.belongsTo(n.epocas_del_ano, {as: "epoca_del_ano", foreignKey: "epocaDelAno_id"});

		entidad.hasMany(n.personajes, {as: "personajes", foreignKey: "diaDelAno_id"});
		entidad.hasMany(n.hechos, {as: "hechos", foreignKey: "diaDelAno_id"});
		entidad.hasMany(n.temas, {as: "temas", foreignKey: "diaDelAno_id"});
		entidad.hasMany(n.eventos, {as: "eventos", foreignKey: "diaDelAno_id"});
		// A propósito no se pone épocas del año
	};
	return entidad;
};
