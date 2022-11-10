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

// Guarda la imagen
module.exports = multer({
	storage,
	// fileFilter: (req, file, cb) => {
	// 	const acceptableExtensions = [".png", ".jpg", "jpeg"];
	// 	if (!acceptableExtensions.includes(path.extname(file.originalname))) {
	// 		return cb(new Error("..."));
	// 	}

	// 	// added this
	// 	const fileSize = parseInt(req.headers["content-length"]);
	// 	console.log(fileSize);
	// 	if (fileSize > 1000) {
	// 		return cb(new Error("Error de tamaño"));
	// 	}
	// },
});
