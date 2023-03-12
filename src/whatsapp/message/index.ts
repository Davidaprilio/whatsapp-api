import { AnyRegularMessageContent, proto } from "@adiwajshing/baileys";
import Whatsapp from "../Whatsapp";
import MessageButton from "./button";
import MessageContact from "./contact";
// import Whatsapp from "./Whatsapp";

export type Button = proto.Message.ButtonsMessage.IButton;
export type NullableString = string | null

export default class Message {
	private client: Whatsapp;
	private msTimeTyping: number;
	private toPhones: string[];
	private replyMessageID: string|null;
	private skeletonPayloads: any[] = [];
	private payloads: AnyRegularMessageContent[] = []

	constructor(client: Whatsapp, msTimeTyping: number = 10) {
		this.client = client
		this.msTimeTyping = msTimeTyping
	}

	text(text: string): void {
		this.makePayloadObject({
			text
		})
	}

	button(text: NullableString = null, footer: NullableString = null): MessageButton {
		const btn = new MessageButton()
		if (text) btn.text(text)
		if (footer) btn.footer(footer)
		return this.next(btn)
	}

	contact(displayName: string = ''): MessageContact {
		const msgContact = new MessageContact()
		msgContact.setDisplayName(displayName)
		return this.next(msgContact)
	}

	rawPayload(payloadMessageContent: object): void {
		this.makePayloadObject(
			payloadMessageContent
		)
	}

	private makePayloadObject(object: object) {
		this.next({
			getPayload() {
				return object
			}
		})
	}

	private next(classObject: any) {
		this.skeletonPayloads.push(classObject)
		return classObject
	}

	private buildPayload() {
		this.payloads = []
		this.skeletonPayloads.forEach((payload) => {
			this.payloads.push(payload.getPayload())
		})
	}

	dumpPayload() {
		this.buildPayload()
		console.log(this.payloads);
	}

	to(jid: string) {
		this.toPhones.push(jid)
	}

	reply(messageID: string) {
		this.replyMessageID = messageID
	}

	send(jid?: string, replyMessageID?: any) {
		this.buildPayload()
		if (replyMessageID === undefined) {
			replyMessageID = this.replyMessageID ? this.replyMessageID : undefined
		}
		if (jid) {
			this.sendMessageExec(jid, replyMessageID)
		} else {
			this.toPhones.map((jid) => {
				this.sendMessageExec(jid, replyMessageID)
			})
		}
	}

	/**
	 * Execute Sending Message
	 * @param jid jid wa or phone
	 * @returns response from wa
	 */
	private sendMessageExec(jid: string, replyMessageID?: string) {
		console.log('sendTo:', jid);

		const res = this.payloads.map(async (payload) => {
			const res = await this.client.sendMessageWithTyping(
				jid, 
				payload, 
				replyMessageID, 
				this.msTimeTyping)
			console.log('RES WA', res);
			return res
		})
		return res
	}
}