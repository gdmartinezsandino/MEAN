import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';

import { IsFutureDate } from '../../common/validators/is-future-date.validator';
import { TaskPriority, TaskStatus } from '../enums/task.enums';

export class CreateTaskDto {
  @ApiProperty({ minLength: 3 })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  status!: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.Medium })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.Medium;

  @ApiProperty()
  @IsDateString()
  @Validate(IsFutureDate)
  dueDate!: string;

  @ApiPropertyOptional({ type: [String], uniqueItems: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];
}
