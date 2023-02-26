import Whatsapp from "./Whatsapp";

const wa: Whatsapp = new Whatsapp('david-14A');

(async () => {
    console.log('Starting Socket');
    await wa.startSock()
    console.log('Socket Started');

    wa.onConnected((info: any) => {
        console.log('WES KONEK =======================', info);

        setTimeout(() => {
            wa.stopSock()
        }, 50_000);
    })
    
    wa.onDisconnected((reasonInfo: object) => {
        console.log('Koneksi Terputus', reasonInfo);
    })

    wa.onConnecting(() => {
        console.log('Menyambungkan Ulang');
        
    })
})()