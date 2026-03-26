import { Controller, Put, Body, Post, Get, Query } from '@nestjs/common';
import { HebbianService } from './hebbian.service.js';
import {
  GenerateWeightDto,
  GenerateDataDto,
  RecognitionDto,
  FindUniqueDto,
} from './dto/index.js';

@Controller('hebbian')
export class HebbianController {
  constructor(private readonly hebbianService: HebbianService) {}

  @Put('/generateData')
  create(@Body() generateDataDto: GenerateDataDto) {
    return this.hebbianService.generateData(generateDataDto);
  }

  @Put('/generateWeight')
  generateWeight(@Body() generateWeightDto: GenerateWeightDto) {
    return this.hebbianService.generateWeight(generateWeightDto);
  }

  @Post('/recognition')
  recognition(@Body() recognitionDto: RecognitionDto) {
    return this.hebbianService.recognition(recognitionDto);
  }

  @Get('/')
  findUnique(@Query() findUniqueDto: FindUniqueDto) {
    return this.hebbianService.findUnique(findUniqueDto);
  }
}
