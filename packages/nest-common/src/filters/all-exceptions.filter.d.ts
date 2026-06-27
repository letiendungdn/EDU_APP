import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
    };
    timestamp: string;
    path: string;
}
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
}
