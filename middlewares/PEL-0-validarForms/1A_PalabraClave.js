const {body} = require('express-validator');

module.exports = [
	body('palabras_clave')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		//.isAlpha("es-ES").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:50}).withMessage("El nombre debe ser más corto").bail()
        //Verificar si el título original está repetido
		,
]
