module.exports = (sequelize, dt) => {
	const alias = "categorias";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		nombre: {type: dt.STRING(20)}
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
