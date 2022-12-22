module.exports = (sequelize, dt) => {
	const alias = "banco_fotos";
	const columns = {
		nombre: {type: dt.STRING(20)},
		dia_del_ano_id: {type: dt.INTEGER},
		nombre_archivo: {type: dt.STRING(20)},
		fecha_movil: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "aux_banco_fotos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.dias_del_ano, {as: "dia_del_ano", foreignKey: "dia_del_ano_id"});
	}
	return entidad;
};
