module.exports = (sequelize, dt) => {
	const alias = "RCLV_valores";
	const columns = {
		nombre: {type: dt.STRING(30)},

		creada_por_id: {type: dt.INTEGER},
		creada_en: {type: dt.DATE},
		editada_por_id: {type: dt.INTEGER},
		editada_en: {type: dt.DATE},
		capturada_por_id: {type: dt.INTEGER},
		capturada_en: {type: dt.DATE},
	};
	const config = {
		tableName: "RCLV_valores",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "creada_por", foreignKey: "creada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "editada_por", foreignKey: "editada_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturada_por", foreignKey: "capturada_por_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "valor_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "valor_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "valor_id"});
	};
	return entidad;
};
