module.exports = (sequelize, dt) => {
	const alias = "penaliz_us_motivos";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(40)},
		alta: {type: dt.BOOLEAN},
		edicion: {type: dt.BOOLEAN},
		duracion: {type: dt.INTEGER},
		mensaje_mail: {type: dt.STRING(200)},
	};
	const config = {
		tableName: "penaliz_us_motivos",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.penaliz_us_usuarios, {as: "usuarios_penalizados", foreignKey: "penaliz_motivo_id"});
	};
	return entidad;
};
