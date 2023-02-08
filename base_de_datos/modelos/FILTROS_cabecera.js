module.exports = (sequelize, dt) => {
	const alias = "filtros_cabecera";
	const columns = {
		usuario_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "filtros_cabecera",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.filtros_campos, {as: "campos", foreignKey: "cabecera_id"});
	};
	return entidad;
};
