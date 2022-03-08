module.exports = (sequelize, dt) => {
	const alias = "epocas_estreno";
	const columns = {
		orden: {type: dt.INTEGER},
		nombre: {type: dt.STRING(20)},
		ano_comienzo: {type: dt.INTEGER},
		ano_fin: {type: dt.INTEGER},
	};
	const config = {
		tableName: "prod_epocas_estreno",
		timestamps: false,
	};
	const entidad = sequelize.define(alias, columns, config);
	return entidad;
};

// CREATE TABLE prod_epocas_estreno (
// 	id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
// 	orden TINYINT UNSIGNED NOT NULL,
// 	nombre VARCHAR(20) NOT NULL,
// 	ano_comienzo SMALLINT UNSIGNED NOT NULL,
// 	ano_fin SMALLINT UNSIGNED NOT NULL,
// 	PRIMARY KEY (id)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
// INSERT INTO prod_epocas_estreno (id, orden, nombre, ano_comienzo, ano_fin)
// VALUES 
// (4, 1, '2015 - Presente', 2015, 2025),
// (3, 2, '2000 - 2014', 2000, 2014), 
// (2, 3, '1970 - 1999', 1970, 1999), 
// (1, 4, 'Antes de 1970', 1900, 1969)
// ;
