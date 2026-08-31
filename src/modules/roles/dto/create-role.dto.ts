import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RolePermissionDto } from './role-permission.dto.js';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Inventory Manager',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Inventory permissions',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: [RolePermissionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionDto)
  permissions: RolePermissionDto[];
}