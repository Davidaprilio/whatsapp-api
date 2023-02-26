import { Request, ResponseToolkit } from "@hapi/hapi";
import { StatusCodes } from "http-status-codes";
import WhatsappSession from "../../service/WhatsappSession";

export default class DeviceHandler {
    _waSession: WhatsappSession;

    constructor(whatsappSession: WhatsappSession) {
        this._waSession = whatsappSession

        this.createNewSessionDevice = this.createNewSessionDevice.bind(this)
        this.startDeviceHandler = this.startDeviceHandler.bind(this)
        this.listDevice = this.listDevice.bind(this)
        this.getInfo = this.getInfo.bind(this)
    }

    async createNewSessionDevice(request: Request, h: ResponseToolkit) {
        const { clientID } = request.params
        if(this._waSession.isExist(clientID)) {
            return h.response({
                message: "clientID already used",
                clientID
            }).code(StatusCodes.BAD_REQUEST)
        }

        const whatsapp = this._waSession.newSession(clientID);
        await whatsapp.startSock();
        return h.response({
            message: 'Started Device',
            file: whatsapp.info
        })
    }

    /**
     * Start device yang sudah dibuat
     */
    startDeviceHandler(request: Request, h: ResponseToolkit) {
        const { clientID } = request.params

        if(this._waSession.isExist(clientID) === false) {
            return h.response({
                message: "device not found",
                clientID
            }).code(StatusCodes.NOT_FOUND)
        }

        this._waSession.get(clientID).startSock()

        return h.response({
            message: "device started",
            clientID
        })
    }

    listDevice(_request: Request, h: ResponseToolkit) {
        return h.response({
            devices: this._waSession.listClientActive()
        })
    }

    getInfo(request: Request, h: ResponseToolkit) {
        const { clientID } = request.params
        const wa = this._waSession.get(clientID)
        return h.response({
            info: wa.info
        })
    }
}
