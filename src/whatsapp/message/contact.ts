import { MessagePayload } from "./messagePayload";

export type vcard = {
    vcard: string
}
export type MessageContactPayload = {
    contacts: { 
        displayName: string, 
        contacts: vcard[] 
    }
}

export default class MessageContact implements MessagePayload {
    private payload: MessageContactPayload = {
		contacts: {
            displayName: '',
            contacts: []
        }
	}

    setDisplayName(name: string) {
        this.payload.contacts.displayName = name
    }

	add(contactName: string, phone: string, organization: string = ''): this {
        // get only number from phone
        const numberPhone = phone.trim().replace(/\D/g, "")
        const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
			+ 'VERSION:3.0\n'
			+ `FN:${contactName}\n` // full name
			+ `ORG:${organization};\n` // the organization of the contact
			+ `TEL;type=CELL;type=VOICE;waid=${numberPhone}:${phone}\n` // WhatsApp ID + phone number
			+ 'END:VCARD'
		this.payload.contacts.contacts.push({ vcard })
        if (this.payload.contacts.displayName === '') {
            this.setDisplayName(contactName)
        }
        return this
	}

    getPayload() {
		return this.payload
	}
}