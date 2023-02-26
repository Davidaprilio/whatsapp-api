import Gevent from "../Main/GlobalEvent";
import ChatBot from "../models/ChatBot";

Gevent.on("message.in", async (cid, msg) => {
  // Limit 50 char can query to DB
  if (msg.text.length <= 50) {
    // If command message (1 word no space)
    if (msg.text.startsWith("!") && msg.text.includes(" ")) {
    }
  }
});

Gevent.on("message.out", (cid, data) => {});

Gevent.on("message.button-clicked", (cid, data) => {});

async function commandReply(message: String) {
  const msg = await ChatBot.findOne({ command: message });
}
