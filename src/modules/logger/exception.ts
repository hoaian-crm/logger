import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";

@Catch(HttpException)
export class GlobalException implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log('---------------', exception, host)
  }
}
