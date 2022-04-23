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
// 	let entidadesProd = ["peliculas", "colecciones", "capitulos", "prods_edicion"];
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
