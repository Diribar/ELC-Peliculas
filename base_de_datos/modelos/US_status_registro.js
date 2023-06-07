module.exports = (sequelize, dt) => {
	const alias = "status_registro_us";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(50)},
		mail_a_validar: {type: dt.BOOLEAN},
		mail_validado: {type: dt.BOOLEAN},
		editables: {type: dt.BOOLEAN},
		ident_a_validar: {type: dt.BOOLEAN},
		ident_validada: {type: dt.BOOLEAN},
	};
	const config = {
		tableName: "us_status_registro",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.usuarios, {as: "usuarios", foreignKey: "statusRegistro_id"});
	};
	return entidad;
};
