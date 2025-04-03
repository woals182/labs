# labs
~~~
1. 의존성 설치하기
-> npm install

2. .env 확인하기
-> 로컬 상태의 Mysql에서 진행

3. 환경 설정은 과제의 버전을 최대한 따름
~~~


~~~
API 설명

1. POST /patients/upload

-> curl -X POST "http://localhost:3000/patients/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@patients.xlsx"

-> Excel 파일을 업로드하면, 중복 병합 조건에 따라 데이터를 변환 후 DB에 적재

응답

{"totalRows":49809,"processedRows":49503,"skippedRows":306}


2. GET /patients

-> curl -X GET "http://localhost:3000/patients"

기본적으로 페이지네이션 적용 (기본값: page=1, limit=10)

아래의 형태로 수정해서 사용가능능
"/patients?page=1&limit=20"  # 전체 목록 조회
"/patients?page=1&limit=20&name=이예원"  # 특정 이름 검색
"/patients?page=1&limit=20&phoneNumber=01043888387"  # 특정 전화번호 검색
"/patients?page=1&limit=20&chartNumber=850382"  # 특정 차트번호 검색


응답

{"total":49503,"page":1,"count":10,"data":[{"id":1,"name":"이예원","phoneNumber":"01018556059","idNumber":"870218-1","chartNumber":"95573","address":null,"memo":"수술 이력 있음"},{"id":2,"name":"김성진","phoneNumber":"01090915296","idNumber":"720426-0","chartNumber":"314809","address":"전라북도 양양군 삼성가 878-13","memo":"수술 이력 있음"},{"id":3,"name":"강은정","phoneNumber":"01024805928","idNumber":"810510-3","chartNumber":"817956","address":"충청북도 횡성군 압구정514길 298-12 (수민고읍)","memo":"고혈압"},{"id":4,"name":"홍민석","phoneNumber":"01064625874","idNumber":"880413-1","chartNumber":null,"address":"경기도 원주시 강남대길 524 (동현한마을)","memo":"약물 알레르기"},{"id":5,"name":"손영진","phoneNumber":"01019823849","idNumber":"580524-3","chartNumber":"228747","address":"전라북도 청주시 상당구 테헤란300거리 지하257","memo":null},{"id":6,"name":"이상호","phoneNumber":"01043888387","idNumber":"510114-1","chartNumber":"850382","address":"전라북도 삼척시 백제고분579가 196 (정자이최리)","memo":"약물 알레르기"},{"id":7,"name":"오성호","phoneNumber":"01023843526","idNumber":"510228-0","chartNumber":"45941","address":null,"memo":null},{"id":8,"name":"송도현","phoneNumber":"01067780972","idNumber":"850205-1","chartNumber":"263441","address":"경상북도 부천시 원미구 반포대67로 109 (상훈안김리)","memo":"알레르기 있음"},{"id":9,"name":"안영일","phoneNumber":"01012488325","idNumber":"821217-4","chartNumber":"930790","address":"전라남도 성남시 분당구 논현6로 146","memo":null},{"id":10,"name":"고정순","phoneNumber":"01075279326","idNumber":"771014-0","chartNumber":"765342","address":null,"memo":"특이사항 없음"}]}

~~~

~~~
부하 테스트
환경
CPU : AMD-5600X
RAM : 64GB
DB : MySQL 8.0 (local)
API 테스트 툴 : artillery


환자 목록 조회 API의 검색 및 페이지네이션 성능을 측정
여러 가지 필터(이름, 전화번호, 차트번호)로 검색 시 응답 속도와 처리량을 평가

테스트 시나리오
    전체 목록 조회: /patients?page=1&limit=20
    이름 검색: /patients?page=1&limit=20&name=이예원
    전화번호 검색: /patients?page=1&limit=20&phoneNumber=01043888387
    차트번호 검색: /patients?page=1&limit=20&chartNumber=850382

~~~