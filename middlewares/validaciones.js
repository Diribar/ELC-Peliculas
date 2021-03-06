const path = require('path');
const { body } = require('express-validator');

module.exports = [
	body('nombre').notEmpty().withMessage('Tienes que completar este campo'),
	body('email')
		.notEmpty().withMessage('Tienes que completar este campo').bail()
		.isEmail().withMessage('Debes escribir un formato de correo válido'),
	body('contrasena').notEmpty().withMessage('Tienes que completar este campo'),
	body('pais').notEmpty().withMessage('Tienes que elegir un país'),
	body('imagen').custom((value, {req}) => {
		let archivo = req.file;
		let Tipos = ['.jpg', '.png', '.gif'];		
		if (!archivo) {
			throw new Error('Tienes que subir una imagen');
		} else {
			let Tipo_de_Archivo = path.extname(archivo.originalname);
			if (!Tipos.includes(Tipo_de_Archivo)) {
				throw new Error("Las extensiones de archivo permitidas son ${Tipos.join(', ')}");
			}
		}
		return true;
	})
]
