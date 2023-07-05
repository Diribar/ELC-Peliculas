module.exports = (sequelize, dt) => {
	const alias = "filtrosCabecera";
	const columns = {
		usuario_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "cn_filtros_cabecera",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.filtrosPorCampo, {as: "filtrosPorCampo", foreignKey: "cabecera_id"});
	};
	return entidad;
};
