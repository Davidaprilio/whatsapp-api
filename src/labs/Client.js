"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs_1 = require("fs");
var baileys_1 = require("@adiwajshing/baileys");
var GlobalEvent_1 = require("./GlobalEvent");
var logger_1 = require("../Utils/logger");
var Helper_1 = require("./Helper");
var Client = /** @class */ (function () {
    function Client(client_id, multiDevice, browser) {
        if (multiDevice === void 0) { multiDevice = true; }
        if (browser === void 0) { browser = "Chrome"; }
        var _this = this;
        this.isStopedByUser = false;
        this.attemptQRcode = 0;
        /**
         * Starting Socket Session Client
         */
        this.startSock = function (skipStopState) {
            if (skipStopState === void 0) { skipStopState = false; }
            return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (skipStopState) {
                                this.isStopedByUser = false;
                            }
                            if (this.status == "active") {
                                console.log("Client ".concat(this.info.id, " already connected"));
                                return [2 /*return*/, "Device alredy connected"];
                            }
                            // buat sock dari client yang diberikan
                            return [4 /*yield*/, this.createSock(this.info.id)];
                        case 1:
                            // buat sock dari client yang diberikan
                            _a.sent();
                            this.store.bind(this.sock.ev);
                            // New Message
                            this.sock.ev.on("messages.upsert", function (_a) {
                                var messages = _a.messages, type = _a.type;
                                return __awaiter(_this, void 0, void 0, function () {
                                    var pushName, messageTimestamp, key, messageID, jid, phone;
                                    var _b;
                                    return __generator(this, function (_c) {
                                        if (type === "append" || type === "notify") {
                                            messages = messages[0];
                                            pushName = messages.pushName, messageTimestamp = messages.messageTimestamp, key = messages.key, messageID = key === null || key === void 0 ? void 0 : key.id, jid = key === null || key === void 0 ? void 0 : key.remoteJid;
                                            phone = (0, Helper_1.jidGetPhone)(jid);
                                            if (messages.fromMe) {
                                                // Outgoing Messages
                                                GlobalEvent_1["default"].emit("message.out", this.info.id, {
                                                    messageID: messageID,
                                                    timestamp: messageTimestamp
                                                });
                                            }
                                            else {
                                                // Incomming Messages
                                                GlobalEvent_1["default"].emit("message.in", this.info.id, {
                                                    messageID: messageID,
                                                    jid: jid,
                                                    pushName: pushName,
                                                    phone: phone,
                                                    text: (_b = messages === null || messages === void 0 ? void 0 : messages.message) === null || _b === void 0 ? void 0 : _b.conversation,
                                                    timestamp: messageTimestamp
                                                });
                                            }
                                        }
                                        else {
                                            console.log("Incoming Message unknown Type: ", type, messages);
                                        }
                                        return [2 /*return*/];
                                    });
                                });
                            });
                            this.sock.ev.on("messages.update", function (m) {
                                (0, Helper_1.log)("===============  messages.update  ================");
                                (0, Helper_1.log)(JSON.stringify(m, undefined, 2));
                            });
                            this.sock.ev.on("presence.update", function (m) { return (0, Helper_1.log)("presence:", m); });
                            // this.sock.ev.on("chats.update", (m: any) => log(m));
                            // this.sock.ev.on("contacts.update", (m: any) => log(m));
                            this.sock.ev.on("connection.update", function (update) {
                                _this.connectionUpdate(update);
                            });
                            // listen for when the auth credentials is updated
                            this.sock.ev.on("creds.update", this.saveState);
                            this.sock.ev.on("messages.reaction", function (a, b) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    (0, Helper_1.log)("Reaction");
                                    (0, Helper_1.log)(a, b);
                                    return [2 /*return*/];
                                });
                            }); });
                            // setInterval(() => {
                            //   this.store.writeToFile(this.info.store);
                            // }, 10_000);
                            return [2 /*return*/, this.sock];
                    }
                });
            });
        };
        this.sendMessageWithTyping = function (jid, msg, 
        // replayMsgId?: string,
        timeTyping) { return __awaiter(_this, void 0, void 0, function () {
            var error_1, err;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.sock.presenceSubscribe(jid)];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, (0, baileys_1.delay)(100)];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, this.sock.sendPresenceUpdate("composing", jid)];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, (0, baileys_1.delay)(timeTyping !== null && timeTyping !== void 0 ? timeTyping : 250)];
                    case 4:
                        _c.sent(); //ms
                        return [4 /*yield*/, this.sock.sendPresenceUpdate("paused", jid)];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.sock.sendMessage(jid, msg)];
                    case 7: return [2 /*return*/, _c.sent()];
                    case 8:
                        error_1 = _c.sent();
                        err = error_1 === null || error_1 === void 0 ? void 0 : error_1.output;
                        console.error("Send message", (_a = err === null || err === void 0 ? void 0 : err.payload) !== null && _a !== void 0 ? _a : err);
                        return [2 /*return*/, {
                                status: false,
                                error: true,
                                message: "failed to send message",
                                response: (_b = err === null || err === void 0 ? void 0 : err.payload) !== null && _b !== void 0 ? _b : err,
                                err: error_1.message
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        var file = multiDevice ? "".concat(client_id, ".json") : "".concat(client_id, "-legacy.json");
        var pathAuth = "./session/auth";
        var pathStorage = "./session/storage";
        this.info = {
            id: client_id,
            authPath: "".concat(pathAuth, "/").concat(file),
            storePath: "".concat(pathStorage, "/").concat(file),
            multiDevice: multiDevice,
            mode: multiDevice ? "md" : "lg",
            ppURL: null,
            pushName: null,
            phoneNumber: null,
            jid: null,
            browser: browser,
            connectedAt: null,
            status: "disconnected",
            authenticated: false,
            qrCode: null
        };
        if (!fs_1["default"].existsSync(pathAuth))
            fs_1["default"].mkdirSync(pathAuth, { recursive: true });
        if (!fs_1["default"].existsSync(pathStorage))
            fs_1["default"].mkdirSync(pathStorage, { recursive: true });
        var logging = logger_1["default"].child({});
        logging.level = "silent";
        this.logger = logging;
        this.setStatusDeviceDeactive();
        this.store = (0, baileys_1.makeInMemoryStore)({ logger: logging });
        this.store.readFromFile(this.info.storePath);
    }
    Client.prototype.stopSock = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isStopedByUser = true; // Set StopByUser true agar tidak di Reconnect oleh connectionUpdate()
                        return [4 /*yield*/, this.sock.ws.terminate()];
                    case 1:
                        _a.sent();
                        // await this.sock.ws.close();
                        this.setStatusDeviceDeactive();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Loggout Socket Session Client
     */
    Client.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // this.sock.ws.close();
                    return [4 /*yield*/, this.sock.logout()];
                    case 1:
                        // this.sock.ws.close();
                        _a.sent();
                        this.info.authenticated = false;
                        this.info.status = "disconnected";
                        this.removeSessionPath();
                        return [2 /*return*/, true];
                }
            });
        });
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
    Client.prototype.createSock = function (host, browser, browserVerison) {
        if (host === void 0) { host = "DevDav"; }
        if (browser === void 0) { browser = this.info.browser; }
        if (browserVerison === void 0) { browserVerison = "22.21"; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, version, isLatest, typeMode, _b, state, saveState, _c, state, saveState;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, (0, baileys_1.fetchLatestBaileysVersion)()];
                    case 1:
                        _a = _d.sent(), version = _a.version, isLatest = _a.isLatest;
                        typeMode = this.info.multiDevice
                            ? " Multi Device "
                            : "=== Legacy ===";
                        (0, Helper_1.log)("======================".concat(typeMode, "======================"));
                        (0, Helper_1.log)(" Using WA v".concat(version.join("."), ", isLatest: ").concat(isLatest, " cid: ").concat(host));
                        (0, Helper_1.log)("==========================================================");
                        // coba mengambil auth session
                        if (this.info.multiDevice) {
                            _b = (0, baileys_1.useSingleFileAuthState)(this.info.authPath), state = _b.state, saveState = _b.saveState;
                            this.saveState = saveState;
                            try {
                                this.sock = (0, baileys_1["default"])({
                                    version: version,
                                    logger: this.logger,
                                    browser: [host, browser, browserVerison],
                                    printQRInTerminal: true,
                                    auth: state
                                });
                            }
                            catch (error) {
                                console.log("Socket Error:", error);
                            }
                        }
                        else {
                            _c = (0, baileys_1.useSingleFileLegacyAuthState)(this.info.authPath), state = _c.state, saveState = _c.saveState;
                            this.saveState = saveState;
                            this.sock = (0, baileys_1.makeWALegacySocket)({
                                version: version,
                                logger: this.logger,
                                browser: [host, browser, browserVerison],
                                printQRInTerminal: true,
                                auth: state
                            });
                        }
                        return [2 /*return*/, this.sock];
                }
            });
        });
    };
    /**
     * Handle Connection Update
     *
     */
    Client.prototype.connectionUpdate = function (update) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var connection, lastDisconnect, qr, err, error_2, msg, _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        connection = update.connection, lastDisconnect = update.lastDisconnect, qr = update.qr;
                        // log("connection update: ", connection, lastDisconnect, update);
                        this.logger.info("connection update: ", connection, lastDisconnect, update);
                        if (!this.isStopedByUser) return [3 /*break*/, 1];
                        (0, Helper_1.log)("Device ".concat(this.info.id, " Stoped by user (Not Reconnect)"));
                        this.info.status = "stop";
                        return [3 /*break*/, 11];
                    case 1:
                        if (!(connection === "close")) return [3 /*break*/, 8];
                        this.info.status = "connecting";
                        err = (_a = lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output;
                        (0, Helper_1.log)("Connection Close:", (_b = err === null || err === void 0 ? void 0 : err.payload) !== null && _b !== void 0 ? _b : err);
                        console.log({
                            errPayload: err
                        });
                        if (!((err === null || err === void 0 ? void 0 : err.statusCode) === 410 ||
                            (err === null || err === void 0 ? void 0 : err.payload.message) === "Stream Errored")) return [3 /*break*/, 6];
                        console.log("Stream Errored", err.payload);
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.stopSock()];
                    case 3:
                        _e.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _e.sent();
                        console.log("Stoped sock", error_2);
                        return [3 /*break*/, 5];
                    case 5:
                        setTimeout(function () {
                            _this.startSock(true);
                        }, 10000);
                        return [2 /*return*/, false];
                    case 6:
                        if ((err === null || err === void 0 ? void 0 : err.statusCode) !== baileys_1.DisconnectReason.loggedOut) {
                            msg = lastDisconnect.error.message;
                            // Mode Device Mismatch (yang scan salah mode)
                            if ((err === null || err === void 0 ? void 0 : err.statusCode) === 411) {
                                this.changeDeviceMode(msg);
                                this.startSock();
                            }
                            else {
                                // Memulai Socket
                                this.startSock();
                            }
                        }
                        // Handle If Logout CODE:401
                        else if ((err === null || err === void 0 ? void 0 : err.statusCode) === baileys_1.DisconnectReason.loggedOut) {
                            (0, Helper_1.log)("Client Is Logout");
                            this.info.authenticated = false;
                            this.info.status = "disconnected";
                            this.setStatusDeviceDeactive();
                            this.removeSessionPath();
                        }
                        _e.label = 7;
                    case 7: return [3 /*break*/, 11];
                    case 8:
                        if (!(connection === "open")) return [3 /*break*/, 10];
                        (0, Helper_1.log)("Connection Open");
                        this.attemptQRcode = 0;
                        this.setStatusDeviceActive();
                        this.info.qrCode = null;
                        this.info.authenticated = true;
                        this.info.connectedAt = new Date().toDateString();
                        // Legacy
                        if (((_c = update === null || update === void 0 ? void 0 : update.legacy) === null || _c === void 0 ? void 0 : _c.phoneConnected) === true) {
                            this.info.pushName = update.legacy.user.name;
                            this.info.jid = update.legacy.user.id;
                        }
                        // Multi Device
                        else {
                            this.info.jid = this.sock.user.id;
                            this.info.pushName = this.sock.user.name;
                        }
                        _d = this.info;
                        return [4 /*yield*/, this.getProfilePicture(this.info.jid, true)];
                    case 9:
                        _d.ppURL = _e.sent();
                        this.info.phoneNumber = (0, Helper_1.jidToNumberPhone)(this.info.jid);
                        return [3 /*break*/, 11];
                    case 10:
                        if (qr !== undefined) {
                            (0, Helper_1.log)("QR Code Update");
                            if (this.attemptQRcode > 5) {
                                console.log("Stoped Device because 5x not scanning QRcode (not used)");
                                this.stopSock();
                                return [2 /*return*/, false];
                            }
                            else {
                                this.attemptQRcode++;
                            }
                            this.resetStatusClient();
                            this.info.authenticated = false;
                            this.info.qrCode = update.qr;
                            this.info.status = "scan QR";
                        }
                        // Status Tidak dikenali
                        else {
                            (0, Helper_1.log)("Open {else}", update);
                            if (connection == "connecting") {
                                this.info.status = "connecting";
                            }
                        }
                        _e.label = 11;
                    case 11:
                        // emit Event device Connection Update
                        if (this.info.status === "scan QR") {
                            GlobalEvent_1["default"].emit("device.qrcode.update", this.info.id, {
                                qrCode: update.qr,
                                mode: this.info.mode
                            });
                        }
                        // only connection update will be emit
                        else if (["open", "connecting", "close"].includes(connection)) {
                            // check current connection is equal old connection, if equal not emit
                            if (connection === this.info.status) {
                                console.log("Emit closed but it's still the same connection");
                                return [2 /*return*/, false];
                            }
                            else {
                                console.log("Emit connection.update");
                            }
                            GlobalEvent_1["default"].emit("device.connection.update", this.info.id, {
                                status: this.info.status,
                                mode: this.info.mode,
                                authenticated: this.info.authenticated,
                                info: this.info.status === "connected" ? this.info : null
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle Change Device Mode
     * msg: Pesan Error dari baileys
     */
    Client.prototype.changeDeviceMode = function (msg) {
        // jika Legacy pindah ke socket Multidevice(Beta)
        if (msg === "Require multi-device edition") {
            (0, Helper_1.log)("Pindah Socket ke MultiDevice 🏃‍♂️");
            this.info.multiDevice = true;
            this.info.mode = "md";
        }
        // jika Multidevice(Beta) pindah ke socket Legacy
        else if (msg === "Multi-device beta not joined") {
            (0, Helper_1.log)("Pindah Socket ke Legacy 🏃‍♂️");
            this.info.multiDevice = false;
            this.info.mode = "lg";
        }
        // kirim event mode diganti
        GlobalEvent_1["default"].emit("device.changeMode", this.info.id, {
            mode: this.getDeviceMode(),
            isMultidevice: this.info.multiDevice
        });
    };
    Client.prototype.getDeviceMode = function () {
        return this.info.multiDevice ? "MultiDevice" : "Legacy";
    };
    /**
     * Handle Remove Session Path
     */
    Client.prototype.removeSessionPath = function () {
        if (fs_1["default"].existsSync(this.info.authPath)) {
            fs_1["default"].rmSync(this.info.authPath, { recursive: true, force: true });
        }
        if (fs_1["default"].existsSync(this.info.storePath)) {
            fs_1["default"].rmSync(this.info.storePath, { recursive: true, force: true });
        }
    };
    Client.prototype.setStatusDeviceDeactive = function () {
        this.status = "not connected";
        this.info.status = "disconnected";
    };
    Client.prototype.setStatusDeviceActive = function () {
        this.status = "connected";
        this.info.status = "connected";
    };
    Client.prototype.resetStatusClient = function () {
        this.info.jid = null;
        this.info.status = "disconnected";
        this.info.qrCode = null;
        this.info.pushName = null;
        this.info.phoneNumber = null;
    };
    /**
     * Checking Phone Number is Registration on Whatsapp
     */
    Client.prototype.isRegistWA = function (numberPhone) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var phone, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        phone = (0, Helper_1.formatPhoneWA)(numberPhone);
                        return [4 /*yield*/, this.sock.onWhatsApp(phone)];
                    case 1:
                        res = _b.sent();
                        // check type data let res
                        if (Array.isArray(res)) {
                            res = res[0];
                        }
                        console.log(phone, res === null || res === void 0 ? void 0 : res.exists);
                        return [2 /*return*/, (_a = res === null || res === void 0 ? void 0 : res.exists) !== null && _a !== void 0 ? _a : false];
                }
            });
        });
    };
    Client.prototype.statusContact = function (jid) {
        return __awaiter(this, void 0, void 0, function () {
            var status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sock.fetchStatus(jid)];
                    case 1:
                        status = _a.sent();
                        console.log("status: " + status);
                        return [2 /*return*/, status];
                }
            });
        });
    };
    Client.prototype.getProfilePicture = function (jid, highResolution) {
        if (highResolution === void 0) { highResolution = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!highResolution) return [3 /*break*/, 2];
                        // for high res picture
                        _a = this.info;
                        return [4 /*yield*/, this.sock.profilePictureUrl(jid, "image")];
                    case 1:
                        // for high res picture
                        _a.ppURL = _c.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        // for low res picture
                        _b = this.info;
                        return [4 /*yield*/, this.sock.profilePictureUrl(jid)];
                    case 3:
                        // for low res picture
                        _b.ppURL = _c.sent();
                        _c.label = 4;
                    case 4: return [2 /*return*/, this.info.ppURL];
                }
            });
        });
    };
    return Client;
}());
exports["default"] = Client;
