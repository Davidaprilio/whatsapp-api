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
    WAMessage,
    MessageUpsertType,
    proto,
    isJidGroup,
    PresenceData
} from "@adiwajshing/baileys";

import { convertToJID, log, jidToNumberPhone } from "./helper";

import event from "./event";

type ClientStatus =
    | "stoped"
    | "disconnected"
    | "connecting"
    | "scan QR"
    | "connected";

type MessageUpsert = {
    messages: WAMessage[], 
    type: MessageUpsertType
}

type PresenceUpdate = { 
    id: string, 
    presences: { 
        [participant: string]: PresenceData
    } 
}

interface CallableFunctions {
    onStoped: Function,
    onDisconnected: Function,
    onConnecting: Function,
    onScanQR: Function,
    onConnected: Function,
    onIncomingMessage: Function,
}

interface ClientInfo {
    id: string;
    authPath: string;
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
    private connectionLostCount: number = 0; // jumlah koneksi timeout 
    private store: any;
    private logger: any;
    private silentLogging: boolean;
    private isStopedByUser: boolean = false;
    private attemptQRcode: number = 0;
    private callableFunctions: CallableFunctions = {
        onConnected: () => {},
        onDisconnected: () => {},
        onConnecting: () => {},
        onStoped: () => {},
        onScanQR: () => {},
        onIncomingMessage: () => {},
    }

