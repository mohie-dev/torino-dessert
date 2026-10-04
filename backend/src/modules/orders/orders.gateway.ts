import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Permission } from '../../utils/enums.js';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/admin-orders',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token: unknown = client.handshake.auth?.token;
            if (typeof token !== 'string' || !token) {
                throw new Error('Unauthorized');
            }

            const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
                secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
            });
            const user = await this.usersRepository.findOne({
                where: { id: payload.sub },
            });

            if (!user?.isActive || !user.role?.permissions.includes(Permission.ORDERS_READ)) {
                throw new Error('Forbidden');
            }

        } catch (error) {
            const reason = error instanceof Error ? error.message : 'Unknown error';
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Admin disconnected: ${client.id}`);
    }

    notifyNewOrder(orderData: any) {
        this.server.emit('newOrder', orderData);
    }

    notifyOrderStatusUpdated(orderData: { orderNumber: string; status: string }) {
        this.server.emit('orderStatusUpdated', orderData);
    }
}