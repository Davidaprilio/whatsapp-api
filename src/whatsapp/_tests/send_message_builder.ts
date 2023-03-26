import { proto } from "@adiwajshing/baileys";
import { convertToJID } from "../helper";
// import { OptionSection } from "./message/list";
import Whatsapp, { Client } from "../Whatsapp";

const wa: Whatsapp = new Whatsapp('david-14A', null, {
    browser: Client.Opera
});

(async () => {
    console.log('Starting Socket');
    await wa.startSock()
    console.log('Socket Started');

    wa.onConnected((info: any) => {
        console.log('WES KONEK =======================', info);

        setTimeout(async () => {
			const jid = convertToJID('085231028718')
			// const jid = '120363024101903992@g.us' // group
			const isRegister = await wa.isRegistWA(jid);
			console.log('isRegister', isRegister);
			if (isRegister) {
                // const msg = wa.createMessage()
                // Make Text message
				// msg.text('WA Tersambung')

                // Make button message
				// msg.button('Text message', 'Footer Message')
				// 	.image('https://www.w3schools.com/tags/smiley.gif') // belum bisa
				// 	.add('Button 1')
				// 	.add('Button 2')
				// 	.add('Button 3');

                // Make List Message
                // const listMsg = msg.list('Pesan List Option', 'Silahkan pilih opsi dibawah')
                // listMsg.section('Section 1', (section: OptionSection) => {
                //     section.option('option1', 'Option 1')
                //     section.option('option2', 'Option 2', 'Option description')
                // })
                // listMsg.addSection('Section 2')
                //     .addOption('option1', 'Option 1')
                //     .addOption('option2', 'Option 2', 'Option description')

                // Make Template Message
                // msg.template('Pesan Template')
                //     .urlButton('Portofolio', 'https://github.com/Davidaprilio')
                //     .callButton('Hubungi Saya', '085231028718')
                //     .replyButton('Salam Kenal', 'salam')

                // Reaction
                // msg.reaction({
                //     remoteJid: jid,
                //     fromMe: false,
                //     id: 'E25C4455AEEA414DA7215BBD194A6F31'
                // }, '👍')

                // msg.location(-7.655931370631908, 111.97003735003399)                

                // msg.contact('david')
                //     .add('David Aprilio', '085231028718', 'MSD')
                //     .add('Alwi Bayu P', '026156281222', 'STAN (Kediri)')
	
				// msg.send(jid)

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
    wa.onStopedSession(() => {
        console.log('Menyambungkan Ulang');
    })

    wa.onIncomingMessage((message: proto.IWebMessageInfo, isFromGroup: boolean, isFromMe: boolean, jid: string|null, messageID: string|null) => {
        console.log(
            {
                message, isFromMe, isFromGroup, jid, messageID
            }
        );

        // msg.reaction({
        //     remoteJid: message.key.remoteJid,
        //     fromMe: false,
        //     id: message.key.id
        // }, '👍')

        const messageText = message.message?.conversation || null
        if (typeof messageText === 'string' && messageText.startsWith('#')) {
            if(isFromGroup) {
                if (messageText === '#info:id') {
                    const msg = wa.createMessage();
                    msg.text([
                        'ID group dari',
                        message.key.remoteJid
                    ].join('\n'))

                    msg.reply(message)
                    // msg.send(message.key.remoteJid || '')
                }
            }
        }
    })

})()

