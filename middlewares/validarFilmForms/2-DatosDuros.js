const path = require('path');
const {body} = require('express-validator');

module.exports = [
	body('nombre_original')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		//.isAlpha("es-ES").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:50}).withMessage("El nombre debe ser más corto").bail()
		//Verificar si el título original está repetido
		,
	body('nombre_castellano')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:50}).withMessage("El nombre debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('ano_estreno')
		.isNumeric().withMessage('Debe ser un número de cuatro dígitos').bail()
		.isInt({min: 1900}).withMessage('No existía el cine en esa época').bail()
		,
	body('duracion')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isNumeric().withMessage('Debe ser un número de cuatro dígitos').bail()
		.isInt({min: 30}).withMessage('En nuestra base de datos queremos películas más largas').bail()
		.isInt({max: 300}).withMessage('¿Estás seguro de que la película dura tanto?').bail()
		,
	body('director')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:50}).withMessage("El nombre debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('guion')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:50}).withMessage("El nombre debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('musica')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:50}).withMessage("El nombre debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('actores')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:500}).withMessage("El nombre debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('productor')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:50}).withMessage("El nombre debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
]
