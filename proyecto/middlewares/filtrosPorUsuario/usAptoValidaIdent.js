"use strict";

module.exports = async (req, res, next) => {
	// Variables
	const userID = req.query.id;
	const usuario = await BD_genericas.obtienePorId("usuarios", userID);
	const link = "/inactivar-captura/?entidad=usuarios&id=" + userID + "&origen=TU";
	const vistaEntendido = variables.vistaEntendido(link);
	const camposRevisar = [
		...variables.camposRevisar.usuarios,
		{titulo: "Nombre del archivo de imagen del documento", nombre: "documAvatar"},
	];
	let informacion, documAvatar;

	// Valida que todos los campos necesarios tengan valor
	for (let campo of camposRevisar)
		if (!usuario[campo.nombre]) {
			informacion = {
				mensajes: ["Al registro le falta el valor en el campo '" + campo.titulo + "'."],
				iconos: [vistaEntendido],
			};
			break;
		}

	// Valida que exista el archivo del documAvatar
	if (!informacion) {
		documAvatar = carpetaExterna + "1-Usuarios/DNI-Revisar/" + usuario.documAvatar;
		if (!comp.gestionArchivos.existe(documAvatar))
			informacion = {
				mensajes: ["No existe el archivo de imagen del documento."],
				iconos: [vistaEntendido],
			};
	}

	// Si corresponde, muestra el mensaje de error
	if (informacion) res.render("CMP-0Estructura", {informacion});
	// Fin
	else next();
};
