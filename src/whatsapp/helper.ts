require("dotenv").config();
import { jidDecode } from "@adiwajshing/baileys";
import { dirname } from "path";
import process from "process";

export const convertToJID = (numberPhoneOrID: string, prefix = 62) => {
  var type: string;
  if (numberPhoneOrID.endsWith("@g.us")) {
    type = "@g.us";
  } else {
    type = "@s.whatsapp.net";
    // type = "@c.us";
  }

  // 1. menghilangkan karakter selain angka
  let number: string = numberPhoneOrID.replace(/\D/g, "");
  // 2. ganti angka 0 didepan menjadi prefix
  if (number.startsWith("0")) {
    number = prefix + number.substr(1);
  }
  return (number += type);
};

export const jidToNumberPhone = (jid: string):string|null => {
  const res = jidDecode(jid);
  return res?.user || null;
};

export const formatPhone = (phone: string, prefix = 62): string => {
  let number = phone.replace(/\D/g, "");
  if (number.startsWith("0")) {
    number = prefix + number.substr(1);
  }
  return number;
};

// Random String
export const randomString = (length: number) => {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const jidGetPhone = (jid: string) => {
  const res = jidDecode(jid);
  return res?.user ?? false;
};

export const randInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const log = (...data: any): void => {
  if (
    process.env.APP_DEBUG === "true" ||
    process?.env?.APP_DEBUG === undefined
  ) {
    console.log("debug| ", ...data);
  }
};

export const rootPath = (path: string) => {
  return dirname(path) + '|' + process.cwd();
}