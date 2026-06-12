import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get('product/:productId')
  getByProduct(@Param('productId') productId: string) {
    return this.questionsService.getByProduct(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('seller')
  getForSeller(@Request() req: any) {
    return this.questionsService.getForSeller(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  ask(@Body('productId') productId: string, @Body('question') question: string, @Request() req: any) {
    return this.questionsService.ask(productId, req.user.id, question);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/answer')
  answer(@Param('id') id: string, @Body('answer') answer: string, @Request() req: any) {
    return this.questionsService.answer(id, req.user.id, answer);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.questionsService.delete(id, req.user.id, req.user.role);
  }
}
