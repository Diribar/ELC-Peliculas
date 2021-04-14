const {body} = require('express-validator');

module.exports = [
	body('imports')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		//Verificar si el título original está repetido
		,
	body('link')
		.notEmpty().withMessage('Tenés que completar este campo').bail()
		.isURL().withMessage("Debe ser una URL válida").bail()
		.custom((value, { req }) => {
			//Verificar si se importó información de un link inválido
			let link = req.body.link;
			if (!link.includes("filmaffinity.com/") && !link.includes("es.wikipedia.org/wiki/")) {
				throw new Error('Debe ser un link de Film Affinity o Wikipedia (en español)')
			};
			return true;
		}),
]
