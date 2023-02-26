import { AnyRegularMessageContent, proto } from "@adiwajshing/baileys";
import Whatsapp from "../Whatsapp";
import MessageButton from "./button";
// import Whatsapp from "./Whatsapp";

export type Button = proto.Message.ButtonsMessage.IButton;
export type NullableString = string | null

export default class Message {
	private client: Whatsapp;
	private msTimeTyping: number;
	private toPhones: string[];
	private skeletonPayloads: any[] = [];
	private payloads: AnyRegularMessageContent[] = []

	constructor(client: Whatsapp, msTimeTyping: number = 10) {
		this.client = client
		this.msTimeTyping = msTimeTyping
	}
	
	text(text: string) {
		return this.next({
			getPayload() { return {text} }
		})
	}

	button(text: NullableString = null, footer: NullableString = null): MessageButton {
		const btn = new MessageButton()
		if (text) btn.text(text)
		if (footer) btn.footer(footer)
		return this.next(btn)
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

	send(jid?: string)  {
		this.buildPayload()
		if (jid) {
			this.sendMessageExec(jid)
		} else {
			this.toPhones.map((jid) => {
				this.sendMessageExec(jid)
			})
		}
	}

	private sendMessageExec(jid: string) {
		console.log('sendTo:', jid);
		
		const res = this.payloads.map(async (payload) => {
			const res = await this.client.sendMessageWithTyping(jid, payload, this.msTimeTyping)
			console.log('RES WA', res);
			return res
		})
		return res
	}
}

export abstract class MessagePayload {
	abstract getPayload(): any
}