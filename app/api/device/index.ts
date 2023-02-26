import { Server } from "@hapi/hapi";
import routes from "./routes"
import DeviceHandler from "./handler"
import WhatsappSession from "../../service/WhatsappSession";

export type optionsDevice = {
    whatsappSession: WhatsappSession
}

export default {
    name: 'device',
    version: '1.0.0',
    register: async (server: Server, { whatsappSession }: optionsDevice) => {
        const devicesHandler = new DeviceHandler(
            whatsappSession
        );
        server.route(routes(devicesHandler));
    },
};
