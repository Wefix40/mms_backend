import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

export class UserPermissionDto {
  @ApiProperty({ description: 'Menu ID (UUID)' })
  @IsUUID()
  menu_id: string;

  @ApiProperty({ description: 'Can view menu' })
  @IsBoolean()
  can_view: boolean;

  @ApiProperty({ description: 'Can create items' })
  @IsBoolean()
  can_create: boolean;

  @ApiProperty({ description: 'Can edit items' })
  @IsBoolean()
  can_edit: boolean;

  @ApiProperty({ description: 'Can delete items' })
  @IsBoolean()
  can_delete: boolean;
}
