module.exports = (sequelize, dt) => {
	const alias = "misConsultas";
	const columns = {
		entidad: {type: dt.STRING(11)},
		entidad_id: {type: dt.INTEGER},
		usuario_id: {type: dt.INTEGER},
		visitadaEn: {type: dt.DATE},
		};
	const config = {
		tableName: "aux_mis_consultas",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.usuarios, {as: "usuario", foreignKey: "usuario_id"});
	}

	return entidad;
};
