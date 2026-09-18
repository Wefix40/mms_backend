import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create User
   */
  async create(dto: CreateUserDto) {
    const emailExists = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    const role = await this.prisma.roles.findUnique({
      where: { id: dto.role_id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.users.create({
      data: {
        id: randomUUID(),
        user_id: dto.user_id,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role_id: dto.role_id,
        is_admin: dto.is_admin || false,
        is_superadmin: dto.is_superadmin || false,
        password_hash: passwordHash,
        updated_at: new Date(),
      },
      include: {
        roles: true,
      },
    });
  }

  /**
   * Get All Users
   */
  async findAll() {
    return this.prisma.users.findMany({
      include: {
        roles: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Get User By ID
   */
  async findOne(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        roles: true,
        user_permissions: {
          include: {
            menus: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update User
   */
  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    if (dto.email) {
      const emailExists = await this.prisma.users.findFirst({
        where: {
          email: dto.email,
          NOT: { id },
        },
      });

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    if (dto.role_id) {
      const role = await this.prisma.roles.findUnique({
        where: { id: dto.role_id },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }

    return this.prisma.users.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
      include: {
        roles: true,
      },
    });
  }

  /**
   * Delete User
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.user_permissions.deleteMany({
        where: { user_id: id },
      });

      await tx.users.delete({
        where: { id },
      });

      return {
        message: 'User deleted successfully',
      };
    });
  }

  /**
   * Get User Permissions
   */
  async getPermissions(id: string) {
    const user = await this.findOne(id);

    if (user.is_superadmin) {
      const allMenus = await this.prisma.menus.findMany({
        orderBy: { sequence: 'asc' },
      });
      return allMenus.map(menu => ({
        user_id: id,
        menu_id: menu.id,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        menus: menu,
      }));
    }

    return this.prisma.user_permissions.findMany({
      where: {
        user_id: id,
      },
      include: {
        menus: true,
      },
      orderBy: {
        menus: {
          sequence: 'asc',
        },
      },
    });
  }

  /**
   * Replace User Permissions
   */
  async updatePermissions(
    id: string,
    dto: UpdateUserPermissionsDto,
  ) {
    await this.findOne(id);

    const menuIds = dto.permissions.map((p) => p.menu_id);

    const menus = await this.prisma.menus.findMany({
      where: {
        id: {
          in: menuIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (menus.length !== menuIds.length) {
      throw new NotFoundException('Invalid menu selected');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.user_permissions.deleteMany({
        where: {
          user_id: id,
        },
      });

      await tx.user_permissions.createMany({
        data: dto.permissions.map((permission) => ({
          user_id: id,
          menu_id: permission.menu_id,
          can_view: permission.can_view,
          can_create: permission.can_create,
          can_edit: permission.can_edit,
          can_delete: permission.can_delete,
        })),
      });

      return tx.user_permissions.findMany({
        where: {
          user_id: id,
        },
        include: {
          menus: true,
        },
      });
    });
  }
}