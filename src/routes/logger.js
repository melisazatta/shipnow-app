
import { Router } from 'express';
import logger from '../utils/logger.js';

const router = Router();

/**
 * @openapi
 * /api/loggerTest:
 *   get:
 *     summary: Probar el logger
 *     description: >
 *       Herramienta interna para validar la configuración de logging con
 *       Winston. No es una funcionalidad de negocio.
 *
 *       Genera un log de cada nivel (`debug`, `http`, `info`, `warning`,
 *       `error` y `fatal`). En la consola aparecen los niveles que permita
 *       la configuración del entorno (en desarrollo, todos; en producción,
 *       desde `info`, salvo que `LOG_LEVEL` indique otro). Además, los
 *       niveles `error` y `fatal` se guardan en `logs/errors-AAAA-MM-DD.log`.
 *     tags: [Logger]
 *     responses:
 *       200:
 *         description: Logs generados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Logs generados correctamente
 */
// dispara un log de cada nivel
router.get('/', (req, res) => {
  logger.debug('Log de nivel debug');
  logger.http('Log de nivel http');
  logger.info('Log de nivel info');
  logger.warning('Log de nivel warning');
  logger.error('Log de nivel error');
  logger.fatal('Log de nivel fatal');

  res.json({ status: 'success', message: 'Logs generados correctamente' });
});

export default router;