import { ServerRoute } from "@hapi/hapi";
import DeviceHandler from "./handler";

const device = (handler: DeviceHandler): ServerRoute[] => [
    {
        method: 'GET',
        path: '/devices',
        handler: handler.listDevice,
    },
    {
        method: 'GET',
        path: '/devices/create/{clientID}',
        handler: handler.createNewSessionDevice,
    },
    {
        method: 'GET',
        path: '/devices/{clientID}/info',
        handler: handler.getInfo,
    },
    {
        method: 'GET',
        path: '/devices/{clientID}/start',
        handler: handler.startDeviceHandler,
    },
];

export default device
