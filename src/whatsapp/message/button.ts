import { Button, MessagePayload, NullableString } from "./"

type MessageButtonPayload = {
	text: string,
	footer: NullableString,
	buttons: Button[],
	headerType: number
}

export default class MessageButton implements MessagePayload {
	private payload: MessageButtonPayload = {
		text: "",
		footer: null,
		buttons: [],
		headerType: 1
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
		this.payload.text = text
	}

	footer(text: string) {
		this.payload.footer = text
	}

	getPayload() {
		return this.payload
	}
}