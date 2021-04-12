const path = require('path');
const {body} = require('express-validator');

module.exports = [
	body('titulo_original')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		//.isAlpha("es-ES").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:50}).withMessage("El nombre debe ser más corto").bail()
		,
]
