module.exports = (sequelize, dt) => {
	const alias = "imagenes_movil";
	const columns = {
		dia_del_ano_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(30)},
		nombre_archivo: {type: dt.STRING(30)},
		cuando: {type: dt.STRING(45)},

		personaje_id: {type: dt.INTEGER},
		hecho_id: {type: dt.INTEGER},
		valor_id: {type: dt.INTEGER},
	};
	const config = {
		tableName: "aux_imagenes_movil",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.dias_del_ano, {as: "dia_del_ano", foreignKey: "dia_del_ano_id"});

		entidad.belongsTo(n.personajes, {as: "personaje", foreignKey: "personaje_id"});
		entidad.belongsTo(n.hechos, {as: "hecho", foreignKey: "hecho_id"});
		entidad.belongsTo(n.valores, {as: "valor", foreignKey: "valor_id"});
	}
	return entidad;
};
