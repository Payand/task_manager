import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger(LoggerInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const method: string = request.method;
    const url = request.url;

    this.logger.debug(`[${method}] ${url} - Request started`);

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.debug(
            `[${method}] ${url} - Completed in ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}
