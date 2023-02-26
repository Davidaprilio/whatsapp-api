import dotenv from "dotenv"
dotenv.config()
import * as fs from 'fs';

import { ClientError } from "./exceptions"
import { Boom } from "@hapi/boom"
import Hapi, { Request, ReqRefDefaults, ResponseToolkit } from "@hapi/hapi"

import device from './api/device'
import WhatsappSession from './service/WhatsappSession'

const init = async (): Promise<void> => {
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    })

    const whatsappSession = new WhatsappSession()

    function basePath(path: string) {
        return __dirname + '/' + path.trimStart()
    }
        
    console.log(`Starting session Device`);
    const nameSessionDevice = fs.readdirSync(basePath('/session/auth-state'), 
        { withFileTypes: true }
    ).filter((item) => item.isDirectory()).map((item) => item.name);

    nameSessionDevice.forEach(name => {
        whatsappSession.newSession(name).startSock()
    })
    

    /**
     * Register Http API
     */
    await server.register([
        {
            plugin: device,
            options: {
                whatsappSession
            }
        },
    ])

    /**
     * Handling Error Response
     */
    server.ext('onPreResponse', (
        request: Request<ReqRefDefaults>, 
        handler: ResponseToolkit<ReqRefDefaults>
    ) => {
        const { response } = request;

        if (response && response instanceof Boom && response.message !== 'Invalid request payload input') {
            if (response.isServer) {
                console.error('Error Server:', response.message)
                response.message // string 
            } else {
                console.error('Bukan Server:', response.message)
            }
            return handler.continue;
        }

        // Jika response adalah Error
        if (response instanceof ClientError) {
            const newResponse = handler.response({
                status: 'fail',
                message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        if (response instanceof Error) {
            const { statusCode } = response.output;
            let errorMessage = response.message;

            if (statusCode === 500) {
                // Server Error
                console.error('Error:', statusCode, errorMessage, response);
                errorMessage = 'Maaf, terjadi kegagalan pada server kami.';
            }

            // Response ERROR!
            return handler.response({
                status: 'error',
                message: errorMessage,
            }).code(statusCode);
        }

        return handler.continue || response;
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
}

init()