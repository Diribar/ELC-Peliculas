const {body} = require('express-validator');

module.exports = [
	body('email')
	.notEmpty().withMessage('Debes escribir un correo electrónico').bail()
	.isEmail().withMessage('Debes escribir un formato de correo válido').bail()
	,
	body('contrasena')
	.notEmpty().withMessage('Debes escribir una contraseña').bail()
	.isLength({min:6, max:12}).withMessage("La contraseña debe tener de 6 a 12 caracteres").bail()
	,
]
