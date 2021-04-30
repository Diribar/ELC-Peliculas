const db = require("../database/models");
const entidad = db.Producto;

module.exports = {
    ObtenerPorId: (id) => {
        return entidad.findByPk(id, {
            include: [ "imagenes", "categoria" ]
        });
    },
    ObtenerNovedades: () => {
        return entidad.findAll({
            where: {
                novedades: true,
                borrado: false
            },
            include: [ "imagenes" ]
        });
    },
    ObtenerMasVendidos: () => {
        return entidad.findAll({
            where: {
                mas_vendido: true,
                borrado: false
            },
            include: [ "imagenes" ]
        });
    },
    ObtenerImagenes: async (id) => {
        const producto = await entidad.findByPk(id, {
            include: [ "imagenes" ]
        });

        return producto.imagenes;
    },
    Eliminar: (id, usuario) => {
        return entidad.update({
            borrado: true,
            actualizado_por: usuario
        },
        {
            where: { id: id },
        });
    },
    Crear: (infoProducto, precio, usuarioId) => {
        return entidad.create({
            nombre: infoProducto.nombre,
            descripcion: infoProducto.descripcion,
            categoria_id: infoProducto.categoria,
            marca_id: 1,
            modelo_id: 1,
            precio: precio,
            stock_disponible: 100,
            mas_vendido: false,
            novedades: true,
            creado_por: usuarioId
        });
    },
    Actualizar: (id, infoProducto, precio, usuarioId) => {
        return entidad.update({
            nombre: infoProducto.nombre,
            categoria_id: infoProducto.categoria,
            descripcion: infoProducto.descripcion,
            precio: precio,
            actualizado_por: usuarioId
        },
        {
            where: { id: id },
        });
    }
};