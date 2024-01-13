import { BadGatewayException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, catchError, throwError } from "rxjs";
import { LoggerService } from "./logger.service";

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {

  constructor(private loggerService: LoggerService) { }

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(catchError(err => {
      if (Array.isArray(err)) return this.loggerService.handleErrors(err)
      return this.loggerService.handleError(err)
    }))
  }
}
