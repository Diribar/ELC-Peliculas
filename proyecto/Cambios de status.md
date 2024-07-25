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

3. Error Dif. Status
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
        - En ambos casos, se actualiza 'statusErrores'

4. Detalle
    - Ícono a la derecha, se fija que el status del producto esté alineado al historial
        - Si hay errores, ícono corregir status (sólo revisores)
        - Si no hay errores,
            - inactivar o recuperar, y revisores: ícono revisión
            - demás: ícono historial
    - Datos Breves:
        - Status: sólo se muestra si están alineados
        - Motivo:
            - Se muestra sólo si está inactivo
            - Se muestra el motivo

5. Historial
    - Muestra el historial
    - Para revisores y sólo si está en status inactivo
        - Ícono cambio de motivo
        - Ícono eliminar
    - Para usuarios aptoInput
        - En status aprobado: ícono inactivar
        - En status inactivo: ícono recuperar

6. Recuperar: post, toma el motivo del movimiento anterior

7. Revisión de Inactivar/Recuperar: post, toma el motivo del movimiento anterior

8. Revisión de Inactivar: post, si no tiene comentario, lo toma del movimiento anterior