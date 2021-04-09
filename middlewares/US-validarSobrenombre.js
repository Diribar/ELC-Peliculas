const path = require('path');
const {body} = require('express-validator');

module.exports = [
	body('sobrenombre').notEmpty().withMessage('Tenés que completar este campo'),
	body('pais').notEmpty().withMessage('Tenés que elegir un país'),
	body('estado').notEmpty().withMessage('Tenés que elegir un estado'),
	body('imagen').custom((value, {req}) => {
		let archivo = req.file;
		let Tipos = ['.jpg', '.png', '.gif'];		
		if (!archivo) {
			throw new Error('Tenés que subir un archivo de imagen');
		} else {
			let Tipo_de_Archivo = path.extname(archivo.originalname);
			if (!Tipos.includes(Tipo_de_Archivo)) {
				throw new Error("Las extensiones de archivo permitidas son ${Tipos.join(', ')}");
			}
		}
		return true;
	})
]
