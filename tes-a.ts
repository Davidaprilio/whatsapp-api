import { jidDecode } from "@adiwajshing/baileys";
import mongoose from "mongoose";
import ChatBot, { IChatBot } from "./src/models/ChatBot";

async function test() {
  await mongoose
    .connect("mongodb://localhost:27017/wa-baileys")
    .then((result) => console.log("DB ready"))
    .catch((err) => {
      console.error(err);
    });

  const data: IChatBot = {
    chatId: "klik-me-1",
    chatType: "bot",
    chatName: "Pesan Button Coba",
    media: {
      url: "https://via.placeholder.com/500",
      type: "image",
    },
    message: "Ini pesan saya ...",
    buttons: [
      {
        value: "Klik Me 1",
        replyChatID: "klik-me-1",
      },
      {
        value: "Klik Me 1",
      },
    ],
  };

  const result = await ChatBot.create(data);
  console.log(result);
}

console.log(jidDecode("6285231028718@s.whatsapp.net"));
