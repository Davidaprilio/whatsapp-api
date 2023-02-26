import { AnyMessageContent } from "@adiwajshing/baileys";
import Whatsapp from "../Whatsapp";

type Payload = { [key: string]: any }

export default abstract class AbstarctMessage {
    private client: Whatsapp;
    private timeTyping: number;
    private toPhones: string[];
    private payload: AnyMessageContent;

    button() {
    }

    text() {
    }

    media() {
    }

    send() {
        
    }

    getPaylod(): Payload {
        return this.payload
    }
}

export {
    Payload
}