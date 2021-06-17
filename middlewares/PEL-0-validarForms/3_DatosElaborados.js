const path = require('path');
const {body} = require('express-validator');

module.exports = [
	body('sinopsis')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:15}).withMessage("El contenido debe ser más largo").bail()
		.isLength({max:500}).withMessage("El contenido debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('color')
		.notEmpty().withMessage('Tenés que elegir una opción').bail()
		,
	body('idioma_castellano')
		.notEmpty().withMessage('Tenés que elegir una opción').bail()
		,
	body('categoria')
		.notEmpty().withMessage('Tenés que elegir una opción').bail()
		,
	body('publico')
		.notEmpty().withMessage('Tenés que elegir una opción').bail()
		,
	body('fe_valores')
		.notEmpty().withMessage('Tenés que elegir una opción').bail()
		,
	body('entretiene')
		.notEmpty().withMessage('Tenés que elegir una opción').bail()
		,
    body('calidadTecnica')
		.notEmpty().withMessage('Tenés que elegir una opción').bail()
		,
	body('trailer1')
		.isURL().withMessage("Debe ser una URL válida").bail()
		,
	body('pelicula1')
		.isURL().withMessage("Debe ser una URL válida").bail()
		,
]
