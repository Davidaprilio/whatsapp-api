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
var baileys_1 = require("@adiwajshing/baileys");
var Helper_1 = require("./Helper");
var EmoticonReaction;
(function (EmoticonReaction) {
    EmoticonReaction["love"] = "\uD83D\uDC96";
    EmoticonReaction["lough"] = "\uD83D\uDE02";
    EmoticonReaction["pray"] = "\uD83D\uDE4F";
    EmoticonReaction["khawatir"] = "\uD83D\uDE25";
    EmoticonReaction["sip"] = "\uD83D\uDC4D";
    EmoticonReaction["mlongo"] = "\uD83D\uDE2F";
})(EmoticonReaction || (EmoticonReaction = {}));
var TypeTemplate;
(function (TypeTemplate) {
    TypeTemplate["button"] = "button";
    TypeTemplate["url"] = "url";
    TypeTemplate["phone"] = "phone";
})(TypeTemplate || (TypeTemplate = {}));
var CreateMessage = /** @class */ (function () {
    function CreateMessage(client, timeTyping) {
        this.payload = {};
        this.client = client;
        this.timeTyping = timeTyping !== null && timeTyping !== void 0 ? timeTyping : 2000; //2s
    }
    CreateMessage.prototype.send = function (phone, timeTyping, checkRegistered, replay) {
        return __awaiter(this, void 0, void 0, function () {
            var check, sent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(checkRegistered !== null && checkRegistered !== void 0 ? checkRegistered : false)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.isRegistWA(phone)];
                    case 1:
                        check = _a.sent();
                        if (!check) {
                            return [2 /*return*/, {
                                    status: false,
                                    isRegister: false,
                                    message: "Not Register"
                                }];
                        }
                        _a.label = 2;
                    case 2:
                        phone = (0, Helper_1.formatPhoneWA)(phone);
                        return [4 /*yield*/, this.client.sendMessageWithTyping(phone, this.payload, timeTyping || this.timeTyping)];
                    case 3:
                        sent = _a.sent();
                        (0, Helper_1.log)("disend.. to:", phone, sent);
                        return [2 /*return*/, sent];
                }
            });
        });
    };
    CreateMessage.prototype.print = function () {
        console.log(this.payload);
        return this.payload;
    };
    /**
     * Add Text
     */
    CreateMessage.prototype.text = function (textMessage, footer) {
        this.payload.text = textMessage;
        if (footer) {
            this.payload.footer = footer;
        }
        return this;
    };
    /**
     * Add Mention Some Member or Contact
     */
    CreateMessage.prototype.mentions = function (phones) {
        var _this = this;
        phones.forEach(function (phone) {
            _this.mention(phone);
        });
        return this;
    };
    /**
     * Add Mention Member or Contact
     */
    CreateMessage.prototype.mention = function (phone) {
        if (this.payload.mentions === undefined) {
            this.payload.mentions = [];
        }
        this.payload.mentions.push((0, Helper_1.formatPhoneWA)(phone));
        phone = (0, Helper_1.formatPhone)(phone);
        this.payload.text += "@".concat(phone);
        return this;
    };
    /**
     * add Location
     */
    CreateMessage.prototype.location = function (latitude, longtitude) {
        this.payload.location = {
            degreesLatitude: latitude,
            degreesLongitude: longtitude
        };
        return this;
    };
    /**
     * add VCard to Share Contact
     */
    CreateMessage.prototype.contact = function (contactInfo) {
        var phone = (0, Helper_1.formatPhone)(contactInfo.phone);
        var vcard = "BEGIN:VCARD\n" + // metadata of the contact card
            "VERSION:3.0\n" +
            "FN:".concat(contactInfo.name, "\n") + // full name
            "ORG:Ashoka Uni;\n" + // the organization of the contact
            "TEL;type=CELL;type=VOICE;waid=".concat(phone, ":").concat(contactInfo.phone, "\n") + // WhatsApp ID
            "END:VCARD";
        this.payload.contacts = {
            displayName: contactInfo.name,
            contacts: [{ vcard: vcard }]
        };
        return this;
    };
    /**
     * Add Button Format
     */
    CreateMessage.prototype.button = function (buttons, footer) {
        // { buttonId: "id1", buttonText: { displayText: "Button 1" }, type: 1 }
        var buttonCollect = [];
        buttons.forEach(function (button) {
            var _a;
            buttonCollect.push({
                buttonId: (_a = button.id) !== null && _a !== void 0 ? _a : "btn-" + (buttonCollect.length + 1),
                buttonText: {
                    displayText: button.text
                },
                type: 1
            });
        });
        this.payload.buttons = buttonCollect;
        this.payload.footer = footer;
        this.payload.headerType = 1;
        return this;
    };
    /**
     * Add List Format
     */
    CreateMessage.prototype.list = function (sections, buttonText, title, footer) {
        if (buttonText === void 0) { buttonText = "Menu"; }
        var sectionsCollect = [];
        sections.forEach(function (listSection) {
            sectionsCollect.push(listSection);
        });
        this.payload.footer = footer;
        this.payload.title = title;
        this.payload.buttonText = buttonText;
        this.payload.sections = sectionsCollect;
        return this;
    };
    /**
     * Add Reaction
     */
    CreateMessage.prototype.reaction = function (key, reaction) {
        this.payload.react = {
            text: "💖",
            key: key
        };
        var from = "6281358209109@s.whatsapp.net";
        var reactionMessage = {
            text: "💖",
            key: {
                remoteJid: from !== null && from !== void 0 ? from : "",
                id: key !== null && key !== void 0 ? key : "",
                participant: ""
            }
        };
        var Reactions = (0, baileys_1.generateWAMessageFromContent)(from, baileys_1.proto.Message.fromObject({
            reactionMessage: reactionMessage
        }), {
            userJid: from
        });
        return this;
    };
    CreateMessage.prototype.template = function (type, text, data) {
        if (this.payload.templateButtons === undefined) {
            this.payload.templateButtons = [];
        }
        if (type == "url") {
            this.payload.templateButtons.push({
                index: this.payload.templateButtons.length + 1,
                urlButton: {
                    displayText: text,
                    url: data
                }
            });
        }
        else if (type == "phone") {
            this.payload.templateButtons.push({
                index: this.payload.templateButtons.length + 1,
                callButton: {
                    displayText: text,
                    phoneNumber: data
                }
            });
        }
        else if (type == "button") {
            this.payload.templateButtons.push({
                index: this.payload.templateButtons.length + 1,
                quickReplyButton: {
                    displayText: text,
                    id: data
                }
            });
        }
        return this;
    };
    /**
     * ================================================================
     * Kirim Media.
     * jika caption tidak diisi akan menggunakan text dan
     * jika text juga tidak ada caption akan kosong
     * ================================================================
     */
    CreateMessage.prototype.gif = function (url, caption) {
        this.video(url, caption);
        this.payload.gifPlayback = true;
        return this;
    };
    /**
     * Kirim Media
     */
    CreateMessage.prototype.image = function (url, caption) {
        this.payload.image = { url: url };
        this.caption(caption !== null && caption !== void 0 ? caption : null);
        return this;
    };
    CreateMessage.prototype.video = function (url, caption) {
        this.payload.video = { url: url };
        this.caption(caption !== null && caption !== void 0 ? caption : null);
        this.payload.gifPlayback = false;
        return this;
    };
    CreateMessage.prototype.audio = function (url) {
        // can send mp3, mp4, & ogg
        this.payload.audio = { url: url };
        this.payload.mimetype = "audio/mp3";
        return this;
    };
    CreateMessage.prototype.caption = function (text) {
        var _a;
        this.payload.caption = (_a = text !== null && text !== void 0 ? text : this.payload.text) !== null && _a !== void 0 ? _a : "";
        delete this.payload.text;
    };
    return CreateMessage;
}());
exports["default"] = CreateMessage;
