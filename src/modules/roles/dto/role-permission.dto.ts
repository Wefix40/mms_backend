import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

export class RolePermissionDto {
  @ApiProperty()
  @IsUUID()
  menu_id: string;

  @ApiProperty()
  @IsBoolean()
  can_view: boolean;

  @ApiProperty()
  @IsBoolean()
  can_create: boolean;

  @ApiProperty()
  @IsBoolean()
  can_edit: boolean;

  @ApiProperty()
  @IsBoolean()
  can_delete: boolean;
}