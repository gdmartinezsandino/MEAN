import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsDateString,
  ArrayUnique,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../enums/task.enums';

export class UpdateTaskDto {
  @ApiPropertyOptional({ minLength: 3, description: 'Title of the task' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  readonly title?: string;

  @ApiPropertyOptional({ maxLength: 500, description: 'Detailed description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, description: 'Status of the task' })
  @IsOptional()
  @IsEnum(TaskStatus)
  readonly status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, description: 'Priority of the task' })
  @IsOptional()
  @IsEnum(TaskPriority)
  readonly priority?: TaskPriority;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Due date in ISO 8601 format',
  })
  @IsOptional()
  @IsDateString()
  readonly dueDate?: string;

  @ApiPropertyOptional({
    type: [String],
    uniqueItems: true,
    description: 'Tags related to the task',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  readonly tags?: string[];
}
