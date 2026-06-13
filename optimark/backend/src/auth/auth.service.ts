import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashed,
        role: dto.role as any,
      },
    });

    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return { data: { token, user: this.sanitize(user) }, message: 'Inscription réussie', success: true };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return { data: { token, user: this.sanitize(user) }, message: 'Connexion réussie', success: true };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    return { data: this.sanitize(user), success: true };
  }

  async upgradeToSeller(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'SELLER' },
    });
    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return { data: { token, user: this.sanitize(user) }, message: 'Compte mis à niveau en vendeur', success: true };
  }

  private sanitize(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
