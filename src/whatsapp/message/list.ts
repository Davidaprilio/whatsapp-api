// build a list message!
export type ItemSection = {
    title: string, 
    rowId: string, 
    description?: string
}
export type ListSection = {
    title: string,
    rows: ItemSection[] 
}
export type MessageListPayload = {
  text: string,
  footer: NullableString,
  title: NullableString,
  buttonText: string,
  sections: ListSection[]
}

import { NullableString } from ".";
//build a template message!
import { MessagePayload } from "./messagePayload";


export default class MessageList implements MessagePayload {

    private payload: MessageListPayload = {
		text: "",
		footer: null,
		title: null,
		buttonText: 'Menu',
        sections: []
	}
    private optionSections: OptionSection[] = [];

    addSection(title: string): OptionSection {
        const options = new OptionSection(title)
        this.optionSections.push(options)
        return options
	}

    section(title: string, callableOptions: Function) {
        const options = this.addSection(title)
        callableOptions(options)
	}

	text(text: string) {
		this.payload.text = text
	}

	footer(text: string) {
		this.payload.footer = text
	}

	title(text: string) {
		this.payload.title = text
	}

    getPayload() {
        this.payload.sections = this.optionSections.map(options => options.getList())
		return this.payload
	}
}

export class OptionSection {
    private list: ListSection = {
        title: '',
        rows: []
    }

    constructor(title: string) {
        this.list.title = title
    }

    addOption(id: string, title: string, description?: string): OptionSection {
        this.list.rows.push({
            title,
            rowId: id,
            description
        })
        return this
    }

    option(id: string, title: string, description?: string) {
        this.addOption(id, title, description)
    }

    getList() {
        return this.list
    }
}