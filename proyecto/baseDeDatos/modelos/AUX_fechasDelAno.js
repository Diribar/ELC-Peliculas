module.exports = (sequelize, dt) => {
	const alias = "fechasDelAno";
	const columns = {
		dia: {type: dt.INTEGER},
		mes_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(6)},
		epocaDelAno_id: {type: dt.INTEGER},
		ano: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_fechas_del_ano",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.meses, {as: "mes", foreignKey: "mes_id"});
		entidad.belongsTo(n.epocasDelAno, {as: "epocaDelAno", foreignKey: "epocaDelAno_id"});

		entidad.hasMany(n.personajes, {as: "personajes", foreignKey: "fechaDelAno_id"});
		entidad.hasMany(n.hechos, {as: "hechos", foreignKey: "fechaDelAno_id"});
		entidad.hasMany(n.temas, {as: "temas", foreignKey: "fechaDelAno_id"});
		entidad.hasMany(n.eventos, {as: "eventos", foreignKey: "fechaDelAno_id"});
		// A propósito no se pone épocas del año
	};
	return entidad;
};
