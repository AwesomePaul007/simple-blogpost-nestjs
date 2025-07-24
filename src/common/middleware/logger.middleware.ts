import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || 'unknown';

    this.logger.log(`
      [Incoming] => [${method}] - [${originalUrl}] - [${ip}] - [${userAgent}]
    `);

    req['startTime'] = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - req['startTime'];
      const { statusCode } = res;

      if (statusCode >= 500) {
        this.logger.log(`
          [RESPONSE] => [${method}] - [${originalUrl}] - [${statusCode}] - [${duration}ms]
        `);
      } else if (statusCode >= 400) {
        this.logger.log(`
          [RESPONSE] => [${method}] - [${originalUrl}] - [${statusCode}] - [${duration}ms]
        `);
      } else {
        this.logger.log(`
          [RESPONSE] => [${method}] - [${originalUrl}] - [${statusCode}] - [${duration}ms]
        `);
      }
    });
    next();
  }
}
