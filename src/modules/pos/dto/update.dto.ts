import { PartialType } from "@nestjs/swagger";
import { CreatePosDto } from "./create.dto";

export class UpdatePosDto extends PartialType(CreatePosDto) {}
