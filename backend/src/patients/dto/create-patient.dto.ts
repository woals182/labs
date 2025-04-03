import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreatePatientDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{11}$/) // 11자리 숫자 (01012345678)
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  chartNumber?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/) // 생년월일 (YYMMDD)
  birthDate: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[01234]$/) // 성별: 1,2,3,4,0만 허용
  gender: string;
}
