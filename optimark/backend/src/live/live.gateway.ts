import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LiveService } from './live.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'live' })
export class LiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private roomViewers = new Map<string, Set<string>>();

  constructor(private liveService: LiveService) {}

  handleConnection(client: Socket) {
    client.data.rooms = new Set<string>();
  }

  handleDisconnect(client: Socket) {
    for (const room of client.data.rooms || []) {
      this.removeViewer(room, client.id);
    }
  }

  private addViewer(sessionId: string, clientId: string) {
    if (!this.roomViewers.has(sessionId)) {
      this.roomViewers.set(sessionId, new Set());
    }
    this.roomViewers.get(sessionId)!.add(clientId);
    const count = this.roomViewers.get(sessionId)!.size;
    this.server.to(sessionId).emit('viewers-count', { sessionId, count });
    this.liveService.updateViewerCount(sessionId, count).catch(() => {});
  }

  private removeViewer(sessionId: string, clientId: string) {
    this.roomViewers.get(sessionId)?.delete(clientId);
    const count = this.roomViewers.get(sessionId)?.size || 0;
    this.server.to(sessionId).emit('viewers-count', { sessionId, count });
    this.liveService.updateViewerCount(sessionId, count).catch(() => {});
  }

  @SubscribeMessage('join-live')
  handleJoinLive(
    @MessageBody() data: { sessionId: string; userId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.sessionId);
    client.data.rooms = client.data.rooms || new Set();
    client.data.rooms.add(data.sessionId);
    this.addViewer(data.sessionId, client.id);
    return { event: 'joined', data: { sessionId: data.sessionId } };
  }

  @SubscribeMessage('leave-live')
  handleLeaveLive(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.sessionId);
    client.data.rooms?.delete(data.sessionId);
    this.removeViewer(data.sessionId, client.id);
    return { event: 'left', data: { sessionId: data.sessionId } };
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(
    @MessageBody() data: { sessionId: string; message: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.sessionId).emit('chat-message', {
      id: client.id,
      userName: data.userName,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('product-featured')
  handleProductFeatured(
    @MessageBody() data: { sessionId: string; productId: string; productTitle: string; productPrice: number },
  ) {
    this.server.to(data.sessionId).emit('product-featured', {
      productId: data.productId,
      productTitle: data.productTitle,
      productPrice: data.productPrice,
      timestamp: new Date().toISOString(),
    });
  }
}
