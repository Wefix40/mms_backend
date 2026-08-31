import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ example: 'Inventory' })
  @IsString()
  label: string;

  @ApiPropertyOptional({ example: '/inventory' })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional({ example: 'boxes' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  sequence: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parent_id?: string;
}