import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto.js';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create Role with Permissions
   */
  async create(dto: CreateRoleDto) {
    const roleExists = await this.prisma.roles.findUnique({
      where: { name: dto.name },
    });

    if (roleExists) {
      throw new ConflictException('Role already exists');
    }

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
      throw new NotFoundException('One or more menus not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const role = await tx.roles.create({
        data: {
          id: randomUUID(),
          name: dto.name,
          description: dto.description,
          updated_at: new Date(),
        },
      });

      await tx.role_permissions.createMany({
        data: dto.permissions.map((permission) => ({
          role_id: role.id,
          menu_id: permission.menu_id,
          can_view: permission.can_view,
          can_create: permission.can_create,
          can_edit: permission.can_edit,
          can_delete: permission.can_delete,
        })),
      });

      return tx.roles.findUnique({
        where: { id: role.id },
        include: {
          role_permissions: {
            include: {
              menus: true,
            },
          },
        },
      });
    });
  }

  /**
   * Get All Roles
   */
  async findAll() {
    return this.prisma.roles.findMany({
      include: {
        _count: {
          select: {
            users: true,
            role_permissions: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get Single Role
   */
  async findOne(id: string) {
    const role = await this.prisma.roles.findUnique({
      where: { id },
      include: {
        role_permissions: {
          include: {
            menus: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  /**
   * Update Role Details
   */
  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);

    if (dto.name) {
      const exists = await this.prisma.roles.findFirst({
        where: {
          name: dto.name,
          NOT: {
            id,
          },
        },
      });

      if (exists) {
        throw new ConflictException('Role name already exists');
      }
    }

    return this.prisma.roles.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Get Role Permissions
   */
  async getPermissions(id: string) {
    await this.findOne(id);

    return this.prisma.role_permissions.findMany({
      where: {
        role_id: id,
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
   * Replace Role Permissions
   */
  async updatePermissions(
    id: string,
    dto: UpdateRolePermissionsDto,
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
      await tx.role_permissions.deleteMany({
        where: {
          role_id: id,
        },
      });

      await tx.role_permissions.createMany({
        data: dto.permissions.map((permission) => ({
          role_id: id,
          menu_id: permission.menu_id,
          can_view: permission.can_view,
          can_create: permission.can_create,
          can_edit: permission.can_edit,
          can_delete: permission.can_delete,
        })),
      });

      return tx.role_permissions.findMany({
        where: {
          role_id: id,
        },
        include: {
          menus: true,
        },
      });
    });
  }

  /**
   * Delete Role
   */
  async remove(id: string) {
    await this.findOne(id);

    const userCount = await this.prisma.users.count({
      where: {
        role_id: id,
      },
    });

    if (userCount > 0) {
      throw new BadRequestException(
        'Cannot delete role because users are assigned',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.role_permissions.deleteMany({
        where: {
          role_id: id,
        },
      });

      await tx.roles.delete({
        where: {
          id,
        },
      });

      return {
        message: 'Role deleted successfully',
      };
    });
  }
}