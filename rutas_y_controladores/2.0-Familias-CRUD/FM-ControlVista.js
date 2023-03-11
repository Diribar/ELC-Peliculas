"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas=require("../../funciones/2-BD/Especificas");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procsProd = require("../2.1-Prod-RUD/PR-FN-Procesos");
const procsRCLV = require("../2.2-RCLV-CRUD/RCLV-Procesos");
const procesos = require("./FM-Procesos");

// *********** Controlador ***********
module.exports = {
	crudForm: async (req, res) => {
		// Tema y Código
		const tema = "crud";
		const codigo = req.path.slice(1, -1);

		// Más variables
		const {entidad, id, origen} = req.query;
		const familia = comp.obtieneFamiliaEnSingular(entidad);
		const familias = comp.obtieneFamiliaEnPlural(entidad);
		let imgDerPers, bloqueDerecha, cantProds, motivos;

		// Obtiene el registro
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("status_registro", "creado_por", "alta_analizada_por", "motivo");
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

		// Obtiene el título
		const a = entidad == "peliculas" || entidad == "coleccion" ? "a " : " ";
		const entidadNombre = comp.obtieneEntidadNombre(entidad);
		const titulo = codigo.slice(0, 1).toUpperCase() + codigo.slice(1) + " un" + a + entidadNombre;

		// Cantidad de productos asociados al RCLV
		if (familias == "rclvs") {
			let prodsDelRCLV = await procsRCLV.detalle.prodsDelRCLV(original);
			cantProds = prodsDelRCLV.length;
		}

		// Datos Breves
		bloqueDerecha =
			familias == "productos"
				? procsProd.bloqueDerecha(entidad, original)
				: familias == "rclvs"
				? procsRCLV.detalle.bloqueDerecha({...original, entidad}, cantProds)
				: [];
		imgDerPers =
			familias == "productos"
				? procesos.obtieneAvatarProd(original).orig
				: familias == "rclvs"
				? procesos.obtieneAvatarRCLV(original).orig
				: "";

		// Ayuda para el titulo
		const ayudasTitulo = ["Por favor decinos por qué sugerís " + codigo + " este registro."];

		// Motivos de rechazo
		if (codigo == "inactivar") {
			let petitFamilia = comp.obtienePetitFamiliaDesdeEntidad(entidad);
			motivos = motivos_rech_altas.filter((n) => n[petitFamilia]);
		}
		// Obtiene datos para la vista
		if (entidad == "capitulos")
			original.capitulos = await BD_especificas.obtieneCapitulos(original.coleccion_id, original.temporada);

		// Render del formulario
		// return res.send(imgDerPers)
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen},
			...{entidad, id, entidadNombre, familias, familia},
			...{registro: original, imgDerPers, bloqueDerecha, motivos},
			cartelGenerico: true,
		});
	},
	crudGuardar: async (req, res) => {
		// Tema y Código
		const tema = "crud";
		const codigo = req.path.slice(1, -1);

		return res.send({codigo, ...req.query, ...req.body});
	},
};
