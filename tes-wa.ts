// // import Gevent from './src/Main/GlobalEvent';
// // import Whatsapp from './src/Main/Whatsapp';
// // import CreateMessage from './src/Main/CreateMessage';

// import * as fs from 'fs';

// // const waClient = new Whatsapp('david-14');
// // waClient.startSock()

// // Gevent.on('connection.connected', (id, info) => {
// //     console.log(id, info)

// //     const cm = new CreateMessage(waClient)

// //     cm.text("Hai kakak").send('085231028718')
// // })

// function basePath(path: string) {
//     return __dirname + '/' + path.trimStart()
// }


// const session = fs.readdirSync(basePath('/session/auth-state'), 
//     { withFileTypes: true }
// ).filter((item) => item.isDirectory()).map((item) => item.name);

// console.log(session)

import {logger} from './src/Utils/logger';

logger.info('asasasas', 'Halo dunia')