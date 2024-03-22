module.exports = (sequelize, dt) => {
	const alias = "epocasOcurrencia";
	const columns = {
		orden: {type: dt.INTEGER},
		consulta: {type: dt.STRING(35)},
		nombre: {type: dt.STRING(15)},
		ayuda_pers: {type: dt.STRING(50)},
		ayuda_hecho: {type: dt.STRING(50)},
	};
	const config = {
		tableName: "rclv_epocas_ocurr",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.personajes, {as: "personajes", foreignKey: "epocaOcurrencia_id"});
		entidad.hasMany(n.hechos, {as: "hechos", foreignKey: "epocaOcurrencia_id"});
	};
	return entidad;
};
