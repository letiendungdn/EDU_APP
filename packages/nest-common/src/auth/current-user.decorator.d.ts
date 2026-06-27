import { Role } from "@prisma/client";
export interface AuthUserPayload {
    id: number;
    email: string;
    role: Role;
    name: string | null;
}
export interface AuthRequest {
    user?: AuthUserPayload | null;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
