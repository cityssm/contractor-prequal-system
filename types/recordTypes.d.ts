export interface User {
    userName: string;
}
declare module "express-session" {
    interface Session {
        user: User;
    }
}
