import { Button, NullableString } from "./"

export type MessageButtonPayload = {
	text: string,
	footer: NullableString,
	buttons: Button[],
	headerType: number
}

export type vcard = {
    vcard: string
}


export type MessageContactPayload = {
    contacts: { 
        displayName: string, 
        contacts: vcard[] 
    }
}

export abstract class MessagePayload {
	abstract getPayload(): any
}