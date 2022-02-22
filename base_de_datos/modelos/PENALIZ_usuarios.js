module.exports = (sequelize, dt) => {
	const alias = "penaliz_us_usuarios";
	const columns = {
		creado_en: {type: dt.DATE},
		usuario_id: {type: dt.INTEGER},
		rol_usuario_id: {type: dt.INTEGER},
		penaliz_por_id: {type: dt.INTEGER},
		penaliz_motivo_id: {type: dt.INTEGER},
		comentario: {type: dt.STRING(200)},
	};
	const config = {
		tableName: "penaliz_us_usuarios",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
        entidad.belongsTo(n.roles_usuarios, {as: "rol_usuario", foreignKey: "rol_usuario_id"});
		entidad.belongsTo(n.usuarios, {as: "penaliz_por", foreignKey: "penaliz_por_id"});
		entidad.belongsTo(n.borrar_motivos, {as: "penaliz_motivo", foreignKey: "penaliz_motivo_id"});
	};
	return entidad;
};
