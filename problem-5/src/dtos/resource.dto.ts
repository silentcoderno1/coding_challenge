import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
} from "class-validator";
import { ResourceStatus } from "../entities/Resource.entity";

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty({ message: "name is required" })
  @MinLength(3, { message: "name must be at least 3 characters long" })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ResourceStatus, { message: "status must be active or inactive" })
  status?: ResourceStatus;
}

export class UpdateResourceDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: "name must be at least 3 characters long" })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ResourceStatus, { message: "status must be active or inactive" })
  status?: ResourceStatus;
}
