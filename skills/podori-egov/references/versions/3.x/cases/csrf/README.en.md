# 3.x CSRF configuration case

[한국어 안내](README.md) | English

Applies to session/cookie-authenticated mutations without equivalent external CSRF protection.
Common-components baseline: `v3.10.0`, `aaebaa524baef45e391c54506a316b614a09f99d`.
Runtime baseline: `v3.10.0`, `a4b35d692ab1289d3f28b82afa43ed12a29497cb`.
Sources: `context-security.xml` and `EgovSecurityConfigBeanDefinitionParser.java`.
These original fragments are incomplete configurations, not deployment templates.
Seven configuration assertions cover namespaces, baseline XSD strings, unchanged attributes, DTD rejection, and CSRF.
These are not schema-validation or Spring/filter-chain tests.
The parser rejects DTDs and external entities. It does not fetch XSD URLs.

Use an existing JDK 17 or later through `JAVA_HOME`.
Set `PODORI_CASE_OUT` to an approved temporary directory outside the project.
Run from this case directory:

```sh
JDK="${JAVA_HOME:?Set JAVA_HOME}/bin"
OUT="${PODORI_CASE_OUT:?Set PODORI_CASE_OUT}/3.x"
mkdir -p "$OUT"
"$JDK/javac" --release 17 -encoding UTF-8 -Xlint:all -Werror -d "$OUT" CsrfConfigTest.java
"$JDK/java" -Xmx64m -cp "$OUT" CsrfConfigTest vulnerable
"$JDK/java" -Xmx64m -cp "$OUT" CsrfConfigTest fixed
```

Expected: vulnerable RED, 6/7 passing, exit 1. Fixed GREEN, 7/7 passing, exit 0.
Project integration tests remain required for missing/forged/valid tokens, sessions, login/logout, AJAX, and multipart requests.
