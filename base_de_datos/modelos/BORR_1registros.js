module.exports = (sequelize, dt) => {
	const alias = "registros_borrados";
	const columns = {
		elc_id: {type: dt.INTEGER},
		elc_entidad: {type: dt.STRING(20)},
		usuario_sancionado_id: {type: dt.INTEGER},
		evaluado_por_usuario_id: {type: dt.INTEGER},
		motivo_id: {type: dt.INTEGER},
		duracion: {type: dt.INTEGER},
		status_registro_id: {type: dt.INTEGER},
		creado_en: {type: dt.DATE},
		};
	const config = {
		tableName: "borr_1registros",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "usuario_sancionado", foreignKey: "usuario_sancionado_id"});
		entidad.belongsTo(n.usuarios, {as: "evaluado_por_usuario", foreignKey: "evaluado_por_usuario_id"});
		entidad.belongsTo(n.motivos_para_borrar, {as: "motivo", foreignKey: "motivo_id"});
		entidad.belongsTo(n.status_registro_ent, {as: "status_registro", foreignKey: "status_registro_id"});
	};
	return entidad;
};
