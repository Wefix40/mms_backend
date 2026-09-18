import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { MenusService } from './menus.service.js';
import { CreateMenuDto } from './dto/create-menu.dto.js';
import { UpdateMenuDto } from './dto/update-menu.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Menus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly service: MenusService) {}

  @Post()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Create Menu' })
  @ApiBody({ type: CreateMenuDto })
  @ApiResponse({ status: 201, description: 'Menu created successfully.' })
  create(@Body() dto: CreateMenuDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get All Menus' })
  @ApiResponse({ status: 200, description: 'Menu list.' })
  findAll() {
    return this.service.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get Menu Tree' })
  @ApiResponse({ status: 200, description: 'Hierarchical menu tree.' })
  findTree() {
    return this.service.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Menu By ID' })
  @ApiParam({
    name: 'id',
    description: 'Menu UUID',
    example: '6d1c6f35-2b1f-4c6a-a2cb-1d5d8b2a5e91',
  })
  @ApiResponse({ status: 200, description: 'Menu details.' })
  @ApiResponse({ status: 404, description: 'Menu not found.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Update Menu' })
  @ApiParam({
    name: 'id',
    description: 'Menu UUID',
    example: '6d1c6f35-2b1f-4c6a-a2cb-1d5d8b2a5e91',
  })
  @ApiBody({ type: UpdateMenuDto })
  @ApiResponse({ status: 200, description: 'Menu updated successfully.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Delete Menu' })
  @ApiParam({
    name: 'id',
    description: 'Menu UUID',
    example: '6d1c6f35-2b1f-4c6a-a2cb-1d5d8b2a5e91',
  })
  @ApiResponse({ status: 200, description: 'Menu deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}