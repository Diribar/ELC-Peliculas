module.exports = (sequelize, dt) => {
	const alias = "menu_opciones";
	const columns = {
		id: { type: dt.INTEGER, primaryKey: true },
		nombre: { type: dt.STRING(50) },
		url: { type: dt.STRING(50) },
		titulo: { type: dt.STRING(50) },
		vista: { type: dt.STRING(20) },
		comentario: { type: dt.STRING(100) },
	};
	const config = {
		tableName: "menu_opciones",
		timestamps: false,
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
	};
	return entidad;
};
