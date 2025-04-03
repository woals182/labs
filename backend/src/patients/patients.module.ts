import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from './entities/patient.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Patient])], // TypeORM에서 Patient 엔티티 사용
    controllers: [PatientsController],
    providers: [PatientsService],
})
export class PatientsModule {}
