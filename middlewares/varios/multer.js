const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		//console.log(req.body.ruta);
		cb(null, req.body.ruta);
	},
	filename: (req, file, cb) => {
		ext = path.extname(file.originalname);
		//nombre = path.basename(file.originalname, ext);
		//console.log(file.originalname, ext);
		cb(null, Date.now() + ext);
	},
});

module.exports = multer({ storage });
