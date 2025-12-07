import { Controller, Post, Body } from '@nestjs/common';
import { HebbianService } from './hebbian.service';
import { GenerateWeightDto } from './dto/generate-weight.dto';
import { LearningNeuroDto } from './dto/learning-neuro.dto';

@Controller('hebbian')
export class HebbianController {
  constructor(private readonly hebbianService: HebbianService) {}

  @Post()
  generateWeight(@Body() generateWeightDto: GenerateWeightDto) {
    return this.hebbianService.generateWeight(generateWeightDto);
  }

  @Post()
  learningNeuro(@Body() learningNeuroDto: LearningNeuroDto) {
    return this.hebbianService.learningNeuro(learningNeuroDto);
  }
}
