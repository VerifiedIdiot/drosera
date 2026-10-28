# eGovFrame 5.x

Source baseline: runtime `v5.0.2-Final`, common components `v5.0.7`.
Read [local cases](cases/ownership/README.en.md).
Do not infer resolved runtime versions from the common-component parent POM.

| ID | Inspect and correct | Required project tests |
|---|---|---|
| V51 | Trace the effective `egov-security-config.properties`, overrides, authentication mode, and filter registration. | Verify loaded values. For automatically authenticated browser mutations, verify CSRF rejection and valid requests. |
| V52 | Trace `permitAllList`, its actual matcher types, DB roles, rule order, and every active authorization filter. | Deny unauthorized direct requests while preserving public routes. A public matcher alone does not prove complete bypass. |
| V53 | For `@RequireAdmin`, verify the aspect, controller context, proxy interception, and role check before the action. | Deny anonymous and ordinary users. Allow authorized administrators. Do not require this annotation where equivalent protection exists. |
| V54 | Authorize the stored target before mutation. Keep the verified ID and stored attachment identity bound to downstream operations. | Reject forged owners, alternate target IDs, and foreign attachments without side effects. Preserve owner updates. |
| V55 | Match `EgovAuthorizationHelper` methods to the intended policy. Enforce predicate results or use the corresponding assertion. | Test absent users/targets/owners and identifier types. Preserve owner-only denial for other-user administrators. |

The common configuration sets `csrf=true`, but the runtime reader's fallback sets it false.
Inspect actual configuration load failures rather than assume the packaged value applies.
`assertOwner` uses the unique ID. `assertOwnerById` uses the login ID.
`assertAdminOrOwner` permits administrators. Owner-only assertions do not grant that exception.
Check helper availability and implementation before use on another patch level.
Seed SQL or a version label does not prove deployed DB permissions.

## Sources

These revisions establish the inspected controls, not all 5.x releases.

- [Common properties](https://github.com/eGovFramework/egovframe-common-components/blob/7912e13ca5a064a4dc81d5772582f928e985e653/src/main/resources/egovframework/egovProps/conf/egov-security-config.properties)
- [Authorization helper](https://github.com/eGovFramework/egovframe-common-components/blob/7912e13ca5a064a4dc81d5772582f928e985e653/src/main/java/egovframework/com/cmm/util/EgovAuthorizationHelper.java)
- [MVC aspect](https://github.com/eGovFramework/egovframe-common-components/blob/7912e13ca5a064a4dc81d5772582f928e985e653/src/main/webapp/WEB-INF/config/egovframework/springmvc/egov-com-loginaop.xml)
- [Article update](https://github.com/eGovFramework/egovframe-common-components/blob/7912e13ca5a064a4dc81d5772582f928e985e653/src/main/java/egovframework/com/cop/bbs/web/EgovArticleController.java#L625-L686)
- [Filter configuration](https://github.com/eGovFramework/egovframe-runtime/blob/8f47a567ec4a8d3969f423c195115648cf562ae0/Foundation/org.egovframe.rte.fdl.security/src/main/java/org/egovframe/rte/fdl/security/config/EgovSecurityConfiguration.java)
- [Configuration reader](https://github.com/eGovFramework/egovframe-runtime/blob/8f47a567ec4a8d3969f423c195115648cf562ae0/Foundation/org.egovframe.rte.fdl.security/src/main/java/org/egovframe/rte/fdl/security/config/EgovSecurityConfigReader.java)
