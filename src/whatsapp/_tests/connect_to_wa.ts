import Whatsapp, { Client } from "../Whatsapp";
const wa: Whatsapp = new Whatsapp('david-14A', null, {
    browser: Client.Opera
});

(async () => {
    console.log('Starting Socket');
    await wa.startSock()
    console.log('Socket Started');

    wa.onConnected((info: any) => {
        console.log('Connected =======================', info);

        setTimeout(() => {
            wa.stopSock()
        }, 50_000);
    })
    
    wa.onDisconnected((reasonInfo: object) => {
        console.log('Disconnected', reasonInfo);
    })

    wa.onConnecting(() => {
        console.log('Reconecting');
        
    })
})()