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
				msg.button('balbala', 'bakbaka')
					.add('Button 1')
					.add('Button 2')
					.add('Button 3');
	
				msg.text('Pesan Biasa')
	
				msg.send(jid)
			}
        }, 5_000);
    })
    
    wa.onDisconnected((reasonInfo: object) => {
        console.log('Koneksi Terputus', reasonInfo);
    })

    wa.onConnecting(() => {
        console.log('Menyambungkan Ulang');
        
    })
})()

