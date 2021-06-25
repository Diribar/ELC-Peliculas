const path = require('path');
const {body} = require('express-validator');

module.exports = [
	body('apodo').notEmpty().withMessage('Tenés que completar este campo'),
	body('pais').notEmpty().withMessage('Tenés que elegir un país'),
	body('estado_eclesial').notEmpty().withMessage('Tenés que elegir un estado'),
	body('avatar').custom((value, {req}) => {
		let archivo = req.file;
		let Tipos = ['.jpg', '.png'];		
		if (archivo) {
			let Tipo_de_Archivo = path.extname(archivo.originalname);
			if (!Tipos.includes(Tipo_de_Archivo)) {
				throw new Error("Las extensiones de archivo permitidas son JPG y PNG");
			}
		}
		return true;
	})
]
