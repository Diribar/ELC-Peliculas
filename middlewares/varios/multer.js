const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/imagenes/4-Provisorio");
	},
	filename: (req, file, cb) => {
		ext = path.extname(file.originalname);
		//nombre = path.basename(file.originalname, ext);
		//console.log(file.originalname, ext);
		cb(null, Date.now() + ext);
	},
});

module.exports = multer({ storage });
