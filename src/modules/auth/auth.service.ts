import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, roleId: user.role_id };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.role_id,
      },
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.old_password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect current password');
    }

    const newPasswordHash = await bcrypt.hash(dto.new_password, 12);

    await this.prisma.users.update({
      where: { id: userId },
      data: {
        password_hash: newPasswordHash,
        updated_at: new Date(),
      },
    });

    return { message: 'Password successfully changed' };
  }
}
