import MessageOptions, {
  generateWAMessageFromContent,
  MessageType,
  proto,
} from "@adiwajshing/baileys";
import fs from "fs";
import Client from "./Client";
import { formatPhone, formatPhoneWA, log } from "./Helper";
import Whatsapp from "./Whatsapp";

interface IVCard {
  name: string;
  phone: string;
}

interface IButton {
  id?: string;
  text: string;
}

interface IListRow {
  title: string;
  rowId?: string;
  description?: string;
}

interface IList {
  title: string;
  rows: IListRow[];
}

enum EmoticonReaction {
  love = "💖",
  lough = "😂",
  pray = "🙏",
  khawatir = "😥",
  sip = "👍",
  mlongo = "😯",
}

enum TypeTemplate {
  button = "button",
  url = "url",
  phone = "phone",
}
type TemplateType = keyof typeof TypeTemplate;

export default class CreateMessage {
  private client: any;
  private timeTyping: number;
  private phone: string;
  private payload: { [k: string]: any } = {};

  constructor(client: Client|Whatsapp, timeTyping?: number) {
    this.client = client;
    this.timeTyping = timeTyping ?? 2000; //2s
  }

  async send(
    phone: string,
    timeTyping?: number,
    checkRegistered?: boolean,
    replay?: string
  ): Promise<any> {
    if (checkRegistered ?? false) {
      const check = await this.client.isRegistWA(phone);
      if (!check) {
        return {
          status: false,
          isRegister: false,
          message: "Not Register",
        };
      }
    }
    phone = formatPhoneWA(phone);
    const sent = await this.client.sendMessageWithTyping(phone, this.payload, timeTyping || this.timeTyping);
    log("disend.. to:", phone, sent);
    return sent;
  }

  print() {
    console.log(this.payload);
    return this.payload;
  }

  /**
   * Add Text
   */
  text(textMessage: string, footer?: string): this {
    this.payload.text = textMessage;
    if (footer) {
      this.payload.footer = footer;
    }
    return this;
  }

  /**
   * Add Mention Some Member or Contact
   */
  mentions(phones: string[]): this {
    phones.forEach((phone) => {
      this.mention(phone);
    });
    return this;
  }

  /**
   * Add Mention Member or Contact
   */
  mention(phone: string): this {
    if (this.payload.mentions === undefined) {
      this.payload.mentions = [];
    }
    this.payload.mentions.push(formatPhoneWA(phone));
    phone = formatPhone(phone);
    this.payload.text += `@${phone}`;
    return this;
  }

  /**
   * add Location
   */
  location(latitude: number, longtitude: number): this {
    this.payload.location = {
      degreesLatitude: latitude,
      degreesLongitude: longtitude,
    };
    return this;
  }

  /**
   * add VCard to Share Contact
   */
  contact(contactInfo: IVCard): this {
    const phone = formatPhone(contactInfo.phone);
    const vcard =
      "BEGIN:VCARD\n" + // metadata of the contact card
      "VERSION:3.0\n" +
      `FN:${contactInfo.name}\n` + // full name
      "ORG:Ashoka Uni;\n" + // the organization of the contact
      `TEL;type=CELL;type=VOICE;waid=${phone}:${contactInfo.phone}\n` + // WhatsApp ID
      "END:VCARD";

    this.payload.contacts = {
      displayName: contactInfo.name,
      contacts: [{ vcard }],
    };
    return this;
  }

  /**
   * Add Button Format
   */
  button(buttons: IButton[], footer?: string): this {
    // { buttonId: "id1", buttonText: { displayText: "Button 1" }, type: 1 }
    const buttonCollect = [];
    buttons.forEach((button) => {
      buttonCollect.push({
        buttonId: button.id ?? "btn-" + (buttonCollect.length + 1),
        buttonText: {
          displayText: button.text,
        },
        type: 1,
      });
    });

    this.payload.buttons = buttonCollect;
    this.payload.footer = footer;
    this.payload.headerType = 1;
    return this;
  }

  /**
   * Add List Format
   */
  list(
    sections: IList[],
    buttonText: string = "Menu",
    title?: string,
    footer?: string
  ): this {
    const sectionsCollect: IList[] = [];
    sections.forEach((listSection) => {
      sectionsCollect.push(listSection);
    });

    this.payload.footer = footer;
    this.payload.title = title;
    this.payload.buttonText = buttonText;
    this.payload.sections = sectionsCollect;

    return this;
  }

  /**
   * Add Reaction
   */
  reaction(key: string, reaction?: string): this {
    this.payload.react = {
      text: "💖",
      key,
    };
    const from = "6281358209109@s.whatsapp.net";
    const reactionMessage = {
      text: "💖",
      key: {
        remoteJid: from ?? "",
        id: key ?? "",
        participant: "",
      },
    };
    const Reactions = generateWAMessageFromContent(
      from,
      proto.Message.fromObject({
        reactionMessage,
      }),
      {
        userJid: from,
      }
    );
    return this;
  }

  template(type: TemplateType, text: string, data: string): this {
    if (this.payload.templateButtons === undefined) {
      this.payload.templateButtons = [];
    }

    if (type == "url") {
      this.payload.templateButtons.push({
        index: this.payload.templateButtons.length + 1,
        urlButton: {
          displayText: text,
          url: data,
        },
      });
    } else if (type == "phone") {
      this.payload.templateButtons.push({
        index: this.payload.templateButtons.length + 1,
        callButton: {
          displayText: text,
          phoneNumber: data,
        },
      });
    } else if (type == "button") {
      this.payload.templateButtons.push({
        index: this.payload.templateButtons.length + 1,
        quickReplyButton: {
          displayText: text,
          id: data,
        },
      });
    }
    return this;
  }

  /**
   * ================================================================
   * Kirim Media.
   * jika caption tidak diisi akan menggunakan text dan
   * jika text juga tidak ada caption akan kosong
   * ================================================================
   */
  gif(url: string, caption?: string): this {
    this.video(url, caption);
    this.payload.gifPlayback = true;
    return this;
  }

  /**
   * Kirim Media
   */
  image(url: string, caption?: string): this {
    this.payload.image = { url };
    this.caption(caption ?? null);
    return this;
  }

  video(url: string, caption?: string): this {
    this.payload.video = { url };
    this.caption(caption ?? null);
    this.payload.gifPlayback = false;
    return this;
  }

  audio(url: string): this {
    // can send mp3, mp4, & ogg
    this.payload.audio = { url };
    this.payload.mimetype = "audio/mp3";
    return this;
  }

  private caption(text: string): void {
    this.payload.caption = text ?? this.payload.text ?? "";
    delete this.payload.text;
  }
}
