module.exports = (sequelize, dt) => {
	const alias = "RCLV_valores";
	const columns = {
		ELC_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(30)},

		editado_por_id: {type: dt.INTEGER},
		editado_en: {type: dt.DATE},
		status_registro_id: {type: dt.INTEGER},
		capturado_por_id: {type: dt.INTEGER},
		capturado_en: {type: dt.DATE},
	};
	const config = {
		tableName: "RCLV_valores",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "editado_por", foreignKey: "editado_por_id"});
		entidad.belongsTo(n.usuarios, {as: "capturado_por", foreignKey: "capturado_por_id"});
		entidad.belongsTo(n.status_registro_prod, {as: "status_registro", foreignKey: "status_registro_id"});

		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "valor_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "valor_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "valor_id"});
	};
	return entidad;
};
