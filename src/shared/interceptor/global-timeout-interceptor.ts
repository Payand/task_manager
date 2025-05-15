import {
  Injectable,
  RequestTimeoutException,
  HttpStatus,
  CallHandler,
  NestInterceptor,
} from '@nestjs/common';
import { throwError, timeout, TimeoutError, catchError } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GlobalTimeoutInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(_: any, next: CallHandler) {
    const timeoutMs =
      Number(this.configService.get('REQUEST_MAX_TIMEOUT')) || 10000;
    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err: unknown) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException({
                status: HttpStatus.REQUEST_TIMEOUT,
                message:
                  'Request timeout: the server took too long to respond.',
              }),
          );
        }
        return throwError(() =>
          err instanceof Error ? err : new Error(String(err)),
        );
      }),
    );
  }
}
