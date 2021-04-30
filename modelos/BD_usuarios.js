const db = require("../bases_de_datos/modelos");
const entidad = db.usuario;
const bcryptjs = require("bcryptjs");

module.exports = {
    emailExistente: (email) => {
        return entidad.count({
			where: {email: email}
		}).then(n => n > 0);
    },
	altaMail: (emailDeUsuario) => {
		//let contrasena = Math.round(Math.random()*Math.pow(10,10))+""
		let contrasena = "1234567890"
		return entidad.create({
            email: emailDeUsuario,
            contrasena: bcryptjs.hashSync(contrasena, 10),
        });
	},
	obtener_el_usuario_a_partir_del_email: async (email) => {
        const usuario = await entidad.findOne({
            where: {email: email}
        });
        return usuario;
    },

	obtenerPorId: (id) => {
        return entidad.findByPk(id, {
            include: [ "roles" ]
        });
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