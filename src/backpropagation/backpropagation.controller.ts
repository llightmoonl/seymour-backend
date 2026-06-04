import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { BackpropagationService } from './backpropagation.service.js';
import { UpdateStepsDto, FindUniqueDto } from './dto/index.js';

@Controller('backpropagation')
export class BackpropagationController {
  constructor(
    private readonly backpropagationService: BackpropagationService,
  ) {}

  @Put('/updateSteps')
  create(@Body() updateStepsDto: UpdateStepsDto) {
    return this.backpropagationService.updateSteps(updateStepsDto);
  }

  @Get('/')
  findUnique(@Query() findUniqueDto: FindUniqueDto) {
    return this.backpropagationService.findUnique(findUniqueDto);
  }
}
