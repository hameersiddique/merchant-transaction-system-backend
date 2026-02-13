import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status =
            exception.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception.getResponse();

        let message: string[] = [];
        if (Array.isArray((exceptionResponse as any).message)) {
            message = (exceptionResponse as any).message;
        } else if ((exceptionResponse as any).message) {
            message = [(exceptionResponse as any).message];
        } else {
            message = [exception.message];
        }

        response.status(status).json({
            success: false,
            data: {
                statusCode: status,
                error: exception.name.replace('Exception', ''),
                message,
            },
        });
    }
}
