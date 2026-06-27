import { OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
export declare class GrpcDispatchClient implements OnModuleInit {
    private dispatchService;
    private readonly serviceName;
    private readonly grpcClient;
    constructor(grpcClient: ClientGrpc, serviceName: string);
    onModuleInit(): void;
    send<T = unknown>(pattern: string, data: unknown): Observable<T>;
    private invoke;
}
