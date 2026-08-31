import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Ajay Kumar' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ajay@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: '6d1c6f35-2b1f-4c6a-a2cb-1d5d8b2a5e91',
    description: 'Role UUID',
  })
  @IsUUID()
  role_id: string;
}