const {body} = require('express-validator');

module.exports = [
	body('nombre').notEmpty().withMessage('Tenés que completar este campo').bail(),
	body('apellido').notEmpty().withMessage('Tenés que completar este campo').bail(),
	body('sexo').notEmpty().withMessage('Tenés que elegir una opción').bail(),
	body('fechaNacimiento').notEmpty().withMessage('Tenés que completar este campo').bail(),
]
