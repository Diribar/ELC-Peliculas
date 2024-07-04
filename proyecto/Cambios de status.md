Eliminar campo 'motivo_id' del prodRclv
Eliminar campo 'DM' del statusHistorial

1. Detectar errores
- Cruce de historial con prodRclv:
    - Debe coincidir el status entre el último registro del historial y el prodRclv. Si no coincide, se lo agrega como error DS
    - Si coincide y es 'inactivar', se lo agrega como IN
    - Si coincide y es 'recuperar', se lo agrega como RC
- Cruce de prodRclv con historial:
    - Si está en un status > aprobado_id y no existe en el historial, se lo agrega como error DS

2. Cambio de motivo
    - Sólo se permite para prodRclv 'inactivos' y sin error de status
    - Dos columnas:
        - Izquierda: actual del historial
        - Derecha: select con los motivos posibles
    - Post: se actualiza en el prodRclv y en el último registro de 'statusHistorial'
        - motivo
        - usuario
        - fecha
        - si corresponde, el comentario

3. Error DS
    - HTML:
        - Columna 1: Status del registro
        - Columna 2: Historial
            - Se muestra el motivo
            - Si existe un comentario, se muestra
            - Oculta el motivo si se repite con el anterior
            - Oculta el comentario, si se repite con el anterior
            - Ícono cambio de motivo
        - Columna 3: oculta (comentario)
    - Post:
        - Si se aprueba el del producto:
            - Elimina el historial
            - Si está en status mayor a aprobado,
                - Redirecciona a la vista 'inactivar' para que se cree el registro 'statusHistorial'
                - Luego, quedará en manos del usuario seguir avanzando
        - Si se aprueba el del historial, actualiza el status del producto
        - En ambos casos, se actualiza la tabla de 'statusErrores'

Detalle
- Ícono a la derecha:
    - Se fija que el status del producto esté alineado a 'statusErrores'
        - Inactivar/Recuperar: en ese campo de 'statusErrores'
        - else, no en statusErrores
    - Luego,
        - Si hay errores, ícono error (sólo revisores)
        - else,
            - inactivar o recuperar, ícono revisión (sólo revisores)
            - else, ícono historial
- Datos Breves:
    - Status: el del historial
    - Motivo:
        - sólo si está inactivo, el del historial
        - Se muestra el motivo, salvo para duplicado y otro, en los que se muestra el comentario

Recuperar
- Post: toma el motivo del movimiento anterior

Revisión de Inactivar
- Form: toma el comentario del movimiento anterior
- Post: toma el motivo del movimiento anterior

Revisión de Recuperar
- Post: toma el motivo del movimiento anterior
