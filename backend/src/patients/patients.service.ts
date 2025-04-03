import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Patient } from './entities/patient.entity';
import { getStringValue, formatPhoneNumber, formatIdNumber } from './utils/data.form';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async processExcel(file: Express.Multer.File) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.worksheets[0];

    let patientsList: any[] = []; // 순서 유지 리스트
    let patientsMap = new Map<string, any>(); // 중복 검사용 Map
    let skippedRows = 0;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // 헤더 스킵

      const rowData = row.values as any[];
      console.log(`🔍 [ROW ${rowNumber}] 원본 데이터:`, rowData);

      // ✅ 데이터 추출
      const chartNumber = getStringValue(rowData[1]); // 차트번호
      const name = getStringValue(rowData[2]); // 이름
      const phoneNumber = formatPhoneNumber(getStringValue(rowData[3])); // 전화번호
      const idNumber = formatIdNumber(getStringValue(rowData[4])); // 주민번호
      const address = getStringValue(rowData[5]); // 주소
      const memo = getStringValue(rowData[6]); // 메모

      // ✅ 이름과 전화번호 검증
      if (!name || name.length > 255 || !phoneNumber || !/^010\d{8}$/.test(phoneNumber)) {
        console.log(`⛔ [ROW ${rowNumber}] 이름 또는 전화번호 검증 실패 -> 스킵`);
        skippedRows++;
        return;
      }

      // ✅ 식별자 생성 (차트번호 존재 여부에 따라 다르게)
      const identifier = chartNumber ? `${chartNumber}-${name}-${phoneNumber}` : `${name}-${phoneNumber}`;

      // ✅ 병합 처리
      if (chartNumber) {
        // ✅ 차트번호 있는 경우: 바로 저장
        patientsMap.set(identifier, { chartNumber, name, phoneNumber, idNumber, address, memo });
        patientsList.push(identifier);
      } else {
        // ✅ 차트번호 없는 경우: 위쪽 데이터 찾기
        const matchedKey = patientsList.find(
          (key) => key.endsWith(`${name}-${phoneNumber}`)
        );

        if (matchedKey) {
          // ✅ 위쪽 데이터와 병합
          const existingPatient = patientsMap.get(matchedKey);
          existingPatient.address = existingPatient.address || address;
          existingPatient.memo = existingPatient.memo || memo;
        } else {
          // ✅ 위쪽 데이터가 없으면 그냥 저장
          patientsMap.set(identifier, { chartNumber, name, phoneNumber, idNumber, address, memo });
          patientsList.push(identifier);
        }
      }
    });

    const patients = Array.from(patientsMap.values());
    console.log(`📊 총 병합된 환자 수: ${patients.length}`);
    console.log(`📊 총 스킵된 환자 수: ${skippedRows}`);

    return this.savePatients(patients, skippedRows);
  }

  async savePatients(patients: any[], skippedRows: number) {
    const processedRows = 0;
    const identifiers = patients.map((p) => ({
      chartNumber: p.chartNumber,
      name: p.name,
      phoneNumber: p.phoneNumber,
    }));

    // ✅ 중복 검사 최적화 - 한 번의 쿼리로 모든 환자 조회
    const existingPatients = await this.patientRepository
      .createQueryBuilder('patient')
      .where(
        'patient.chartNumber IN (:...chartNumbers) OR (patient.name IN (:...names) AND patient.phoneNumber IN (:...phoneNumbers))',
        {
          chartNumbers: identifiers.map((p) => p.chartNumber).filter(Boolean),
          names: identifiers.map((p) => p.name),
          phoneNumbers: identifiers.map((p) => p.phoneNumber),
        }
      )
      .getMany();

    const existingMap = new Map();
    existingPatients.forEach((p) => {
      existingMap.set(`${p.chartNumber}-${p.name}-${p.phoneNumber}`, p);
    });

    const newPatients = [];
    const updatedPatients = [];

    for (const patient of patients) {
      const key = `${patient.chartNumber}-${patient.name}-${patient.phoneNumber}`;
      const existingPatient = existingMap.get(key);

      if (existingPatient) {
        // ✅ 기존 데이터 업데이트
        existingPatient.address = patient.address || existingPatient.address;
        existingPatient.memo = patient.memo || existingPatient.memo;

        if (patient.chartNumber && !existingPatient.chartNumber) {
          existingPatient.chartNumber = patient.chartNumber;
        }

        updatedPatients.push(existingPatient);
      } else {
        // ✅ 신규 데이터 삽입
        newPatients.push(patient);
      }
    }

    // ✅ 대량 INSERT 적용
    if (newPatients.length > 0) {
      await this.patientRepository.save(newPatients, { chunk: 100 });
    }

    // ✅ 대량 UPDATE 적용
    if (updatedPatients.length > 0) {
      await this.patientRepository.save(updatedPatients, { chunk: 100 });
    }

    console.log(`📊 총 저장된 환자 수: ${newPatients.length}`);
    console.log(`📊 총 업데이트된 환자 수: ${updatedPatients.length}`);
    console.log(`📊 총 스킵된 환자 수: ${skippedRows}`);

    return {
      totalRows: patients.length + skippedRows,
      processedRows: newPatients.length + updatedPatients.length,
      skippedRows,
    };
  }


  async getPatients(page: number, limit: number, name?: string, phoneNumber?: string, chartNumber?: string) {
    const skip = (page - 1) * limit;
    console.log(`📢 getPatients 실행됨`);

    const queryBuilder = this.patientRepository.createQueryBuilder('patient');

    if (name) {
      queryBuilder.andWhere('patient.name LIKE :name', { name: `%${name}%` });
    }
    if (phoneNumber) {
      queryBuilder.andWhere('patient.phoneNumber LIKE :phoneNumber', { phoneNumber: `%${phoneNumber}%` });
    }
    if (chartNumber) {
      queryBuilder.andWhere('patient.chartNumber LIKE :chartNumber', { chartNumber: `%${chartNumber}%` });
    }

    const [patients, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      total,
      page,
      count: patients.length,
      data: patients,
    };
  }
}