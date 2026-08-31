import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto.js';
import { OmitType } from '@nestjs/swagger';

export class UpdateRoleDto extends PartialType(
  OmitType(CreateRoleDto, ['permissions'] as const),
) {}