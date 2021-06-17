const path = require('path');
const pathFile = path.resolve(__dirname, '../../public/imagenes/2-Usuarios');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {cb(null, pathFile);},
	filename: (req, file, cb) => {cb(null, Date.now() + path.extname(file.originalname))}
})

module.exports = multer({ storage });
