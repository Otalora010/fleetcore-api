---
description: Implementa un requisito de FleetCore con el flujo analista → implementador → revisor
argument-hint: requisito o módulo [detalle opcional]
---

Implementa $ARGUMENTS de la prueba de desempeño FleetCore usando los subagentes disponibles del proyecto. Tú coordinas el flujo: no escribas código directamente. Respeta el enunciado de la prueba como fuente principal y trabaja sobre el proyecto existente.

Flujo de trabajo
Análisis

Lanza el subagente de análisis disponible en el proyecto y pásale el requisito o módulo solicitado, el detalle recibido y el enunciado de FleetCore.
Debe identificar alcance, archivos que probablemente cambien, dependencias, reglas de negocio, validaciones, permisos, pruebas y riesgos.
Si el requisito está fuera del alcance de la prueba o falta información indispensable, explícalo y detente para consultar a la persona. No inventes requisitos.
Antes de implementar, verifica la estructura y las convenciones que ya existen en el repositorio.
Aprobación

Muestra a la persona el plan completo, incluyendo archivos afectados, pasos, validaciones y pruebas.
Expón cualquier decisión pendiente como una pregunta concreta.
Espera un sí explícito antes de continuar. Si la persona pide cambios, vuelve a lanzar el análisis con esos cambios.
Implementación

Después de la aprobación, lanza el subagente implementador disponible en el proyecto y pásale el plan aprobado completo, las decisiones tomadas y el contexto relevante.
Pídele implementar solo el alcance aprobado, seguir el estilo y la arquitectura existentes, y no reemplazar ni reescribir código ajeno al requisito.
Pídele ejecutar las pruebas y comprobaciones pertinentes. No afirmar que una prueba pasó si no se ejecutó.
No hagas commits, salvo que la persona los solicite expresamente. No hagas push.
Revisión

Lanza el subagente revisor disponible en el proyecto con el plan aprobado y los cambios realizados.
Debe revisar cumplimiento del enunciado, reglas de negocio, autorización, validaciones, manejo de errores, seguridad, relaciones de TypeORM y pruebas relevantes.
Si responde CAMBIOS NECESARIOS, envía únicamente esa lista al implementador y vuelve a revisar. Haz como máximo 2 rondas de corrección.
Si siguen existiendo problemas después de 2 rondas, detente y presenta los pendientes claramente. No declares la tarea aprobada.
Cierre

Resume brevemente qué se implementó, qué archivos cambiaron, las pruebas/lint/build ejecutados y sus resultados reales, y qué queda pendiente.
Indica si se modificó memory.md, únicamente si ese archivo existe y se añadió información útil.
No hagas push y no afirmes que la prueba completa está terminada si solo se trabajó en un módulo.
Reglas de FleetCore que deben respetarse cuando correspondan
Tecnologías requeridas: NestJS, TypeScript, JWT, TypeORM y PostgreSQL.
Roles: ADMIN, TECHNICIAN y MANAGER. Las rutas deben protegerse con Guards y autorización por roles.
Contraseñas con Argon2; JWT para autenticación y x-api-key validada mediante un Guard específico para al menos un endpoint de integración. La API Key debe venir de variables de entorno.
Deben existir al menos tres decoradores personalizados relacionados con autenticación/autorización, por ejemplo @Roles(), @CurrentUser() y @Public().
Vehículos: placa única; estados AVAILABLE, IN_MAINTENANCE e INACTIVE. Un vehículo inactivo no puede recibir mantenimientos nuevos.
Mecánicos: un mecánico inactivo no puede recibir asignaciones nuevas. Un mecánico no pertenece permanentemente a un taller y no puede tener mantenimientos activos con horarios superpuestos, incluso en talleres diferentes. Un mantenimiento que termina exactamente cuando comienza otro no se considera superpuesto.
Talleres: no se puede asignar un mantenimiento a un taller inexistente o inactivo.
Mantenimientos: tipos PREVENTIVE y CORRECTIVE; estados SCHEDULED, IN_PROGRESS, COMPLETED y CANCELLED. El estado inicial es SCHEDULED.
Reglas de negocio: un vehículo no puede tener más de un mantenimiento activo; tampoco un técnico/mecánico. El kilometraje del mantenimiento no puede ser menor que el kilometraje actual del vehículo.
Al pasar a IN_PROGRESS, el vehículo pasa a IN_MAINTENANCE; al completar correctamente, vuelve a AVAILABLE. Un mantenimiento COMPLETED no puede volver a un estado anterior. Uno CANCELLED no puede pasar a IN_PROGRESS ni COMPLETED. No se puede completar sin los datos obligatorios de cierre: trabajo realizado, costo final, fecha de finalización y kilometraje final.
Las respuestas exitosas deben tener formato uniforme mediante un interceptor. Los errores deben procesarse con un Exception Filter personalizado e incluir, como mínimo, código HTTP, mensaje, ruta y fecha. Los errores de validación, autenticación, autorización, recursos inexistentes y conflictos de negocio no deben convertirse en HTTP 500.
Los seeders deben poder ejecutarse más de una vez sin duplicar registros. La prueba exige datos iniciales específicos, documentación Swagger, .env.example, README y un dump/archivo SQL.
Prioriza los requisitos obligatorios. Docker, cobertura de pruebas superior al 40 % y OAuth 2.0 son puntos extra y solo deben abordarse cuando la persona lo solicite o los requisitos obligatorios estén funcionando.
Criterios generales
No inventes endpoints, campos, roles ni reglas que contradigan el enunciado.
Antes de crear una abstracción nueva, revisa si ya existe una equivalente en el proyecto.
Evita cambios innecesarios fuera del alcance aprobado.
Respeta las convenciones existentes y usa nombres claros.
Si una instrucción del enunciado es ambigua o entra en conflicto con el código existente, explícalo y pregunta antes de tomar una decisión importante.