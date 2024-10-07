"use strict";
// Variables
const router = express.Router();
const vistaMS = require("../9-Miscelaneas/MS-ControlVista");

// Middlewares
const entValidaAnt = require("../../middlewares/porRegistro/entValidaAnt");
const idValidoAnt = require("../../middlewares/porRegistro/idValidoAnt");
const entId = [entValidaAnt, idValidoAnt];

// FN Redireccionamiento
let redirecciona = (req, res) => {
	// Variables
	const rutas = [
		{ant: "/palabras-clave", act: "pc"},
		{ant: "/desambiguar", act: "ds"},
		{ant: "/datos-duros", act: "dd"},
		{ant: "/datos-adicionales", act: "da"},
		{ant: "/confirma", act: "cn"},
		{ant: "/terminaste", act: "tr"},
		{ant: "/ingreso-manual", act: "im"},
		{ant: "/ingreso-fa", act: "fa"},
	];

	// Obtiene la ruta
	const {params} = req;
	const paso = params ? params.paso : null;
	const ruta = paso ? rutas.find((n) => paso == n.ant) : null;

	// Redirecciona
	if (ruta) return res.redirect("/producto/agregar-" + ruta.act);
	else {
		// Acciones si no se reconoce la url
		const informacion = {
			mensajes: ["No tenemos esa dirección en nuestro sistema"],
			iconos: [variables.vistaAnterior(req.session.urlAnterior), variables.vistaInicio],
		};

		// Fin
		return res.render("CMP-0Estructura", {informacion});
	}
};

// Vistas
router.get("/:paso", entId, redirecciona);

// Fin
module.exports = router;
