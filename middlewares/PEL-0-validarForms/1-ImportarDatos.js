const {body} = require('express-validator');

module.exports = [
	body('data_entry')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isAlphanumeric("es-ES").withMessage('Sólo se admiten letras del abecedario castellano, espacios y números').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:50}).withMessage("El nombre debe ser más corto").bail()
		,
]
