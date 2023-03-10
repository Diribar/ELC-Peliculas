"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procsProd = require("../2.1-Prod-RUD/PR-FN-Procesos");
const procsRCLV = require("../2.2-RCLV-CRUD/RCLV-Procesos");
const procesos = require("./FM-Procesos");

// *********** Controlador ***********
module.exports = {
	inactivar: async (req, res) => {
		// Tema y Código
		const tema = "crud";
		const codigo = "inactivar";

		// Más variables
		const {entidad, id} = req.query;
		const familia = comp.obtieneFamiliaEnPlural(entidad);
		let imgDerPers, bloquesDerecha;

		// Obtiene el registro
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("status_registro", "creado_por", "alta_analizada_por");
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

		// Obtiene el título
		const a = entidad == "peliculas" || entidad == "coleccion" ? "a " : " ";
		const entidadNombre = comp.obtieneEntidadNombre(entidad);
		const titulo = "Inactivar un" + a + entidadNombre;

		// Datos Breves
		bloquesDerecha =
			familia == "productos"
				? procsProd.bloquesDerecha(entidad, original)
				: familia == "rclvs"
				? procsRCLV.detalle.bloqueDerecha({...original, entidad})
				: [];
		imgDerPers =
			familia == "productos"
				? procesos.obtieneAvatarProd(original).orig
				: familia == "rclvs"
				? procesos.obtieneAvatarRCLV(original).orig
				: "";

		// Ayuda para el titulo
		const ayudasTitulo = ["Por favor decinos por qué sugerís inactivar este registro."];

		// Motivos de rechazo
		const petitFamilia = comp.obtienePetitFamiliaDesdeEntidad(entidad)
		const motivosRech = altas_motivos_rech.filter(n=>n[petitFamilia])

		// Render del formulario
		// return res.send(imgDerPers)
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo},
			...{entidad, id, familia, entidadNombre},
			...{registro: original, imgDerPers, bloquesDerecha, motivosRech},
		});
	},
	recuperar: (req, res) => {
		return res.send("recuperar");
	},
};
