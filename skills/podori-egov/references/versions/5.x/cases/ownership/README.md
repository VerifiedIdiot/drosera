# 5.x 소유권 정책 사례

한국어 안내 | [English](README.en.md)

공통컴포넌트 `v5.0.7`, 커밋 `7912e13ca5a064a4dc81d5772582f928e985e653`을 기준으로 모델링한 소유자 전용 수정에 적용합니다.
출처: `EgovAuthorizationHelper.java:194–255`와 `EgovArticleController.java:625–686`.
이 정책 모델은 `EgovAuthorizationHelper`, Spring, HTTP 또는 데이터베이스를 실행하지 않습니다.
동일한 23개 검증 항목으로 쓰기 거부, 소유자·관리자 경계, 잘못된 식별 정보, 정상 수정과 저장된 대상·첨부파일의 연결을 확인합니다.
불변 레코드가 권한 검사와 쓰기를 저장된 식별 정보에 연결합니다. 요청에서 주장한 값으로 소유자, 수정 대상 또는 첨부파일을 선택하지 않습니다.

이미 설치한 JDK 17 이상을 `JAVA_HOME`으로 지정합니다.
`PODORI_CASE_OUT`은 프로젝트 밖의 승인된 임시 디렉터리로 지정합니다.
이 사례 디렉터리에서 다음 명령을 실행합니다.

```sh
JDK="${JAVA_HOME:?Set JAVA_HOME}/bin"
OUT="${PODORI_CASE_OUT:?Set PODORI_CASE_OUT}/5.x"
mkdir -p "$OUT"
"$JDK/javac" --release 17 -encoding UTF-8 -Xlint:all -Werror -d "$OUT" OwnershipCase.java OwnershipTest.java
"$JDK/java" -Xmx64m -cp "$OUT" OwnershipTest vulnerable
"$JDK/java" -Xmx64m -cp "$OUT" OwnershipTest fixed
```

기대 결과: 취약본은 RED, 9/23 통과, 종료 코드 1입니다. 수정본은 GREEN, 23/23 통과, 종료 코드 0입니다.
인증된 주체, 헬퍼 연결, HTTP 요청 거부, DAO의 식별 정보, 트랜잭션과 동시 수정은 프로젝트 통합 시험에서 별도로 검증해야 합니다.