    constructor(
        client_id?: string | null,
        browser: string = "Chrome",
        storeSession: boolean = true,
        silentLog: boolean = true
    ) {
        this.silentLogging = silentLog;
        if (client_id === null || client_id === undefined) {
            client_id = "wac-" + randomUUID();
        }
        const pathAuth = `.session/auth-state/${client_id}`;

        this.info = {
            id: client_id,
            authPath: pathAuth,
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

        // make Logger
        this.logger = PinoLog.child({});
        this.logger.level = this.silentLogging ? "silent" : "debug";

        if (storeSession) {
            // buat path untuk simpan auth session
            if (!fs.existsSync(pathAuth)) fs.mkdirSync(pathAuth, { recursive: true });

            // this.setStatusDeviceDeactive();
            // untuk menyimpan data socket, session, chat dll
            this.store = makeInMemoryStore({
                logger: this.logger,
            });
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
        this.sock.ev.on("messages.upsert", async ({ messages, type }: MessageUpsert) => {
            // notify => notify the user, this message was just received
            // append => append the message to the chat history, no notification required
            if (type === "append" || type === "notify") {
                messages.forEach(msg => {
                    const { pushName, messageTimestamp, key, message } = msg;
                    const { id: messageID, remoteJid: jid } = key
                    const phone = jidToNumberPhone(jid || '');
                    
                    if (key.fromMe) {
                        // Outgoing Messages
                        console.log('Outgoing Message', msg);
                        event.emit("message.out", this.info.id, {
                            messageID,
                            timestamp: messageTimestamp,
                        });
                    } else {
                        console.log('Incoming Message', msg);
                        const isGroup = isJidGroup(jid || undefined) || false;
                        this.incomingMessage(msg, isGroup, key.fromMe || false, jid || null, messageID || null)
                        // Incomming Messages
                        event.emit("message.in", this.info.id, {
                            messageID,
                            jid,
                            pushName,
                            phone,
                            text: message?.conversation,
                            timestamp: messageTimestamp,
                        });
                    }
                })
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
        this.sock.ev.on("presence.update", (presence: PresenceUpdate) => this.presenceUpdated(presence));
        // this.sock.ev.on("chats.update", (m: any) => log(m));
        // this.sock.ev.on("contacts.update", (m: any) => log(m));

        this.sock.ev.on("connection.update", (update: any) => {
            this.connectionUpdate(update);
        });

        // listen for when the auth credentials is updated
        this.sock.ev.on("creds.update", this.saveState);

        this.sock.ev.on('presence-update', (json: any) => console.log(json))

        this.sock.ev.on("messages.reaction", async (a: any, b: any) => {
            log("Reaction");
            log(a, b);
        });

        // setInterval(() => {
        //   this.store.writeToFile(this.info.store);
        // }, 10_000);

        return this.sock;
    };

    incomingMessage(message: proto.IWebMessageInfo, isGroup: boolean, isFromMe: boolean, jid: string|null, messageID: string|null) {
        this.emitCallback(
            this.callableFunctions.onIncomingMessage,
            message,
            isGroup,
            isFromMe,
            jid,
            messageID
        )        
    }

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
        log(` Using WA v${version.join(".")} | isLatest: ${isLatest} | cid: ${host}`);
        log("==========================================================");

        // memulihkan session sebelumnya jika dulu disimpan
        const { state, saveCreds } = await useMultiFileAuthState(this.info.authPath);
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
                const err = (lastDisconnect.error as Boom).output;

                log("Connection Close:", err?.payload ?? err);
                console.log({
                    errPayload: err,
                });
    
                // Connection Gone (hilang/rusak)
                if (err.statusCode === 410 || err?.payload.message === "Stream Errored") {
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
                // Handle If Logout CODE:401
                else if (err.statusCode === DisconnectReason.loggedOut) {
                    this.socketLogout()
                }
                // Request Time-out (no-internet)
                else if (err.statusCode === DisconnectReason.timedOut) {         
                    if(this.connectionLostCount > 10) {
                        log('NO INTERNET CONNECTION');
                        this.stopSock()
                    } else {
                        this.connectionLostCount++
                        this.startSock();
                    }
                }// tapi bukan gara-gara Logout
                else if (err.statusCode !== DisconnectReason.loggedOut) {
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
            } else {
                console.log('UNHANDLE CONNECTION CLOSE ===============================');
            }
        }
        // Client Connected Horeee !!!
        else if (connection === "open") {
            this.socketConnected()
        }
        // New QR Code
        else if (qr !== undefined) {
            // the current QR code
            this.socketScanQR(qr)
        }
        // Status Tidak dikenali
        else {
            log("Open {else} - Status Tidak dikenali", update);
            if (connection == "connecting") {
                this.info.status = "connecting";
            }
        }

        // only connection update will be emit
        if (["open", "connecting", "close"].includes(connection)) {
            // check current connection is equal old connection, if equal not emit
            if (connection === this.info.status) {
                console.log("Emit closed but it's still the same connection");
                return;
            } else {
                console.log("Emit connection.update");
            }
            if (connection === 'connecting') {
                this.socketConnecting()
            }
            event.emit("device.connection.update", this.info.id, {
                status: this.info.status,
                isAuth: this.info.isAuth,
                info: this.info.status === "connected" ? this.info : null,
            });
        }
        // log("connection update: END");
    }



    // Event Handler
    private socketConnected() {
        log("Connection Open");
        this.attemptQRcode = 0;
        this.setStatusDeviceActive();
        this.info.qrCode = null;
        this.info.isAuth = true;
        this.info.connectedAt = new Date().toDateString();

        this.info.jid = this.sock.user.id;
        this.info.pushName = this.sock.user.name;

        this.getProfilePicture(true);
        if (this.info.jid !== null) {
            this.info.phoneNumber = jidToNumberPhone(this.info.jid);
        }

        event.emit('connection.connected', this.info)

        const infoSocket = this.getInfoSocket()

        this.emitCallback(this.callableFunctions.onConnected, infoSocket)
    }

    private socketScanQR(codeQR: string) {
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
        this.info.qrCode = codeQR;
        this.info.status = "scan QR";
        const data = {
            qrCode: codeQR,
        }
        event.emit("device.qrcode.update", this.info.id, data);
        this.emitCallback(this.callableFunctions.onScanQR, data)
    }

    private socketConnecting() {
        const reasonInfo = {
            reason: 'soket rusak'
        }

        event.emit('connection.connecting', reasonInfo)
    }

    private socketLogout() {
        log("Client Is Logout");
        this.info.isAuth = false;
        this.info.status = "disconnected";
        this.setStatusDeviceDeactive();
        this.removeSessionPath();
        const reasonInfo = {
            reason: 'Logout',
        }
        event.emit('connection.disconnected', reasonInfo)
        this.emitCallback(this.callableFunctions.onDisconnected, reasonInfo)
    }

    private presenceUpdated(presence: PresenceUpdate) {
        event.emit('presence.update', presence)
    }
    // END: Event Handler


    /**
     * Only stop socket connection (safe socket credential)
     */
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

    // emiter callable function
    private emitCallback(callback: Function, ...data: any) {
        return new Promise((resolve, reject) => {
            try {
                callback(...data)
                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }

    // Register Callable Event Function
    onConnected(callback: Function) {
        this.callableFunctions.onConnected = callback
    }
    onConnecting(callback: Function) {
        this.callableFunctions.onConnecting = callback
    }
    onDisconnected(callback: Function) {
        this.callableFunctions.onDisconnected = callback
    }
    onIncomingMessage(callback: Function) {
        this.callableFunctions.onIncomingMessage = callback
    }
    // END: Register Callable Event Function

    // dummy
    private getInfoSocket() {
        const infoSocket: object = {
            name: 'david',
            phone: '629361836372',
        }
        return infoSocket
    }

    sendMessageWithTyping = async (
        jid: string,
        msg: AnyMessageContent,
        replayMsgId?: string,
        msTimeTyping?: number
    ) => {
        await this.sock.presenceSubscribe(jid);
        await delay(100);

        await this.sock.sendPresenceUpdate("composing", jid);
        await delay(msTimeTyping ?? 250); //ms

        await this.sock.sendPresenceUpdate("paused", jid);
        const quotedMsg = replayMsgId ? { quoted: replayMsgId } : replayMsgId;
        try {
            console.log(quotedMsg);
            return await this.sock.sendMessage(jid, msg, quotedMsg);
        } catch (error) {
            const err = (error as Boom)?.output;
            console.error("Send message", error, err?.payload ?? err);
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
        const phone = convertToJID(numberPhone);
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

    /**
    | =====================================================
    | Action from Whatsapp Socket
    | =====================================================
    |
    */
    async deleteMessage(jid: string, keyMessage: string) {
        await this.sock.sendMessage(jid, { delete: keyMessage })
    }

    // Block user
    async blockUser(jid: string) {
        await this.sock.updateBlockStatus(jid, "block")
    }
    // Unblock user
    async unblockUser(jid: string) {
        await this.sock.updateBlockStatus(jid, "unblock")
    }

    async getBusinessProfile(jid: string) {
        const profile = await this.sock.getBusinessProfile(jid)
        return profile
    }

    // Untuk mendapatkan kehadiran seseorang (jika mereka sedang mengetik atau online)
    async presenceSubscribe(jid: string) {
        await this.sock.presenceSubscribe(jid)
    }

    // To change your display picture or a group's
    async changeProfilePicture(jid: string, imageUrl: string) {
        await this.sock.updateProfilePicture(jid, { 
            url: imageUrl
        })
    }

    // To get the display picture of some person/group
    async getProfilePicture(highResolution = false): Promise<string|null> {
        if (this.info.jid) {
            this.info.ppURL = await this.fetchProfilePicture(this.info.jid, highResolution);
            event.emit('info.profile.photo', this.info.id, this.info.ppURL)
            return this.info.ppURL;
        }
        return null;
    }

    // To change your profile name
    async changeProfileName(name: string) {
        const result = await this.sock.updateProfileName(name)
        console.log('changeProfileName=>', result);
        return result
    }

    async getStatusSomePerson(jid: string) {
        const status = await this.sock.fetchStatus(jid)
        return status
    }

    /**
    | =====================================================
    | For WA Groups Actions
    | =====================================================
    | 
    */
    // Create a group
    async createGroup(title: string, participants: string[]) {
        const group = await this.sock.groupCreate(title, participants)
        // group.gid
        // group.id
        return group
    }

    // To add/remove people to a group or demote/promote people
    async addParticipantToGroup(idGroup: string, jidParticipants: string[]) {
        // id & people to add to the group (will throw error if it fails)
        const response = await this.sock.groupParticipantsUpdate(
            idGroup, 
            jidParticipants,
            "add" // replace this parameter with "remove", "demote" or "promote"
        )
        return response
    }

    // To change the group's subject
    async changeGroupSubject(idGroup: string, textSubject: string) {
        return await this.sock.groupUpdateSubject(idGroup, textSubject)
    }
    //To change the group's description
    async changeGroupDescription(idGroup: string, textDescription: string) {
        return await this.sock.groupUpdateDescription(idGroup, textDescription)
    }
    // To change group settings
    async groupSettingUpdate(idGroup: string, settingOption: GroupSettingOption) {
        await this.sock.groupSettingUpdate(idGroup, settingOption)
    }
    // leave from group
    async groupLeave(idGroup: string) {
        return await this.sock.groupLeave(idGroup) // (will throw error if it fails)
    }
}

enum GroupSettingOption {
    // only allow admins to send messages
    ANNOUNCEMENT = 'announcement',
    // allow everyone to send messages
    NON_ANNOUNCEMENT = 'not_announcement',
    // allow everyone to modify the group's settings -- like display picture etc.
    UNLOCKED = 'unlocked',
    // only allow admins to modify the group's settings
    LOCKED = 'locked',
}
