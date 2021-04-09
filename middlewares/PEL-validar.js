const path = require('path');
const {body} = require('express-validator');

module.exports = [
	body('titulo_castellano')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:50}).withMessage("El nombre debe ser más corto").bail()
		.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('titulo_original')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isAlpha("es-ES").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:50}).withMessage("El nombre debe ser más corto").bail()
		,
	body('ano_estreno')
		.isNumeric().withMessage('Debe ser un número de cuatro dígitos').bail()
		.isInt({min: 1900}).withMessage('No existía el cine en esa época').bail()
		.isInt({max: 2021}).withMessage('Necesitamos un año ya ocurrido').bail()
		,
]
