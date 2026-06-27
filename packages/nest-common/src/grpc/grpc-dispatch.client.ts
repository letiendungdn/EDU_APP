import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, from } from 'rxjs';
import { lastValueFrom } from 'rxjs';

type DispatchGrpcService = {
  dispatch(data: {
    pattern: string;
    payload: string;
  }): Observable<{ result: string; error: string }>;
};

/** ClientProxy-compatible wrapper for gRPC Dispatch RPC. */
export class GrpcDispatchClient implements OnModuleInit {
  private dispatchService!: DispatchGrpcService;
  private readonly serviceName: string;
  private readonly grpcClient: ClientGrpc;

  constructor(grpcClient: ClientGrpc, serviceName: string) {
    this.grpcClient = grpcClient;
    this.serviceName = serviceName;
  }

  onModuleInit() {
    this.dispatchService =
      this.grpcClient.getService<DispatchGrpcService>(this.serviceName);
  }

  send<T = unknown>(pattern: string, data: unknown): Observable<T> {
    return from(this.invoke<T>(pattern, data));
  }

  private async invoke<T>(pattern: string, data: unknown): Promise<T> {
    const response = await lastValueFrom(
      this.dispatchService.dispatch({
        pattern,
        payload: JSON.stringify(data ?? {}),
      }),
    );

    if (response.error) {
      try {
        const parsed = JSON.parse(response.error) as {
          statusCode?: number;
          message?: string;
        };
        if (parsed.statusCode) {
          throw { statusCode: parsed.statusCode, message: parsed.message };
        }
      } catch (parseError) {
        if (
          parseError &&
          typeof parseError === 'object' &&
          'statusCode' in parseError
        ) {
          throw parseError;
        }
      }
      throw { status: 'error', message: response.error };
    }

    return (response.result ? JSON.parse(response.result) : null) as T;
  }
}
