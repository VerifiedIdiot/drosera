# 3.x CSRF 설정 사례

한국어 안내 | [English](README.en.md)

세션·쿠키로 인증하는 변경 요청에 적용합니다. 동등한 외부 CSRF 보호가 없는 경우를 대상으로 합니다.
공통컴포넌트 기준: `v3.10.0`, `aaebaa524baef45e391c54506a316b614a09f99d`.
실행환경 기준: `v3.10.0`, `a4b35d692ab1289d3f28b82afa43ed12a29497cb`.
출처: `context-security.xml`과 `EgovSecurityConfigBeanDefinitionParser.java`.
이 설정 조각은 불완전한 구성이며 배포용 템플릿이 아닙니다.
7개 설정 검증 항목으로 네임스페이스, 기준 XSD 문자열, 기존 속성 보존, DTD 거부와 CSRF를 확인합니다.
스키마 검증이나 Spring·필터 체인 시험은 아닙니다.
파서는 DTD와 외부 엔티티를 거부합니다. XSD URL에 접근하지 않습니다.

이미 설치한 JDK 17 이상을 `JAVA_HOME`으로 지정합니다.
`PODORI_CASE_OUT`은 프로젝트 밖의 승인된 임시 디렉터리로 지정합니다.
이 사례 디렉터리에서 다음 명령을 실행합니다.

```sh
JDK="${JAVA_HOME:?Set JAVA_HOME}/bin"
OUT="${PODORI_CASE_OUT:?Set PODORI_CASE_OUT}/3.x"
mkdir -p "$OUT"
"$JDK/javac" --release 17 -encoding UTF-8 -Xlint:all -Werror -d "$OUT" CsrfConfigTest.java
"$JDK/java" -Xmx64m -cp "$OUT" CsrfConfigTest vulnerable
"$JDK/java" -Xmx64m -cp "$OUT" CsrfConfigTest fixed
```

기대 결과: 취약본은 RED, 6/7 통과, 종료 코드 1입니다. 수정본은 GREEN, 7/7 통과, 종료 코드 0입니다.
토큰 누락·위조·정상 토큰, 세션, 로그인·로그아웃, AJAX, multipart 요청은 프로젝트 통합 시험에서 별도로 검증해야 합니다.
