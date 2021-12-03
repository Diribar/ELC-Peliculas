module.exports = (sequelize, dt) => {
	const alias = "penalizaciones_usuarios";
	const columns = {
		creada_en: {type: dt.DATE},
		usuario_id: {type: dt.INTEGER},
		rol_usuario_id: {type: dt.INTEGER},
		penalizado_por_id: {type: dt.INTEGER},
		penalizacion_id: {type: dt.INTEGER},
		comentario: {type: dt.STRING(100)},
	};
	const config = {
		tableName: "us_penalizaciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
        entidad.belongsTo(n.roles_usuarios, {as: "rol_usuario", foreignKey: "rol_usuario_id"});
		entidad.belongsTo(n.usuarios, {as: "penalizado_por", foreignKey: "usuario_id"});
		entidad.belongsTo(n.penalizaciones_motivos, {as: "penalizaciones_motivo", foreignKey: "penalizacion_id"});
	};
	return entidad;
};
