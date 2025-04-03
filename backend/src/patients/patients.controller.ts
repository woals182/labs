import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PatientsService } from './patients.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  //Excel 파일 업로드 API
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPatients(@UploadedFile() file: Express.Multer.File) {
    return await this.patientsService.processExcel(file);
  }

  //환자 목록 조회 API
  @Get()
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'name', required: false, example: '김환자' })
  @ApiQuery({ name: 'phoneNumber', required: false, example: '01000000000' })
  @ApiQuery({ name: 'chartNumber', required: false, example: 'C_1001' })

  async getPatients(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('name') name?: string,
    @Query('phoneNumber') phoneNumber?: string,
    @Query('chartNumber') chartNumber?: string,
  ) {
    console.log(`[QUERY] page: ${page}, limit: ${limit}, name: ${name}, phoneNumber: ${phoneNumber}, chartNumber: ${chartNumber}`);

    return this.patientsService.getPatients(
      Number(page) || 1,
      Number(limit) || 10,
      name,
      phoneNumber,
      chartNumber,
    );
  }
}
