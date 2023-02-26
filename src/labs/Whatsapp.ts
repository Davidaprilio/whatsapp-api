import { Boom } from "@hapi/boom";
import fs from "fs";
import { randomUUID } from "crypto";
import PinoLog from "../logger/pino";

import makeWASocket, {
    AnyMessageContent,
    delay,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    // makeWALegacySocket,
    // useSingleFileLegacyAuthState,
    // useSingleFileAuthState,
    ConnectionState,
    Browsers,
    useMultiFileAuthState,
} from "@adiwajshing/baileys";

import { formatPhoneWA, log, jidGetPhone, jidToNumberPhone } from "./Helper";

import Gevent from "./GlobalEvent";

type ClientStatus =
    | "stoped"
    | "disconnected"
    | "connecting"
    | "scan QR"
    | "connected";

interface ClientInfo {
    id: string;
    authPath: string;
    storePath: string;
    status: ClientStatus;
    isAuth: boolean; // Cek sudah terauthentikasi apa belum
    qrCode: string | null; // hanya di-isi dengan qrcode active
    ppURL: string | null; // Profile Picture URL Whatsapp
    pushName: string | null; // name Whatsapp
    phoneNumber: string | null; // phone number Whatsapp
    jid: string | null; // id number from Whatsapp
    browser: string;
    connectedAt: string | null;
    more?: any;
}

export default class Whatsapp {
    info: ClientInfo;
    sock: any; // Socket dari makeWALegacySocket | makeWASocket

    // private queueMessage: [];
    private status: string;
    private saveState: any;
    private store: any;
    private logger: any;
    private isStopedByUser: boolean = false;
    private attemptQRcode: number = 0;

    constructor(
        client_id?: string | null,
        browser: string = "Chrome",
        storeSession: boolean = true
    ) {
        if (client_id === null || client_id === undefined) {
            client_id = "wac-" + randomUUID();
        }
        const fileSession = `${client_id}.json`;
        const pathAuth = "./session/auth";
        const pathStorage = "./session/storage";

        this.info = {
            id: client_id,
            authPath: `${pathAuth}/${fileSession}`,
            storePath: `${pathStorage}/${fileSession}`,
            ppURL: null,
            pushName: null,
            phoneNumber: null,
            jid: null,
            browser, // Chrome|Firefox|Safari|Custom name
            connectedAt: null,
            status: "disconnected",
            isAuth: false,
            qrCode: null,
        };

        // buat path untuk simpan auth session
        if (!fs.existsSync(pathAuth)) fs.mkdirSync(pathAuth, { recursive: true });
        if (!fs.existsSync(pathStorage))
            fs.mkdirSync(pathStorage, { recursive: true });

        // make Logger
        this.logger = PinoLog;

        if (storeSession) {
            // this.setStatusDeviceDeactive();
            // untuk menyimpan data socket, session, chat dll
            this.store = makeInMemoryStore({
                logger: this.logger,
            });

            // set untuk membaca file dari storePath
            this.store.readFromFile(this.info.storePath);
        }
    }

    startSock = async (skipStopState = false) => {
        if (skipStopState) {
            this.isStopedByUser = false;
        }

        if (this.status == "active") {
            console.log(`Client ${this.info.id} already connected`);
            return "Device alredy connected";
        }

        // buat sock dari client yang diberikan
        await this.createSock(this.info.id);

        this.store.bind(this.sock.ev);

        /* ---Set Event If Already Connect--- */

        // Pesan masuk
        this.sock.ev.on("messages.upsert", async ({ messages, type }: any) => {
            if (type === "append" || type === "notify") {
                messages = messages[0];
                const { pushName, messageTimestamp, key } = messages,
                    messageID = key?.id,
                    jid = key?.remoteJid;
                const phone = jidGetPhone(jid);

                if (messages.fromMe) {
                    // Outgoing Messages
                    Gevent.emit("message.out", this.info.id, {
                        messageID,
                        timestamp: messageTimestamp,
                    });
                } else {
                    // Incomming Messages
                    Gevent.emit("message.in", this.info.id, {
                        messageID,
                        jid,
                        pushName,
                        phone,
                        text: messages?.message?.conversation,
                        timestamp: messageTimestamp,
                    });
                }
            } else {
                console.log("Incoming Message unknown Type: ", type, messages);
            }
        });

        // Perubahan Pesan
        this.sock.ev.on("messages.update", (m: any) => {
            log("===============  messages.update  ================");
            log(JSON.stringify(m, undefined, 2));
        });

        // State Update Online|Offline
        this.sock.ev.on("presence.update", (m: any) => log("presence:", m));
        // this.sock.ev.on("chats.update", (m: any) => log(m));
        // this.sock.ev.on("contacts.update", (m: any) => log(m));

        this.sock.ev.on("connection.update", (update: any) => {
            this.connectionUpdate(update);
        });

        // listen for when the auth credentials is updated
        this.sock.ev.on("creds.update", this.saveState);

        this.sock.ev.on("messages.reaction", async (a: any, b: any) => {
            log("Reaction");
            log(a, b);
        });

        // setInterval(() => {
        //   this.store.writeToFile(this.info.store);
        // }, 10_000);

        return this.sock;
    };

