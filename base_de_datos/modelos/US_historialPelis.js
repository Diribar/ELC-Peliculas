module.exports = (sequelize, dt) => {
	const alias = "historialPelis";
	const columns = {
		usuario_id: {type: dt.INTEGER},
		entidad: {type: dt.STRING(14)},
		entidad_id: {type: dt.INTEGER},
		ocurridoEn: {type: dt.DATE},
		};
	const config = {
		tableName: "us_historial_pelis",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
	}

	return entidad;
};
