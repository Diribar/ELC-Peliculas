"use strict";

module.exports = async (req, res, next) => {
	// Verifica y avanza
	if (entorno != "development") console.log(req.headers["user-agent"]);
	if (req.session.cliente || (req.cookies && req.cookies.cliente_id)) return next(); // si ya hay una visita previa
	if (requestsTriviales.some((n) => req.headers["user-agent"].startsWith(n))) return next(); // si es una de las aplicaciones triviales
	if (!req.headers["user-agent"]) return next(); // si no se conoce el origen
	if (req.session.bienvenido) return next();
	else req.session.bienvenido = true;

	// Prepara la información
	const informacion = {
		mensajes: [
			"¡Bienvenido/a a nuestro sitio web de Recomendación de Películas!",
			"Intentamos tener en nuestro catálogo, todas las películas que existen con valores afines a la Fe Católica.",
			"Si nos falta alguna, vos nos la podés agregar creándote un usuario.",
			"Queremos ayudarte a resolver el típico problema de:<ul><li><em>No sé qué película ver</em></li><li><em>Quiero ver una película que me deje algo bueno</em></li></ul>",
			"Acá te recomendamos películas y te derivamos a donde podés verlas.",
			"Usamos cookies para que tengas una mejor experiencia de navegación.",
		],
		iconos: [{...variables.vistaEntendido(req.session.urlActual), autofocus: true}],
		titulo: "Te damos la Bienvenida",
		check: true,
	};

	// Fin
	return res.render("CMP-0Estructura", {informacion});
};