    /**
     * Membuat Sock Client
     *
     * Perlu Mengisi this.info.multiDevice ke true
     * terlibih dahulu jika ingin menggunakan multi device
     *
     * @param host: Browser Host name
     * @param browser: Browser Type  Chrome(default)|Firefox|Safari|Custom name
     * @param browserVerison: Browser Version 22.14(default)
     * @param multiDevice: Mode Client Legacy|MultiDevice(default)
     * @returns Object
     */
    async createSock(
        host: string = "DevArl",
        browser: string = this.info.browser,
        browserVerison: string = "22.22"
    ) {
        // Cek Latest version dari Baileys
        const { version, isLatest } = await fetchLatestBaileysVersion();

        log(`====================== Whatsapp API ======================`);
        log(` Using WA v${version.join(".")}, isLatest: ${isLatest} cid: ${host}`);
        log("==========================================================");

        // memulihkan session sebelumnya jika dulu disimpan
        const { state, saveCreds } = await useMultiFileAuthState(`session/auth-state/${this.info.id}`);
        // (this.info.authPath);
        this.saveState = saveCreds;

        try {
            const conn = makeWASocket({
                version,
                logger: this.logger,
                // can use Windows, Ubuntu here too
                browser: [host, browser, browserVerison] ?? Browsers.macOS('Desktop'),
                printQRInTerminal: true,
                auth: state,
                syncFullHistory: true
            })
            this.sock = conn;
        } catch (error) {
            console.log("Socket Error:", error);
        }
        return this.sock;
    }

    /**
   * Handle Connection Update
   *
   */
    private async connectionUpdate(update: ConnectionState): Promise<void> {
        const { connection, lastDisconnect, qr } = update;
        // log("connection update: ", connection, lastDisconnect, update);
        this.logger.info("connection update: ", connection, lastDisconnect, update);
        
        // Jika status device sudah di-Stop oleh user (bukan system reconnect), 
        // maka tidak perlu di reconnect lagi biarkan mati
        if (this.isStopedByUser) {
            log(`Device ${this.info.id} Stoped by user (Not Reconnect)`);
            this.info.status = "stoped";
        }
        // Reconnect jika connection close (bukan dari user)
        else if (connection === "close") {
            this.info.status = "connecting";
            if (lastDisconnect) {
                const err = (lastDisconnect.error as Boom)?.output;

                // const shouldReconnect =
                // (lastDisconnect.error as Boom)?.output?.statusCode !==
                // DisconnectReason.loggedOut;
                // console.log(DisconnectReason);

                log("Connection Close:", err?.payload ?? err);
                console.log({
                    errPayload: err,
                });
    
                // Connection Gone (hilang/rusak)
                if (err?.statusCode === 410 || err?.payload.message === "Stream Errored") {
                    console.log("Stream Errored", err.payload);
                    try {
                        await this.stopSock();
                    } catch (error) {
                        console.log("Stoped sock", error);
                    }
                    setTimeout(() => {
                        this.startSock(true);
                    }, 10_000);
                    return;
                }
                // tapi bukan gara-gara Logout
                else if (err?.statusCode !== DisconnectReason.loggedOut) {
                    const msg = lastDisconnect.error?.message || 'No Error';
                    PinoLog.error(msg)
                    // Mode Device Mismatch (yang scan salah mode)
                    if (err?.statusCode === 411) {
                        this.startSock();
                    } else {
                        console.log('SOCKET +++++++++++++++++++++++++++++')
                        // Memulai Socket
                        this.startSock();
                    }
                }
                // Handle If Logout CODE:401
                else if (err?.statusCode === DisconnectReason.loggedOut) {
                    log("Client Is Logout");
                    this.info.isAuth = false;
                    this.info.status = "disconnected";
                    this.setStatusDeviceDeactive();
                    this.removeSessionPath();
                }
            } else {
                
            }
        }
        // Client Connected Horeee !!!
        else if (connection === "open") {
            log("Connection Open");
            this.attemptQRcode = 0;
            this.setStatusDeviceActive();
            this.info.qrCode = null;
            this.info.isAuth = true;
            this.info.connectedAt = new Date().toDateString();
            // Legacy
            if (update.legacy?.phoneConnected === true) {
                this.info.pushName = update.legacy?.user?.name || null;
                this.info.jid = update.legacy?.user?.id || null;
            }
            // Multi Device
            else {
                this.info.jid = this.sock.user.id;
                this.info.pushName = this.sock.user.name;
            }
            this.getProfilePicture(true);
            if (this.info.jid !== null) {
                this.info.phoneNumber = jidToNumberPhone(this.info.jid);
            }
            Gevent.emit('connection.connected', this.info)
        }
        // New QR Code
        else if (qr !== undefined) {
            log("QR Code Update");
            if (this.attemptQRcode > 5) {
                console.log("Stoped Device because 5x not scanning QRcode (not used)");
                this.stopSock();
                return;
            } else {
                this.attemptQRcode++;
            }
            this.resetStatusClient();
            this.info.isAuth = false;
            this.info.qrCode = update.qr || null;
            this.info.status = "scan QR";
        }
        // Status Tidak dikenali
        else {
            log("Open {else}", update);
            if (connection == "connecting") {
                this.info.status = "connecting";
            }
        }

        // emit Event device Connection Update
        if (this.info.status === "scan QR") {
            Gevent.emit("device.qrcode.update", this.info.id, {
                qrCode: update.qr,
            });
        }
        // only connection update will be emit
        else if (["open", "connecting", "close"].includes(connection)) {
            // check current connection is equal old connection, if equal not emit
            if (connection === this.info.status) {
                console.log("Emit closed but it's still the same connection");
                return;
            } else {
                console.log("Emit connection.update");
            }
            Gevent.emit("device.connection.update", this.info.id, {
                status: this.info.status,
                isAuth: this.info.isAuth,
                info: this.info.status === "connected" ? this.info : null,
            });
        }
        // log("connection update: END");
    }

