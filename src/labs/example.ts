import makeWASocket, {
  AnyMessageContent,
  delay,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  useSingleFileAuthState,
} from "@adiwajshing/baileys";
import { Boom } from "@hapi/boom";

import MAIN_LOGGER from "../Utils/pino";

const logger = MAIN_LOGGER.child({});
logger.level = "debug";
// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const CLIENT_ID = "david14";
const CLIENT_STORAGE = `./session/storage/${CLIENT_ID}.json`;
const CLIENT_AUTH = `./session/auth/${CLIENT_ID}.json`;

const store = makeInMemoryStore({ logger });
store.readFromFile(CLIENT_STORAGE);
// save every 10s
setInterval(() => {
  store.writeToFile(CLIENT_STORAGE);
}, 10_000);

const { state, saveState } = useSingleFileAuthState(CLIENT_AUTH);

async function connectToWhatsAppMultiDevice() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    logger,
    browser: [
      "david14", // Browser Host
      "Chrome", // Browser Type  Chrome|Firefox|Safari|Custom name
      "22.20", // Browser Version
    ],
    printQRInTerminal: true,
    auth: state,
  });

  store.bind(sock.ev);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const err = (lastDisconnect.error as Boom)?.output?.payload;
      console.log("==============++++++++=============");
      console.error("Error: ", err);
      console.log(lastDisconnect.error.message);
      console.log("==============++++++++=============");
      // cek apakah butuh menyambungkan ulang
      const shouldReconnect =
        (lastDisconnect.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(DisconnectReason);

      console.log(
        `[💥] Connection closed due to: "${lastDisconnect.error.message}"`
      );
      console.log(`[🔄] reconnecting`, shouldReconnect);

      // !Harus terhubung kembali true
      if (shouldReconnect) {
        if (lastDisconnect.error.message === "QR refs attempts ended") {
          return console.log("App Stop QR attempt out");
        } else {
          connectToWhatsAppMultiDevice();
        }
      }
    } else if (connection === "open") {
      console.log("opened connection");
    }
  });
  sock.ev.on("messages.upsert", (m) => {
    console.log(JSON.stringify(m, undefined, 2));

    console.log("replying to", m.messages[0].key.remoteJid);
    console.log("messages.upsert", m);

    // sock.sendMessage(m.messages[0].key.remoteJid!, { text: "Hello there!" });
  });
}
// run in main file
connectToWhatsAppMultiDevice();
