module.exports = (sequelize, dt) => {
	const alias = "filtros_campos";
	const columns = {
		cabecera_id: {type: dt.INTEGER},
		campo: {type: dt.STRING(20)},
		valor: {type: dt.STRING(10)},
	};
	const config = {
		tableName: "filtros_campos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.filtros_cabecera, {as: "cabecera", foreignKey: "cabecera_id"});
	};
	return entidad;
};
