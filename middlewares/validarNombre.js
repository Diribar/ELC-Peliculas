const path = require('path');
const {body} = require('express-validator');

module.exports = [
	body('nombre').notEmpty().withMessage('Tienes que completar este campo').bail(),
	body('apellido').notEmpty().withMessage('Tienes que completar este campo').bail(),
	body('fechaNacimiento').notEmpty().withMessage('Tienes que completar este campo').bail(),
]
