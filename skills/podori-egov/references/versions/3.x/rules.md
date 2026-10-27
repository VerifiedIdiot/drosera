# eGovFrame 3.x

Source baseline: runtime `v3.10.0`, common components `v3.10.0`.
Read [XML rules](../xml-security.md) and [local cases](cases/csrf/README.md).

The runtime security module declares `egovframework.rte:egovframework.rte.fdl.security:3.10.0` and `javax.servlet-api:3.1.0`.
The common configuration uses `egov-security-3.10.0.xsd` and `spring-security-4.2.xsd`.
Its eGov namespace is `http://maven.egovframe.go.kr/schema/egov-security`.

Keep runtime imports under `egovframework.rte` for this baseline.
Do not apply 4.x coordinates or 5.x helper calls without a separately verified migration.
Preserve application classes such as `egovframework.com.sec.security.common.EgovSessionMapping`.

## Sources

These exact revisions establish the baseline, not all 3.x releases.

- [Runtime security POM](https://github.com/eGovFramework/egovframe-runtime/blob/a4b35d692ab1289d3f28b82afa43ed12a29497cb/Foundation/egovframework.rte.fdl.security/pom.xml)
- [Common security configuration](https://github.com/eGovFramework/egovframe-common-components/blob/aaebaa524baef45e391c54506a316b614a09f99d/src/main/resources/egovframework/spring/com/context-security.xml)
