const fs = require("fs");
const FormData = require("form-data");

module.exports = function (requestParams, context, ee, next) {
  const form = new FormData();
  form.append("file", fs.createReadStream("patient_data.xlsx")); // 실제 파일 경로

  // FormData에서 요청 헤더를 추출
  requestParams.headers = {
    ...requestParams.headers,
    ...form.getHeaders(),
  };

  // 요청 바디에 FormData 추가
  requestParams.body = form;

  console.log("📢 파일 업로드 요청 준비 완료");
  return next();
};
