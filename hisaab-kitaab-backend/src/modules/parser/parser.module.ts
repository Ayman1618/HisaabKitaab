import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { RegexEngine } from './regex.engine';
import { AiEngine } from './ai.engine';

@Module({
  providers: [ParserService, RegexEngine, AiEngine],
  exports: [ParserService],
})
export class ParserModule {}
