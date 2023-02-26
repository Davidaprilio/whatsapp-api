import ClientError from "./ClientError";

export default class AuthorizationError extends ClientError {
    constructor(message: string) {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}
