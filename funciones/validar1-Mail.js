const {body} = require('express-validator');

module.exports = [
	body('email')
	.notEmpty().withMessage('Debes escribir un correo electrónico').bail()
	.isEmail().withMessage('Debes escribir un formato de correo válido').bail()
	,
]
