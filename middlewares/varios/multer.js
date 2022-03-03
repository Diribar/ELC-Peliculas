const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/imagenes/9-Provisorio");
	},
	filename: (req, file, cb) => {
		// ext = path.extname(file.originalname);
		// nombre = path.basename(file.originalname, ext);
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

module.exports = multer({storage});
