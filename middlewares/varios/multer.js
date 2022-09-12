"use strict";
// Requires
const path = require("path");
const multer = require("multer");

// Variables
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./publico/imagenes/9-Provisorio");
	},
	filename: (req, file, cb) => {
		// ext = path.extname(file.originalname);
		// nombre = path.basename(file.originalname, ext);
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

// Guardar la imagen
module.exports = multer({storage});
