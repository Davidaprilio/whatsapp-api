//build a template message!
import { MessagePayload } from "./messagePayload";

export type TemplateUrlButton = {
    index: Number, 
    urlButton: {
        displayText: string, 
        url: string
    }
}
export type TemplateCallButton = {
    index: Number, 
    callButton: {
        displayText: string, 
        phoneNumber: string
    }
}
export type TemplateQuickReplyButton = {
    index: Number, 
    quickReplyButton: {
        displayText: string, 
        id: string
    }
}
export type TemplateButtons = TemplateCallButton|TemplateQuickReplyButton|TemplateUrlButton
export type MessageTemplateButtonPayload = {
    text: string,
	footer?: string,
	image?: {
		url: string
	},
	templateButtons: TemplateButtons[],
}

export default class MessageTemplateButton implements MessagePayload {

    private payload: MessageTemplateButtonPayload = {
		text: "",
		image: undefined,
		footer: undefined,
		templateButtons: [],
	}

    private getIndexButton(): number {
        return this.payload.templateButtons.length + 1
    }

	image(linkUrl: string) {
		this.payload.image = {
			url: linkUrl
		}
	}

	replyButton(displayText: string, buttonId: string): this {
		this.payload.templateButtons.push({
			index: this.getIndexButton(),
			quickReplyButton: {
				displayText,
                id: buttonId
			},
		})
        return this
	}

    urlButton(displayText: string, url: string): this {
		this.payload.templateButtons.push({
			index: this.getIndexButton(),
			urlButton: {
				displayText,
                url
			},
		})
        return this
	}

    callButton(displayText: string, phoneNumber: string): this {
		this.payload.templateButtons.push({
			index: this.getIndexButton(),
			callButton: {
				displayText,
                phoneNumber
			},
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