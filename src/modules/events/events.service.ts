import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsService {


    @WebSocketServer()
    server: Server

    createInvoiceEvent(payload: any) {
        this.server.emit('onCreateInvoice', payload);
    }
    invoicePaidEvent(payload: any) {
        this.server.emit('onInvoicePaid', payload);
    }
    createCheckoutEvent(payload: any) {
        this.server.emit('onCreateCheckout', payload);
    }

}
