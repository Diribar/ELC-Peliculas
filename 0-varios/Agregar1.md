DATOS DUROS
- Agregar el campo "idioma original"

CONFIRMAR --> Original según el origen:
- copiarFA
    - FA_id
    - fuente
    - creada por
    - calificaciones

TIPO PRODUCTO
- Vista: Errores
- BE-Guardar: Revisar errores

COPIAR FA: 
- Toma los datos de TIPO PRODUCTO
- Para las películas, buscar el FA_id también en "capítulos" si ya están en BD
- BE-Grabar:
   	- Antes de redireccionar a DD, se crea una cookie con los datos provistos por la API

RCLV
- Errores: revisar masc/fem en el ID de opciones_proc y opciones_rol
- Rubro "Valores":
    - Agregar link en DP
    - Agregar vista
- Cuando el nombre ya figura en la BD, "traer" todos los datos

PRODUCTO YA EN BD
Vista:
- Leyenda:
    - Creada en la fecha:
    - Creada por el usuario nombre y apellido
    - Nombre original:
    - Nombre en castellano:
    - Status de la película:
- Botones:
    - Ir a Palabra Clave
    - Ir a Detalle (a simil 'get')
