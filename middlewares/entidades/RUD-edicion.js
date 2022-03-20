// - Aplica a: Prod-Edición (Form+Guardar+Eliminar)
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
	// Obtener el producto original
	prodOriginal = await BD_varias.obtenerPorIdConInclude(entidad, prodID, "status_registro");
	//	1- Producto en status 'revisado'
	//		SI	--> NEXT
	//		NO	--> Producto en estado 'creado'
	if (prodOriginal.status_registro.revisado) next();
	// 	2- Producto en estado 'creado' o 'editado'
	// 		SI	--> Creado por el usuario
	// 		NO	--> Producto editado

	// Si el producto está en status 'creado' o 'editado'
	// if (prodOriginal.status_registro_id == creado_id || prodOriginal.status_registro_id == editado_id) next();
	// if (prodOriginal.status_registro.provisorio)
	next();
};
