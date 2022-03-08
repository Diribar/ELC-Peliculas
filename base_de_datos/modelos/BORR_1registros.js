module.exports = (sequelize, dt) => {
	const alias = "registros_borrados";
	const columns = {
		ELC_id: {type: dt.INTEGER},
		ELC_entidad: {type: dt.STRING(11)},
		motivo_id: {type: dt.INTEGER},
		comentario: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "borr_1registros",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.borrar_motivos, {as: "motivo", foreignKey: "motivo_id"});
	};
	return entidad;
};
