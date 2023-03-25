## Message Builder
message builder mambantu mambuat payload untuk mengirim pesan di baileys, dengan ini mengirim pesan lebih mudah dan flexible. Untuk memulai membuat message builder, perlu memanggil classnya dulu dan class `Whatsapp` yang telah tersambung.
```ts
const wa = new Whatsapp('my-device');
wa.startSock()
wa.onConnected(() => {	
	const msg = new Message(wa);
	msg.text('Hello Jhon doe')
	msg.text('welcome')
	// to send message
	msg.send('62xxxxxxxxx') // jid or phone
	// msg.send(['62xxxxxxxxx', jid]) // give array to send to multiple phone or jid
	
	// to reply message
	msg.reply(message) // message object, kamu bisa mendapatkannya saat ada pesan masuk
})
``` 
Kode diatas akan mengirim 2 pesan sekaligus, karena setiap method yang dipanggil dari class `Message` akan membentuk pesan baru, jadi kamu bisa membuat banyak pesan sekaligus dan mengirimnya sekali dengan method `msg.send(jid)`. 

#### Available Message Type
```ts
msg.text('Text message');


// Button Message
msg.button('Text message', 'Footer message')
	.image('https://www.w3schools.com/tags/smiley.gif') // opsional
	.add('Button 1', 'button_1') // custom button id
	.add('Button 2')
	.add('Button 3');
	
msg.button().text('Text Message').footer('Footer message')
	.add('Button 1') 
	//...


// Template Button
msg.template('Hello Guys')
	.image('https://www.w3schools.com/tags/smiley.gif') // opsional
	.urlButton('My Github', 'https://github.com/Davidaprilio')
	.callButton('Call me', '62xxxxxxxxx')
	.replyButton('Hello', 'say_hello_btn_id')

msg.template('Hello Guys')
	.urlButton('My Github', 'https://github.com/Davidaprilio')
	.urlButton('My Repo', 'https://github.com/Davidaprilio?tab=repositories')


// List Message
const listMsg = msg.list('Title message', 'text content', 'text footer')
listMsg.section('Section 1', (section: OptionSection) => {
	section.option('optionId1-1', 'Text Option 1')
	section.option('optionId1-2', 'Text Option 2', 'Option description')
})
listMsg.addSection('Section 2')
	.addOption('optionId2-1', 'Text Option 1')
	.addOption('optionId2-2', 'Text Option 2', 'Option description')


// Send Location
msg.location(latitude, longtitude) // float


// Send Reaction
msg.reaction(message.key, '👍')
msg.reaction({
	remoteJid: jid,
	fromMe: false,
	id: 'E25C4455AEEA414DA7215BBD194A6F31' //  message id
}, '👍')


// Send Contact
msg.contact('displayName')
	.add('David', '62xxxxxxxxxx', 'Team Dev')
	.add('Jhon doe', '62xxxxxxxxxx')


// Send Media
msg.video(linkUrl, caption)
msg.video(linkUrl, caption, true) // send as GIF 
msg.image(linkUrl, caption, jpegThumbnailBase64)
msg.audio(linkUrl)
msg.audio(linkUrl, true) // send as voice notes
msg.voice(linkUrl) // voice notes
msg.document(linkUrl) // comming soon
```
jika kamu perlu membuat payload sendiri dari format baileys kamu bisa menggunakan method `rawPayload()` 
```ts
msg.rawPayload({
	text: 'oh hello there' 
})

const templateButtons = [
	{index: 1, urlButton: {displayText: '⭐ Star Baileys on GitHub!', url: 'https://github.com/adiwajshing/Baileys'}},
	{index: 2, callButton: {displayText: 'Call me!', phoneNumber: '+1 (234) 5678-901'}},
	{index: 3, quickReplyButton: {displayText: 'This is a reply, just like normal buttons!', id: 'id-like-buttons-message'}},
]
msg.rawPayload({
	text: "Hi it's a template message",
	footer: 'Hello World',
	templateButtons: templateButtons
})
```
