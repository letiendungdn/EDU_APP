declare const _default: () => {
    port: number;
    database: {
        url: string | undefined;
    };
    englishDatabase: {
        url: string;
    };
    redis: {
        url: string;
    };
    grpc: {
        contentUrl: string;
        examUrl: string;
    };
    cors: {
        origins: string[];
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    kafka: {
        brokers: string;
    };
    mongodb: {
        url: string;
    };
    stripe: {
        secretKey: string | undefined;
        webhookSecret: string | undefined;
        publishableKey: string | undefined;
    };
    aws: {
        region: string;
        accessKeyId: string | undefined;
        secretAccessKey: string | undefined;
        s3Bucket: string;
    };
};
export default _default;
