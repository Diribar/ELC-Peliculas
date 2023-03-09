module.exports = (sequelize, dt) => {
	const alias = "imagenes_fijo";
	const columns = {
		dia_del_ano_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(45)},
		nombre_archivo: {type: dt.STRING(45)},

		personajes: {type: dt.BOOLEAN},
		hechos: {type: dt.BOOLEAN},
		valores: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "aux_imagenes_fijo",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.dias_del_ano, {as: "dia_del_ano", foreignKey: "dia_del_ano_id"});
	}
	return entidad;
};
