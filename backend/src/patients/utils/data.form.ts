// ✅ 문자열 변환 함수
export const getStringValue = (value: any): string | null => {
    return value !== undefined && value !== null ? String(value).trim() : null;
  };

  // ✅ 전화번호 변환 (하이픈 제거)
export const formatPhoneNumber = (phoneNumberRaw: string | null): string | null => {
    return phoneNumberRaw ? phoneNumberRaw.replace(/-/g, '') : null;
  };

  // ✅ 주민등록번호 변환
export const formatIdNumber = (idNumber: any): string => {
    if (!idNumber) return '000000-0'; // 주민번호 없으면 기본값

    if (typeof idNumber !== 'string') {
      idNumber = String(idNumber); // 숫자일 경우 문자열로 변환
    }

    // 숫자, `-`, `*` 제외한 모든 문자 제거
    const cleanId = idNumber.replace(/[^0-9*-]/g, '');

    // 6자리(생년월일)만 있을 경우 -> 성별값 `0` 추가
    if (/^\d{6}$/.test(cleanId)) {
      return `${cleanId}-0`;
    }
    // 7자리 (생년월일 + 성별값)
    if (/^\d{7}$/.test(cleanId)) {
      return `${cleanId.slice(0, 6)}-${cleanId[6]}`;
    }
    // 8자리 (`900101-1` 형태)
    if (/^\d{6}-\d{1}$/.test(cleanId)) {
      return cleanId;
    }
    // 9자리 이상 (`900101-1******` -> `900101-1` 형태로 변환)
    if (/^\d{6}-\d{1}[*\d]*$/.test(cleanId)) {
      return `${cleanId.slice(0, 8)}`;
    }
    return '000000-0'; // 형식이 맞지 않으면 기본값
  };
