import { Body, Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.notificationsService.findAll(req.user.id);
  }

  @Patch('read-all')
  markAllRead(@Req() req: any) {
    return this.notificationsService.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markRead(id, req.user.id);
  }

  @Get('preferences')
  getPrefs(@Req() req: any) {
    return this.notificationsService.getPrefs(req.user.id);
  }

  @Patch('preferences')
  updatePrefs(@Req() req: any, @Body() prefs: Record<string, boolean>) {
    return this.notificationsService.updatePrefs(req.user.id, prefs);
  }
}
