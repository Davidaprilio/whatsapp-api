"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.log = exports.randInt = exports.jidGetPhone = exports.randomString = exports.formatPhone = exports.jidToNumberPhone = exports.formatPhoneWA = void 0;
require("dotenv").config();
var baileys_1 = require("@adiwajshing/baileys");
var process_1 = require("process");
var formatPhoneWA = function (numberPhone, prefix) {
    if (prefix === void 0) { prefix = 62; }
    var type;
    if (numberPhone.endsWith("@g.us")) {
        type = "@g.us";
    }
    else {
        type = "@s.whatsapp.net";
        // type = "@c.us";
    }
    // 1. menghilangkan karakter selain angka
    var number = numberPhone.replace(/\D/g, "");
    // 2. ganti angka 0 didepan menjadi prefix
    if (number.startsWith("0")) {
        number = prefix + number.substr(1);
    }
    return (number += type);
};
exports.formatPhoneWA = formatPhoneWA;
var jidToNumberPhone = function (jid) {
    jid = jid.split("@")[0];
    jid = jid.split(":")[0];
    jid = jid.replace(/[^0-9]/g, "");
    return jid;
};
exports.jidToNumberPhone = jidToNumberPhone;
var formatPhone = function (phone, prefix) {
    if (prefix === void 0) { prefix = 62; }
    var number = phone.replace(/\D/g, "");
    if (number.startsWith("0")) {
        number = prefix + number.substr(1);
    }
    return number;
};
exports.formatPhone = formatPhone;
// Random String
var randomString = function (length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
exports.randomString = randomString;
var jidGetPhone = function (jid) {
    var _a;
    var res = (0, baileys_1.jidDecode)(jid);
    return (_a = res === null || res === void 0 ? void 0 : res.user) !== null && _a !== void 0 ? _a : false;
};
exports.jidGetPhone = jidGetPhone;
var randInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.randInt = randInt;
var log = function () {
    var _a;
    var data = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        data[_i] = arguments[_i];
    }
    if (process_1["default"].env.APP_DEBUG === "true" ||
        ((_a = process_1["default"] === null || process_1["default"] === void 0 ? void 0 : process_1["default"].env) === null || _a === void 0 ? void 0 : _a.APP_DEBUG) === undefined) {
        console.log.apply(console, __spreadArray(["debug| "], data, false));
    }
};
exports.log = log;
