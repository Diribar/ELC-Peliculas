module.exports = (sequelize, dt) => {
	const alias = "categorias";
	const columns = {
		orden: { type: dt.INTEGER },
		nombre: { type: dt.STRING(50) },
	};
	const config = {
		tableName: "categorias",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.hasMany(n.peliculas, {as: "peliculas",foreignKey: "categoria_id"});
		entidad.hasMany(n.subcategorias, {as: "subcategorias",foreignKey: "categoria_id"});
	};
	return entidad;
};
