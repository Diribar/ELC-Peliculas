module.exports = (sequelize, dt) => {
	const alias = "dias_del_ano";
	const columns = {
		dia: {type: dt.INTEGER},
		mes_id: {type: dt.INTEGER},
		cant_peliculas: {type: dt.INTEGER},
		cant_colecciones: {type: dt.INTEGER},
	};
	const config = {
		tableName: "rclv_dias",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.meses, {as: "mes", foreignKey: "mes_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "dia_del_ano_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "dia_del_ano_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "dia_del_ano_id"});

	};
	return entidad;
};
