import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { UserPermissionDto } from './user-permission.dto.js';

export class UpdateUserPermissionsDto {
  @ApiProperty({
    type: [UserPermissionDto],
    description: 'Replace all menu permissions for this user',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPermissionDto)
  permissions: UserPermissionDto[];
}
