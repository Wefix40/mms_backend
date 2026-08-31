import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateMenuDto } from './dto/create-menu.dto.js';
import { UpdateMenuDto } from './dto/update-menu.dto.js';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMenuDto) {
    if (dto.parent_id) {
      const parent = await this.prisma.menus.findUnique({
        where: { id: dto.parent_id },
      });

      if (!parent) {
        throw new NotFoundException('Parent menu not found');
      }
    }

    if (dto.route) {
      const routeExists = await this.prisma.menus.findFirst({
        where: { route: dto.route },
      });

      if (routeExists) {
        throw new ConflictException('Route already exists');
      }
    }

    const sequenceExists = await this.prisma.menus.findFirst({
      where: {
        parent_id: dto.parent_id ?? null,
        sequence: dto.sequence,
      },
    });

    if (sequenceExists) {
      throw new ConflictException(
        'Sequence already exists under this parent',
      );
    }

    return this.prisma.menus.create({
      data: {
        id: randomUUID(),
        label: dto.label,
        route: dto.route ?? null,
        icon: dto.icon ?? 'circle',
        sequence: dto.sequence,
        parent_id: dto.parent_id ?? null,
      },
    });
  }

  async findAll() {
    return this.prisma.menus.findMany({
      orderBy: [{ parent_id: 'asc' }, { sequence: 'asc' }],
    });
  }

  async findTree() {
    const menus = await this.findAll();
    return this.buildTree(menus);
  }

  async findOne(id: string) {
    const menu = await this.prisma.menus.findUnique({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    return menu;
  }

  async update(id: string, dto: UpdateMenuDto) {
    await this.findOne(id);

    if (dto.parent_id === id) {
      throw new BadRequestException(
        'Menu cannot be its own parent',
      );
    }

    if (dto.parent_id) {
      const parent = await this.prisma.menus.findUnique({
        where: { id: dto.parent_id },
      });

      if (!parent) {
        throw new NotFoundException('Parent menu not found');
      }

      const circular = await this.isCircular(
        id,
        dto.parent_id,
      );

      if (circular) {
        throw new BadRequestException(
          'Circular hierarchy detected',
        );
      }
    }

    return this.prisma.menus.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const childCount = await this.prisma.menus.count({
      where: { parent_id: id },
    });

    if (childCount > 0) {
      throw new BadRequestException(
        'Delete child menus first',
      );
    }

    return this.prisma.menus.delete({
      where: { id },
    });
  }

  private buildTree(menus: any[]) {
    const map = new Map();

    menus.forEach(menu => {
      map.set(menu.id, {
        ...menu,
        children: [],
      });
    });

    const tree: any[] = [];

    menus.forEach(menu => {
      if (menu.parent_id) {
        map.get(menu.parent_id)?.children.push(map.get(menu.id));
      } else {
        tree.push(map.get(menu.id));
      }
    });

    return tree;
  }

  private async isCircular(
    menuId: string,
    parentId: string,
  ): Promise<boolean> {
    let current: string | null = parentId;

    while (current) {
      if (current === menuId) return true;

      const parentMenu: any = await this.prisma.menus.findUnique({
        where: { id: current },
      });

      current = parentMenu?.parent_id ?? null;
    }

    return false;
  }
}
