import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, User } from '../entities';

interface ConnectedUser {
  userId: number;
  userName: string;
  halaqahId: number | null;
}

@WebSocketGateway({
  cors: { origin: 'http://localhost:3000', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, ConnectedUser>();

  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user?.halaqahId) {
      this.connectedUsers.delete(client.id);
      this.broadcastOnlineUsers(user.halaqahId);
    }
    this.connectedUsers.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { halaqahId: number; userId: number; userName: string } | number,
  ) {
    const halaqahId = typeof data === 'number' ? data : data.halaqahId;
    const room = `halaqah_${halaqahId}`;
    client.join(room);

    if (typeof data === 'object' && data.userId) {
      this.connectedUsers.set(client.id, {
        userId: data.userId,
        userName: data.userName,
        halaqahId,
      });
      this.broadcastOnlineUsers(halaqahId);
    }

    return { event: 'joinedRoom', data: halaqahId };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() halaqahId: number) {
    const room = `halaqah_${halaqahId}`;
    client.leave(room);
    const user = this.connectedUsers.get(client.id);
    if (user) {
      this.connectedUsers.delete(client.id);
      this.broadcastOnlineUsers(halaqahId);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: number; halaqahId: number; content: string },
  ) {
    const message = this.messageRepo.create(data);
    const saved = await this.messageRepo.save(message);

    const user = await this.userRepo.findOne({ where: { id: data.senderId } });
    const fullMessage = { ...saved, sender: { id: user!.id, name: user!.name, role: user!.role } };

    const room = `halaqah_${data.halaqahId}`;
    this.server.to(room).emit('newMessage', fullMessage);
    return fullMessage;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { halaqahId: number; userName: string },
  ) {
    const room = `halaqah_${data.halaqahId}`;
    client.to(room).emit('userTyping', data.userName);
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() halaqahId: number,
  ) {
    const room = `halaqah_${halaqahId}`;
    client.to(room).emit('userStoppedTyping');
  }

  @SubscribeMessage('subscribe:notifications')
  handleSubscribeNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: number,
  ) {
    client.join(`user_${userId}`);
    return { event: 'subscribed', data: userId };
  }

  private broadcastOnlineUsers(halaqahId: number) {
    const onlineUsers = Array.from(this.connectedUsers.values())
      .filter(u => u.halaqahId === halaqahId)
      .map(u => ({ userId: u.userId, userName: u.userName }));
    this.server.to(`halaqah_${halaqahId}`).emit('onlineUsers', onlineUsers);
  }

  emitToUser(userId: number, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }
}
