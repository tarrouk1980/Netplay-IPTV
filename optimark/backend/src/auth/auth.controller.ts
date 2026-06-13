import { Body, Controller, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Patch('upgrade-to-seller')
  @UseGuards(JwtAuthGuard)
  upgradeToSeller(@Request() req: any) {
    return this.authService.upgradeToSeller(req.user.id);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Request() req: any, @Body('currentPassword') curr: string, @Body('newPassword') next: string) {
    return this.authService.changePassword(req.user.id, curr, next);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req: any, @Body() dto: { name?: string; phone?: string }) {
    return this.authService.updateProfile(req.user.id, dto);
  }
}
