import { Controller, Put, Body, Post, Get, Query } from '@nestjs/common';
import { DeltaService } from './delta.service.js';
import {
  GenerateWeightDto,
  GenerateDataDto,
  RecognitionDto,
  FindUniqueDto,
} from './dto/index.js';

@Controller('delta')
export class DeltaController {
  constructor(private readonly deltaService: DeltaService) {}

  @Put('/generateData')
  create(@Body() generateDataDto: GenerateDataDto) {
    return this.deltaService.generateData(generateDataDto);
  }

  @Put('/generateWeight')
  generateWeight(@Body() generateWeightDto: GenerateWeightDto) {
    return this.deltaService.generateWeight(generateWeightDto);
  }

  @Post('/recognition')
  recognition(@Body() recognitionDto: RecognitionDto) {
    return this.deltaService.recognition(recognitionDto);
  }

  @Get('/')
  findUnique(@Query() findUniqueDto: FindUniqueDto) {
    return this.deltaService.findUnique(findUniqueDto);
  }
}
