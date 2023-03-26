### Whatsapp API
Ini adalah wrapper untuk WA Baileys agar penggunaan api dari Baileys semakin mudah dan lebih cepat untuk setupnya. Juga terdapat tambahan fitur seperti Message Builder dan Message Extractor (merubah object pesan agar lebih enak digunakan).

Contoh pembuatan socket client
```ts
import Whatsapp, { Client } from "../Whatsapp";
const wa: Whatsapp = new Whatsapp('david-14A', null, {
	browser: Client.Opera
});

wa.startSock()
wa.onConnected((info: any) => {
	console.log('Connected', info);
	setTimeout(()  =>  {
		wa.stopSock() // to stop socket without logout
		wa.logout() // to logout from socket 
	},  50_000);
})

wa.onDisconnected((reasonInfo:  object)  =>  {
	console.log('Disconnected', reasonInfo);
})
  
wa.onConnecting(()  =>  {
	console.log('Reconecting');
})
```

Untuk mengirim pesan
```ts
const msg = wa.createMessage()

msg.rawPayload({
	text: 'Hello World'
})

msg.text('Hello World')

msg.send()
```
