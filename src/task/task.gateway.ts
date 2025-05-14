import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ namespace: '/tasks', cors: true })
@Injectable()
export class TaskGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: any) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }

  notifyTaskUpdate(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  notifyTaskCreated(task: any) {
    this.server.emit('taskCreated', task);
  }

  notifyTaskUpdated(task: any) {
    this.server.emit('taskUpdated', task);
  }

  notifyTaskDeleted(taskId: string) {
    this.server.emit('taskDeleted', { id: taskId });
  }

  notifyTaskCompleted(task: any) {
    this.server.emit('taskCompleted', task);
  }
}
