import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
} from 'class-validator';
import { RolePermissionDto } from './role-permission.dto.js';

export class UpdateRolePermissionsDto {
  @ApiProperty({
    type: [RolePermissionDto],
    description: 'Replace all menu permissions for this role',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionDto)
  permissions: RolePermissionDto[];
}