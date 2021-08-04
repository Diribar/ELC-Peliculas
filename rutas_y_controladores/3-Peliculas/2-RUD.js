// ************ Requires *************
const BD_peliculas = require("../../modelos/bases_de_datos/BD_peliculas");

// ************ Variables ************
// const fs = require('fs');
// const path = require('path')
// const ruta_nombre_pelis = path.join(__dirname, '../../bases_de_datos/tablas/BDpeliculas.json');
// const ruta_nombre_detalle = path.join(__dirname, '../../bases_de_datos/tablas/menuDetalle.json');
// function leer(n) {return JSON.parse(fs.readFileSync(n, 'utf-8'))};

// *********** Controlador ***********
module.exports = {
	detalle: async (req, res) => {
		// Obtener los datos de la película
		let ID = req.params.id
		let producto = await BD_peliculas.ObtenerPorID(ID);
		// Ir a la vista
		return res.render("0-CRUD", {
			titulo: "Detalle",
			nombre: "Información General",
			ID,
			producto,
		});
	},

	editarGuardar: (req, res) => {
		return res.send("Estoy en editarGuardar");
	},

	bajaGuardar: (req, res) => {
		return res.send("Estoy en bajaGuardar");
	},
};
