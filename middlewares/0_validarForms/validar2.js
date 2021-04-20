const path = require('path');
const {body} = require('express-validator');

module.exports = [
	body('titulo_original')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		//.isAlpha("es-ES").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:50}).withMessage("El nombre debe ser más corto").bail()
		//Verificar si el título original está repetido
		,
	body('titulo_castellano')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:50}).withMessage("El nombre debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('ano_estreno')
		.isNumeric().withMessage('Debe ser un número de cuatro dígitos').bail()
		.isInt({min: 1900}).withMessage('No existía el cine en esa época').bail()
		.isInt({max: 2021}).withMessage('Necesitamos un año ya ocurrido').bail()
		,
	body('duracion')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isNumeric().withMessage('Debe ser un número de cuatro dígitos').bail()
		.isInt({min: 30}).withMessage('En nuestra base de datos queremos películas más largas').bail()
		.isInt({max: 300}).withMessage('¿Estás seguro de que la película dura tanto?').bail()
		,
	body('pais_origen')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:30}).withMessage("El nombre debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('direccion')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:30}).withMessage("El nombre debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('guion')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:30}).withMessage("El nombre debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('musica')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:30}).withMessage("El nombre debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('reparto')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:500}).withMessage("El nombre debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('productora')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isLength({min:2}).withMessage("El nombre debe ser más largo").bail()
		.isLength({max:30}).withMessage("El nombre debe ser más corto").bail()
		//.matches("[a-zA-Z;., ]").withMessage('Sólo se admiten letras del abecedario castellano').bail()
		,
	body('color')
		.notEmpty().withMessage('Tenés que elegir una opción').bail()
		,
]
