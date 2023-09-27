"use strict";
// Requires
const multer = require("multer");
const comp = require("../../funciones/2-Procesos/Compartidas");

// Variables
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, "./publico/imagenes/9-Provisorio"),
	filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

// Crea la carpeta 'provisorio' si no existe
comp.gestionArchivos.carpetaProvisorio();

// Guarda la imagen
module.exports = multer({
	storage,
	fileFilter: (req, file, cb) => {
		// Variables
		const archivoEsImagen = file.mimetype.startsWith("image/");
		const tamArchivo = Number(req.headers["content-length"]);

		// Fin
		return cb(null, archivoEsImagen && tamArchivo <= tamMaxImagen);
	},
});
