import { Controller, Put, Body } from '@nestjs/common';
import {HebbianService} from "./hebbian.service.js";
import {GenerateDataDto} from "./dto/generate-data.dto.js";

@Controller('hebbian')
export class HebbianController {
  constructor(private readonly hebbianService: HebbianService) {}

  @Put('/generateData')
  create(@Body() generateDataDto: GenerateDataDto) {
    return this.hebbianService.generateData(generateDataDto);
  }
}
