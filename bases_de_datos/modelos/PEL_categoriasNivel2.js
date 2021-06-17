module.exports = (sequelize, dt) => {
	const alias = "subcategorias";
	const columns = {
		id: {type: dt.INTEGER, primaryKey: true},
		categoria_id: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)}
	};
	const config = {
		tableName: "subcategorias",
		timestamps: false
	};
	const entidad = sequelize.define(alias,columns,config);
	entidad.associate = n => {
		entidad.belongsTo(n.categorias, {as: "categoria", foreignKey: "categoria_id"});
		entidad.hasMany(n.peliculas, {as: "peliculas",foreignKey: "subcategoria_id"});
	};
	return entidad;
};
