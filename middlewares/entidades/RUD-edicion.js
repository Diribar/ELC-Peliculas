// - Aplica a: Prod-Edición (Form+Guardar+Eliminar)
//	1- Producto en status 'estable'
//		SI	--> NEXT
//		NO	--> Producto en estado 'creado'
// 	2- Producto en estado 'creado' o 'editado'
// 		SI	--> Creado por el usuario
// 		NO	--> Producto editado
// 	2- Creado por el usuario
// 		SI	--> Opciones:
// 			- Detalles		--> NEXT
// 			- ProdEdición	--> CREADO < 1hr
// 			- Links			--> CREADO < 1hr
// 		NO	--> REDIRECCIONA a 'El producto no está aprobado aún para su edición'
//	3- Editado por
// Requires
const BD_varias = require("../../funciones/BD/Varias");

// Exportar
module.exports = async (req, res, next) => {
	// Obtener los datos identificatorios del producto
	let entidad = req.query.entidad;
	let prodID = req.query.id;
	let userID = req.session.usuario.id;
	console.log(entidad, prodID, userID);
	// Obtener el producto original
	prodOriginal = await BD_varias.obtenerPorIdConInclude(entidad, prodID, "status_registro");
	// Obtener los status
	// let status = await BD_varias.obtenerTodos("status_registro_ent", "orden").then((n) =>
	// 	n.map((m) => m.toJSON())
	// );
	// let creado_id = status.find((n) => n.creado).id;
	// let editado_id = status.find((n) => n.editado).id;
	// Si el producto está en status 'creado' o 'editado'
	// if (prodOriginal.status_registro_id == creado_id || prodOriginal.status_registro_id == editado_id) next();
	// if (prodOriginal.status_registro.provisorio)
};
