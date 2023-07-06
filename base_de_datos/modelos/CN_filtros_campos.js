module.exports = (sequelize, dt) => {
	const alias = "filtrosPorCampo";
	const columns = {
		configCons_id: {type: dt.INTEGER},
		campo: {type: dt.STRING(20)},
		valor: {type: dt.STRING(15)},
	};
	const config = {
		tableName: "cn_filtros_campos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.filtrosCabecera, {as: "configConsulta", foreignKey: "configCons_id"});
	};
	return entidad;
};
