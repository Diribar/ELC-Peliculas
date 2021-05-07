const db = require("../bases_de_datos/modelos");
const entidad = db.pelicula;

module.exports = {
///////////////////////////////////////////////////////////////////////
	obtenerPorId: (id) => {
        return entidad.findByPk(id, {
            include: [ "coleccion_pelicula" ]
        });
    },
	obtenerPorTituloOriginal: (n) => {
        return entidad.findOne({
            where: {titulo_original: n}
        });
    },
	upgradeStatus: (id, st) => {
		return entidad.update(
			{status_usuario_id: st},
			{where: { id: id }}
		);
    },
	TituloOriginalYaExistente: async (email, id) => {
		return entidad.count({
			where: {
				id: {[Op.ne]: id},
				email: email,
			}
		});
	},
	editar: (id, infoUsuario, fileName) => {
        return entidad.update({
            nombre: infoUsuario.nombre,
            apellido: infoUsuario.apellido,
            email: infoUsuario.email,
            contrasena: bcryptjs.hashSync(infoUsuario.contrasena, 10),
            avatar: fileName
        },
        {where: { id: id }});
    },
    eliminar: (id, usuario) => {
        return entidad.update({
            borrado: true,
            actualizado_por: usuario
        },
        {where: { id: id }});
    },
    obtenerAvatar: async (id) => {
        let usuario = await entidad.findByPk(id);
        return usuario.avatar;
    }
};