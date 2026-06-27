export type PatternHandler = (payload: unknown) => unknown | Promise<unknown>;
export type GrpcDispatchRequest = {
    pattern: string;
    payload: string;
};
export type GrpcDispatchResponse = {
    result: string;
    error: string;
};
export declare function handleGrpcDispatch(routes: Record<string, PatternHandler>, data: GrpcDispatchRequest): Promise<GrpcDispatchResponse>;
