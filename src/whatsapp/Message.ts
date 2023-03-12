import { proto } from "@adiwajshing/baileys";
import { convertToJID } from "./helper";
import Message from "./message/index"
import Whatsapp from "./Whatsapp";

const wa: Whatsapp = new Whatsapp('david-14A');

const msg = new Message(wa);

(async () => {
    console.log('Starting Socket');
    await wa.startSock()
    console.log('Socket Started');

    wa.onConnected((info: any) => {
        console.log('WES KONEK =======================', info);

        setTimeout(async () => {
			const jid = convertToJID('085231028718')
			const isRegister = await wa.isRegistWA(jid);
			console.log('isRegister', isRegister);
			if (isRegister) {
				// msg.button('balbala', 'bakbaka')
				// 	.add('Button 1')
				// 	.add('Button 2')
				// 	.add('Button 3');

				msg.text('WA Tersambung')

                // msg.contact('david')
                //     .add('David Aprilio', '085231028718', 'MSD')
                //     .add('Alwi Bayu P', '026156281222', 'STAN (Kediri)')
	
				msg.send(jid)

                setTimeout(() => {
                    process.exit(1)
                }, 60_000);
			}
        }, 5_000);
    })
    
    wa.onDisconnected((reasonInfo: object) => {
        console.log('Koneksi Terputus', reasonInfo);
    })

    wa.onConnecting(() => {
        console.log('Menyambungkan Ulang');
    })

    wa.onIncomingMessage((message: proto.IWebMessageInfo, isFromGroup: boolean, isFromMe: boolean, jid: string|null, messageID: string|null) => {
        console.log(
            {
                message, isFromMe, isFromGroup, jid, messageID
            }
        );

        const messageText = message.message?.conversation || null
        if (typeof messageText === 'string' && messageText.startsWith('#')) {
            if(isFromGroup) {
                if (messageText === '#info:group_id') {
                    msg.text([
                        'ID group dari',
                        message.key.remoteJid
                    ].join('\n'))

                    msg.send(message.key.remoteJid || '', message)
                }
            }
        }
    })

})()

