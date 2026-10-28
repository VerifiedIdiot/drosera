# eGovFrame 4.x

Source baseline: runtime `v4.0.0-Final`, common components `v4.0.0`.
Read [XML rules](../xml-security.md) and [local cases](cases/csrf/README.en.md).

The runtime security module declares `org.egovframe.rte:org.egovframe.rte.fdl.security:4.0.0` and `javax.servlet-api:3.1.0`.
The common configuration uses `egov-security-4.0.0.xsd` and `spring-security.xsd`.
Its eGov namespace remains `http://maven.egovframe.go.kr/schema/egov-security`.

For approved 3.x migrations, reconcile runtime coordinates/imports without blanket `egovframework.*` replacement.
Preserve application classes such as `egovframework.com.sec.security.common.EgovSessionMapping`.
Do not infer Jakarta compatibility or active CSRF protection from the 4.x label.

## Sources

These exact revisions establish the baseline, not all 4.x releases.

- [Runtime security POM](https://github.com/eGovFramework/egovframe-runtime/blob/ab5bef1981abbff9ebd31929602e6f44b98d8932/Foundation/org.egovframe.rte.fdl.security/pom.xml)
- [Common security configuration](https://github.com/eGovFramework/egovframe-common-components/blob/33edbb547e47f3d69bbc415d3f31fd1cba3f44f8/src/main/resources/egovframework/spring/com/context-security.xml)