    async stopSock() {
        this.isStopedByUser = true; // Set StopByUser true agar tidak di Reconnect oleh connectionUpdate()
        await this.sock.ws.terminate();
        // await this.sock.ws.close();
        this.setStatusDeviceDeactive();
    }

    /**
     * Handle Remove Session Path
     */
    private removeSessionPath() {
        if (fs.existsSync(this.info.authPath)) {
            fs.rmSync(this.info.authPath, { recursive: true, force: true });
        }
        if (fs.existsSync(this.info.storePath)) {
            fs.rmSync(this.info.storePath, { recursive: true, force: true });
        }
    }

    private setStatusDeviceDeactive() {
        this.status = "not connected";
        this.info.status = "disconnected";
    }
    private setStatusDeviceActive() {
        this.status = "connected";
        this.info.status = "connected";
    }
    private resetStatusClient(): void {
        this.info.jid = null;
        this.info.status = "disconnected";
        this.info.qrCode = null;
        this.info.pushName = null;
        this.info.phoneNumber = null;
    }

    sendMessageWithTyping = async (
        jid: string,
        msg: AnyMessageContent,
        // replayMsgId?: string,
        timeTyping?: number
    ) => {
        await this.sock.presenceSubscribe(jid);
        await delay(100);

        await this.sock.sendPresenceUpdate("composing", jid);
        await delay(timeTyping ?? 250); //ms

        await this.sock.sendPresenceUpdate("paused", jid);
        // const msgId = replayMsgId == null ? null : { quoted: replayMsgId };
        try {
            return await this.sock.sendMessage(jid, msg);
        } catch (error) {
            const err = (error as Boom)?.output;
            console.error("Send message", err?.payload ?? err);
            return {
                status: false,
                error: true,
                message: "failed to send message",
                response: err?.payload ?? err,
                err: error.message,
            };
        }
    };

    /**
     * Checking Phone Number is Registration on Whatsapp
     */
    async isRegistWA(numberPhone: string): Promise<boolean> {
        const phone = formatPhoneWA(numberPhone);
        let res = await this.sock.onWhatsApp(phone);
        // check type data let res
        if (Array.isArray(res)) {
            res = res[0];
        }
        console.log(phone, res?.exists);
        return res?.exists ?? false;
    }

    async statusContact(jid: string): Promise<string> {
        const status = await this.sock.fetchStatus(jid);
        console.log("status: " + status);
        return status;
    }

    async getProfilePicture(highResolution = false): Promise<string> {
        if (this.info.jid) {
            this.info.ppURL = await this.fetchProfilePicture(this.info.jid, highResolution);
            Gevent.emit('info.profile.photo', this.info.id, this.info.ppURL)
            return this.info.ppURL;
        }
        return '';
    }

    async fetchProfilePicture(
        jid: string,
        highResolution = false
    ): Promise<string> {
        if (highResolution) {
            // for high res picture
            return await this.sock.profilePictureUrl(jid, "image");
        } else {
            // for low res picture
            return await this.sock.profilePictureUrl(jid);
        }
    }
}
