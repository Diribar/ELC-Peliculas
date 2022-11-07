"use strict";
// Requires
const path = require("path");
const multer = require("multer");
const comp = require("../../funciones/3-Procesos/Compartidas");

// Variables
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, "./publico/imagenes/9-Provisorio"),
	filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

// Crea la carpeta 'provisorio' si no existe
comp.garantizaLaCarpetaProvisorio();

// Guardar la imagen
module.exports = multer({storage});
