const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		console.log("middleware:")
		console.log(file)
		cb(null, req.body.ruta);
	},
	filename: (req, file, cb) => {
		ext = path.extname(file.originalname);
		nombre = path.basename(file.originalname, ext);
		cb(null, nombre + " - " + Date.now() + ext);
	},
});

module.exports = multer({ storage });
