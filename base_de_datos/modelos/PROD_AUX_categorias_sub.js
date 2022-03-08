module.exports = (sequelize, dt) => {
	const alias = "subcategorias";
	const columns = {
		orden: {type: dt.INTEGER},
		categoria_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(50)},
		personaje: {type: dt.BOOLEAN},
		hecho: {type: dt.BOOLEAN},
		valor: {type: dt.BOOLEAN},
		url: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "categorias_sub",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "subcategoria_id"});
	};
	return entidad;
};
