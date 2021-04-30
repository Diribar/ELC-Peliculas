const db = require("../bases_de_datos/modelos");
const entidad = db.usuario;
const bcryptjs = require("bcryptjs");

module.exports = {
    emailExistente: async (email) => {
        let cantidad = await entidad.count({
            where: {email: email}
        });
        return cantidad > 0;
    },
	altaMail: (datosDeUsuario) => {
		return entidad.create({
            email: datosDeUsuario.email,
            contrasena: bcryptjs.hashSync(datosDeUsuario.contrasena, 10),
        });
	},

	obtenerPorId: (id) => {
        return entidad.findByPk(id, {
            include: [ "roles" ]
        });
    },
    obtenerPorEmail: async (email) => {
        const usuarios = await entidad.findOne({
            where: {email: email}
        });

        return usuarios[0];
    },
    crear: (infoUsuario, fileName) => {
        return entidad.create({
            nombre: infoUsuario.nombre,
            apellido: infoUsuario.apellido,
            email: infoUsuario.email,
            contrasena: bcryptjs.hashSync(infoUsuario.contrasena, 10),
            avatar: fileName,
            rol_id: 1
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