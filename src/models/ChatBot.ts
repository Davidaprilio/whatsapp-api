import { mediaMessageSHA256B64 } from "@adiwajshing/baileys";
import { Schema, model, connect } from "mongoose";
import { randInt, randomString } from "../Main/Helper";

type ChatType = "bot" | "schedule" | "user";
type MediaType = "image" | "video" | "gif";

interface IMedia {
  url: String;
  type: MediaType;
}

interface IButtons {
  value: String;
  replyChatID?: String;
}

export interface IChatBot {
  chatId: string;
  chatName: string;
  chatType: ChatType;
  message: string;
  media?: IMedia;
  document?: IMedia;
  buttons?: IButtons[];
  nextReply?: String;
}

const mediaSchema = new Schema<IMedia>({
  url: String,
  type: {
    type: String,
    enum: ["image", "video", "gif"],
    default: "image",
  },
});

const buttonSchema = new Schema<IButtons>({
  value: {
    type: String,
    maxlength: 60,
    required: true,
  },
  // Jika diisi maka akan menjadi reply ke chat dengan id refference ini
  // (semua reply message harus dibuat menjadi chatBot baru dan di-refference ke Reply ini)
  replyChatID: {
    type: String,
    required: false,
  },
});

const chatBotSchema = new Schema<IChatBot>({
  chatId: {
    type: String,
    required: true,
    default: `${randomString(4)}-${randInt(1, 9)}`,
  },
  chatName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  media: {
    type: mediaSchema,
    required: false,
  },
  document: {
    type: String,
    required: false,
  },
  buttons: [
    {
      value: {
        type: String,
        maxlength: 60,
        required: true,
      },
      // Jika diisi maka akan menjadi reply ke chat dengan id refference ini
      // (semua reply message harus dibuat menjadi chatBot baru dan di-refference ke Reply ini)
      replyChatID: {
        type: String,
        required: false,
      },
    },
  ],
  nextReply: {
    type: String,
    required: false,
    default: null,
  },
});

const ChatBot = model<IChatBot>("ChatBot", chatBotSchema);
export default ChatBot;
