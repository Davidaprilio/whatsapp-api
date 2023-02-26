import Whatsapp from '../../src/Main/Whatsapp';
import { InvariantError, NotFoundError } from '../exceptions';

export default class WhatsappSession {
    sessions: object = {};

    get(clientID: string): Whatsapp {
        const whatsapp = this.sessions[clientID] || null;
        if (whatsapp === null) {
            throw new NotFoundError('Session Device Not Found');
        }

        return whatsapp;
    }

    isExist(client_id: string): boolean {
        return ((this.sessions[client_id] || false) instanceof Whatsapp);
    }

    listClientActive(): string[] {
        return Object.keys(this.sessions);
    }

    newSession(clientID: string): Whatsapp {
        if(this.isExist(clientID)) {
            throw new InvariantError("clientID already used");
        }

        const whatsapp = new Whatsapp(clientID);
        this.setNewSession(clientID, whatsapp);
        return whatsapp;
    }

    private setNewSession(clientID: string, whatsapp: Whatsapp) {
        this.sessions[clientID] = whatsapp
    }
}