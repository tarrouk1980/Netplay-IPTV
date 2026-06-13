import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('threads')
  getThreads(@Request() req: any) {
    return this.messagesService.getThreads(req.user.id);
  }

  @Get('conversation/:otherId')
  getConversation(@Request() req: any, @Param('otherId') otherId: string) {
    return this.messagesService.getConversation(req.user.id, otherId);
  }

  @Post('send')
  send(@Request() req: any, @Body() body: { receiverId: string; content: string; productId?: string }) {
    return this.messagesService.send(req.user.id, body.receiverId, body.content, body.productId);
  }
}
