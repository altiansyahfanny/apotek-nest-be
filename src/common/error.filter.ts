import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { ValidationService } from './validation.service';

@Injectable()
@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  constructor(private readonly validationService: ValidationService) {}
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        errors:
          typeof exception.getResponse() === 'string'
            ? exception.getResponse()
            : 'Something went wrong',
        data: exception.getResponse(),
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        errors: 'Validation error',
        data: exception.issues,
      });
    } else {
      response.status(500).json({
        errors: exception.message,
      });
    }
  }
}
