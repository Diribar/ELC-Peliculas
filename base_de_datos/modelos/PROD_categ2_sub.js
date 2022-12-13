module.exports = (sequelize, dt) => {
	const alias = "subcategorias";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(50)},
		
		cfc: {type: dt.BOOLEAN},
		vpc: {type: dt.BOOLEAN},
		rclv_necesario: {type: dt.STRING(10)},
		pers_codigo: {type: dt.STRING(3)},
		hechos_codigo: {type: dt.STRING(3)},
		
		url: {type: dt.STRING(20)},
	};
	const config = {
		tableName: "prod_categ2_sub",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	entidad.associate = (n) => {
		entidad.hasMany(n.peliculas, {as: "peliculas", foreignKey: "subcategoria_id"});
		entidad.hasMany(n.colecciones, {as: "colecciones", foreignKey: "subcategoria_id"});
		entidad.hasMany(n.capitulos, {as: "capitulos", foreignKey: "subcategoria_id"});
	};
	return entidad;
};
