"use strict";
// ************ Requires *************
const BD_genericas = require("../../funciones/2-BD/Genericas");
const BD_especificas = require("../../funciones/2-BD/Especificas");
const variables = require("../../funciones/3-Procesos/Variables");
const comp = require("../../funciones/3-Procesos/Compartidas");
const procsRCLV = require("../2.2-RCLVs-CRUD/RCLV-Procesos");
const procesos = require("./FM-Procesos");

// *********** Controlador ***********
module.exports = {
	crudForm: async (req, res) => {
		// Tema y Código
		const tema = "crud";
		const codigo = req.path.slice(1, -1); // códigos posibles: 'inactivar'y 'recuperar'

		// Más variables
		const {entidad, id, origen} = req.query;
		const familia = comp.obtieneFamilia(entidad);
		const familias = comp.obtieneFamilias(entidad);
		let imgDerPers, bloqueDer, cantProds, motivos, procCanoniz, RCLVnombre, prodsDelRCLV;

		// Obtiene el registro
		let include = [...comp.obtieneTodosLosCamposInclude(entidad)];
		include.push("status_registro", "creado_por", "sugerido_por", "motivo");
		if (entidad == "capitulos") include.push("coleccion");
		if (entidad == "colecciones") include.push("capitulos");
		if (familia == "rclv") include.push(...variables.entidadesProd);
		let original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);

		// Obtiene el título
		const a = entidad == "peliculas" || entidad == "colecciones" ? "a " : " ";
		const entidadNombre = comp.obtieneEntidadNombre(entidad);
		const preTitulo = codigo.slice(0, 1).toUpperCase() + codigo.slice(1);
		const titulo = preTitulo + " un" + a + entidadNombre;

		// Ayuda para el titulo
		const ayudasTitulo = ["Por favor decinos por qué sugerís " + codigo + " este registro."];

		// Cantidad de productos asociados al RCLV
		if (familias == "rclvs") {
			prodsDelRCLV = await procsRCLV.detalle.prodsDelRCLV(original);
			cantProds = prodsDelRCLV.length;
			procCanoniz = procsRCLV.detalle.procCanoniz(original);
			RCLVnombre = original.nombre;
		}

		// Datos Breves
		bloqueDer =
			familias == "productos"
				? procesos.bloqueRegistro(original)
				: familias == "rclvs"
				? {
					rclv: procsRCLV.detalle.bloqueRCLV({...original, entidad}),
					registro: procesos.bloqueRegistro({...original, entidad}, cantProds),		
				}
				: [];

		// Imagen Derecha
		imgDerPers =
			familias == "productos"
				? procesos.obtieneAvatarProd(original).orig
				: familias == "rclvs"
				? procesos.obtieneAvatarRCLV(original).orig
				: "";

		// Motivos de rechazo
		if (codigo == "inactivar") {
			let petitFamilia = comp.obtienePetitFamiliaDesdeEntidad(entidad);
			motivos = motivos_rech_altas.filter((n) => n[petitFamilia]);
		}
		// Obtiene datos para la vista
		if (entidad == "capitulos")
			original.capitulos = await BD_especificas.obtieneCapitulos(original.coleccion_id, original.temporada);

		// Render del formulario
		return res.render("CMP-0Estructura", {
			...{tema, codigo, titulo, ayudasTitulo, origen, tituloMotivo: "está Inactivo"},
			...{entidad, id, entidadNombre, familias, familia},
			...{registro: original, imgDerPers, bloqueDer, motivos, procCanoniz, RCLVnombre, prodsDelRCLV},
			cartelGenerico: true,
		});
	},
	crudGuardar: async (req, res) => {
		// Variables
		const {entidad, id, motivo_id, comentario} = {...req.query, ...req.body};
		const codigo = req.path.slice(1, -1);
		const userID = req.session.usuario.id;
		const ahora = comp.ahora();
		const include = comp.obtieneTodosLosCamposInclude(entidad);
		const original = await BD_genericas.obtienePorIdConInclude(entidad, id, include);
		const status_final_id = codigo == "inactivar" ? inactivar_id : recuperar_id;

		// Revisa errores
		const informacion = procesos.infoIncompleta({motivo_id, comentario, codigo});
		if (informacion) {
			informacion.iconos = variables.vistaEntendido(req.session.urlAnterior);
			return res.render("CMP-0Estructura", {informacion});
		}

		// CONSECUENCIAS
		// 1. Actualiza el status en el registro original
		let datos = {
			sugerido_por_id: userID,
			sugerido_en: ahora,
			status_registro_id: status_final_id,
		};
		if (codigo == "inactivar") datos.motivo_id = motivo_id;
		await BD_genericas.actualizaPorId(entidad, id, datos);

		// 2. Agrega un registro en el historial_cambios_de_status
		let datosHist = {
			...{entidad, entidad_id: id},
			...{sugerido_por_id: original.sugerido_por_id, sugerido_en: original.sugerido_en},
			...{revisado_por_id: userID, revisado_en: ahora},
			...{status_original_id: original.status_registro_id, status_final_id},
			...{aprobado: null, comentario},
		};
		datosHist.motivo_id = codigo == "inactivar" ? motivo_id : codigo == "recuperar" ? original.motivo_id : null;
		BD_genericas.agregaRegistro("historial_cambios_de_status", datosHist);

		// 3. Actualiza prodsEnRCLV
		const familia = comp.obtieneFamilia(entidad);
		if (familia == "producto") procesos.cambioDeStatus(entidad, original);

		// 4. Regresa a la vista de detalle
		const destino = "/" + familia + "/detalle/?entidad=" + entidad + "&id=" + id;

		return res.redirect(destino);
	},
};
