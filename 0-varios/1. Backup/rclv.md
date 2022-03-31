// let rclvCreado = (array, creado_id) => {
// 	// Creado, con productos aprobados
// 	return array.length ? array.filter((n) => n.status_registro.gr_pend_aprob && n.cant_prod_aprobados) : [];
// };
// let rclvSinProds = (array, creado_id, aprobado_id) => {
// 	// Status 'activo', sin productos creados, sin productos aprobados
// 	return array.length
// 		? array.filter((n) => !n.status_registro.gr_inactivos && !n.cant_prod_creados && !n.cant_prod_aprobados)
// 		: [];
// };
// includes = ["peliculas", "colecciones", "capitulos"];
// let personajes = await BD_especificas.obtenerRCLVaRevisar(
// 	"RCLV_personajes",
// 	includes,
// 	haceUnaHora,
// 	aprobInact,
// 	userID
// );
// let hechos = await BD_especificas.obtenerRCLVaRevisar(
// 	"RCLV_hechos",
// 	includes,
// 	haceUnaHora,
// 	aprobInact,
// 	userID
// );
// let valores = await BD_especificas.obtenerRCLVaRevisar(
// 	"RCLV_valores",
// 	includes,
// 	haceUnaHora,
// 	aprobInact,
// 	userID
// );
// let RCLV = [...personajes, ...hechos, ...valores];
// // Obtener los RCLV en sus variantes a mostrar
// let RCLV_creado = rclvCreado(RCLV, status.creado_id);
// let RCLV_sinProds = rclvSinProds(RCLV, status.creado_id, status.aprobado_id);
// RCLVs = [...RCLV_creado, ...RCLV_sinProds];



// Nadie
// actualizarCantCasos_RCLV: async (datos, status_id) => {
// 	// Definir variables
// 	let entidadesRCLV = ["personajes", "hechos", "valores"];
// 	let RCLV_id = ["personaje_id", "hecho_id", "valor_id"];
// 	let entidadesProd = ["peliculas", "colecciones", "capitulos", "productos_edic"];
// 	// Rutina por cada campo RCLV
// 	for (let i = 0; i < RCLV_id.length; i++) {
// 		campo = RCLV_id[i];
// 		valor = datos[campo];
// 		if (valor) {
// 			let cant_productos = await BD_genericas.contarCasos(entidadProd, campo, valor, status_id);
// 			// Actualizar entidad de RCLV
// 			await BD_genericas.actualizarPorId("RCLV_" + entidadesRCLV[i], valor, {cant_productos});
// 		}
// 	}
// },
// Nadie
// contarProductos: async (entidadProd, campo, valor, status_id) => {
// 	let cant_productos = 0;
// 	// Rutina por cada entidad de Productos
// 	for (let entidadProd of entidadesProd) {
// 		cant_productos += await db[entidadProd].count({
// 			where: {
// 				[campo]: valor,
// 				status_registro_id: status_id,
// 			},
// 		});
// 	}
// 	return cant_productos;
// },
// Nadie
// obtenerEdicion_Revision: async function (entidad, original) {
// 	// Definir los campos include
// 	let includes = [
// 		"idioma_original",
// 		"en_castellano",
// 		"en_color",
// 		"categoria",
// 		"subcategoria",
// 		"publico_sugerido",
// 		"personaje",
// 		"hecho",
// 	];
// 	if (original.entidad == "capitulos") includes.push("coleccion");
// 	// Obtener el producto EDITADO
// 	let prodEditado = await BD_genericas.obtenerPor2CamposConInclude(
// 		entidad,
// 		"elc_entidad",
// 		original.entidad,
// 		"elc_id",
// 		original.id,
// 		includes.slice(0, -2)
// 	);
// 	// Quitarle los campos 'null'
// 	if (prodEditado) prodEditado = this.quitarLosCamposSinContenido(prodEditado);
// 	// Fin
// 	return prodEditado;
// },
// RCLV --------------------------------------------------------------
// Controlador-Revisar
// obtenerRCLVaRevisar: (entidad, includes, haceUnaHora, revisar, userID) => {
// 	// Obtener todos los registros de RCLV, excepto los que tengan status 'gr_aprobados' con 'cant_productos'
// 	return db[entidad]
// 		.findAll({
// 			where: {
// 				// Con status de 'revisar'
// 				status_registro_id: revisar,
// 				// Que no esté capturado
// 				[Op.or]: [{capturado_en: null}, {capturado_en: {[Op.lt]: haceUnaHora}}],
// 				// Que esté en condiciones de ser capturado
// 				creado_en: {[Op.lt]: haceUnaHora},
// 				// Que esté creado por otro usuario
// 				creado_por_id: {[Op.ne]: userID},
// 				// Cuyo 'id' sea mayor que 10
// 				id: {[Op.gt]: 20},
// 			},
// 			include: includes,
// 		})
// 		.then((n) => (n ? n.map((m) => m.toJSON()).map((o) => (o = {...o, entidad})) : []));
// },
