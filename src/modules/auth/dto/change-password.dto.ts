import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;
}
