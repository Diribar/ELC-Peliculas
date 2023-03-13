"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const variables = require("../../funciones/3-Procesos/Variables");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procsProd = require("../2.1-Prod-RUD/PR-FN-Procesos");
const procsRCLV = require("../2.2-RCLVs-CRUD/RCLV-Procesos");
const procesos = require("./FM-Procesos");

// *********** Controlador ***********
module.exports = {
	crudForm: async (req, res) => {
		// Tema y Código
		const tema = "crud";
		const codigo = req.path.slice(1, -1);

		// Más variables
		const {entidad, id, origen} = req.query;
		const familia = comp.obtieneFamilia(entidad);
		const familias = comp.obtieneFamilias(entidad);
		let imgDerPers, bloqueDer, cantProds, motivos;

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
		bloqueDer =
			familias == "productos"
				? procsProd.bloqueDer(entidad, original)
				: familias == "rclvs"
				? procsRCLV.detalle.bloqueDer({...original, entidad}, cantProds)
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
			...{registro: original, imgDerPers, bloqueDer, motivos},
			cartelGenerico: true,
		});
	},
	crudGuardar: async (req, res) => {
		// Tema y Código
		const tema = "crud";
		const codigo = req.path.slice(1, -1);

		// Variables
		let {entidad, id, origen, motivo_id, comentario} = {...req.query, ...req.body};

		// 1. Revisa problemas
		const informacion = procesos.infoIncompleta({motivo_id, comentario, codigo});
		if (informacion) {
			informacion.iconos = variables.vistaEntendido(req.session.urlAnterior);
			return res.render("CMP-0Estructura", {informacion});
		}

		// 2. Actualiza el registro original
		let datos = {
			sugerido_por_id: req.session.usuario.id,
			sugerido_en: comp.ahora(),
			status_registro_id: codigo == "inactivar" ? inactivar_id : recuperar_id,
		};
		if (motivo_id) datos.motivo_id = motivo_id;
		await BD_genericas.actualizaPorId(entidad, id, datos);

		// 3. Agrega un registro en el historial de comentarios
		datos = {...datos, entidad, entidad_id: id, comentario};
		BD_genericas.agregaRegistro("historial_comentarios", datos);

		// 4. Actualiza prodsEnRCLV
		const familia = comp.obtieneFamilia(entidad);
		if (familia == "producto") {
			const producto = await BD_genericas.obtienePorId(entidad, id);
			procesos.prodEnRCLV(producto);
		}

		// 5. Regresa a la vista de detalle
		const destino = "/" + familia + "/detalle/?entidad=" + entidad + "&id=" + id;

		return res.redirect(destino);
	},
};
