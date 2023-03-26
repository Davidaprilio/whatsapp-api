import { Button, NullableString } from "."
import { MessagePayload } from "./messagePayload"

export type MessageButtonPayload = {
	image?: {
		url: string
	},
	text?: string,
	caption?: string,
	footer?: string,
	buttons: Button[],
	headerType: number
}

export default class MessageButton implements MessagePayload {
	private payload: MessageButtonPayload = {
		text: "",
		caption: undefined,
		footer: undefined,
		buttons: [],
		headerType: 1
	}

	image(linkUrl: string) {
		this.payload.image = {
			url: linkUrl
		}
		this.payload.headerType = 4
		this.payload.caption = this.payload.text
		delete this.payload.text
		return this
	}

	add(buttonText: string, buttonId: NullableString = null): this {
		this.payload.buttons.push({
			buttonId: buttonId || (this.payload.buttons.length + 1).toString(),
			buttonText: {
				displayText: buttonText
			}, 
			type: 1,
		})
        return this
	}

	text(text: string) {
		if (this.payload.headerType === 4) {
			this.payload.caption = text
		} else {
			this.payload.text = text
		}
	}

	footer(text: string) {
		this.payload.footer = text
	}

	getPayload() {
		return this.payload
	}
}