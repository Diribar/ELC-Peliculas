"use strict";

module.exports = async (req, res, next) => {
	// Verifica y avanza
	if (req.session.cliente || req.session.bienvenido || (req.cookies && req.cookies.cliente_id)) return next(); // si ya hay una visita previa
	if (requestsTriviales.some((n) => req.headers["user-agent"].startsWith(n))) return next(); // si es una de las aplicaciones triviales

	// Prepara la información
	req.session.bienvenido = true;
	const informacion = {
		mensajes: [
			"¡Bienvenido/a a nuestro sitio web de Recomendación de Películas!",
			"Todas las películas con valores afines a la Fe Católica, en un sólo lugar.",
			"Si no tenemos alguna, nos la podés agregar vos creándote un usuario.",
			"Queremos ayudarte a resolver el típico problema de:<ul><li><em>No sé qué película ver</em></li><li><em>Quiero ver una película que me deje algo bueno</em></li></ul>",
			"Acá te recomendamos películas y te derivamos a donde podés verla.",
			"Usamos cookies para que tengas una mejor experiencia de usuario.",
		],
		iconos: [{...variables.vistaEntendido(req.session.urlActual), autofocus: true}],
		titulo: "Te damos la Bienvenida",
		check: true,
	};

	// Fin
	return res.render("CMP-0Estructura", {informacion});
};
