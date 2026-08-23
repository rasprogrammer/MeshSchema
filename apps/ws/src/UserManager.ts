import { WebSocket } from "ws";
interface User {
    socket: WebSocket
}

export class UserManager {
    private users: User[];
    private static instance: UserManager;

    private constructor() {
        this.users = [];
    }

    static getInstance() : UserManager {
        if (UserManager.instance) {
            return UserManager.instance;
        }

        UserManager.instance = new UserManager;
        return UserManager.instance;
    }

    addUser(ws: WebSocket) {
        this.users.push({
            socket: ws
        });

        ws.on('message', (raw) => {
            try {
                const parsedMessage = JSON.parse(raw.toString());


            } catch (error) {
                console.error('Message is not valid json format');
                console.log(raw.toString()); 
            }
        });

        ws.on('close', () => {
            this.users = this.users.filter((user) => user.socket != ws);
        });
    }

}

