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
    const user = await this.prisma.users.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { user_id: dto.email }
        ]
      },
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

    const payload = { 
      sub: user.id, 
      roleId: user.role_id,
      isAdmin: user.is_admin,
      isSuperadmin: user.is_superadmin 
    };

    let menusList: any[] = [];

    if (user.is_superadmin) {
      menusList = await this.prisma.menus.findMany({
        orderBy: [{ sequence: 'asc' }],
      });
    } else {
      const rolePermissions = await this.prisma.role_permissions.findMany({
        where: { role_id: user.role_id },
        include: { menus: true },
      });

      const userPermissions = await this.prisma.user_permissions.findMany({
        where: { user_id: user.id },
        include: { menus: true },
      });

      const menuMap = new Map();
      
      rolePermissions.forEach(p => {
        if (p.can_view || p.can_create || p.can_edit || p.can_delete) {
          menuMap.set(p.menu_id, p.menus);
        }
      });
      
      userPermissions.forEach(p => {
        if (p.can_view || p.can_create || p.can_edit || p.can_delete) {
          menuMap.set(p.menu_id, p.menus);
        }
      });

      menusList = Array.from(menuMap.values()).sort((a, b) => a.sequence - b.sequence);
    }

    const map = new Map();
    menusList.forEach(menu => {
      map.set(menu.id, { ...menu, children: [] });
    });

    const menuTree: any[] = [];
    menusList.forEach(menu => {
      if (menu.parent_id && map.has(menu.parent_id)) {
        map.get(menu.parent_id).children.push(map.get(menu.id));
      } else {
        menuTree.push(map.get(menu.id));
      }
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        role_id: user.role_id,
        is_admin: user.is_admin,
        is_superadmin: user.is_superadmin,
      },
      menus: menuTree,
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
