# 5.x ownership policy case

Applies to owner-only updates modeled from common-components `v5.0.7`, commit `7912e13ca5a064a4dc81d5772582f928e985e653`.
Sources: `EgovAuthorizationHelper.java:194–255` and `EgovArticleController.java:625–686`.
This original policy model does not execute `EgovAuthorizationHelper`, Spring, HTTP, or a database.
The same 23 assertions cover denied writes, owner/admin boundaries, invalid identities, normal updates, and stored target/attachment binding.
Immutable records bind authorization and writes to stored identities. Request claims do not select the owner, mutation target, or attachment.

Use an existing JDK 17 or later through `JAVA_HOME`.
Set `PODORI_CASE_OUT` to an approved temporary directory outside the project.
Run from this case directory:

```sh
JDK="${JAVA_HOME:?Set JAVA_HOME}/bin"
OUT="${PODORI_CASE_OUT:?Set PODORI_CASE_OUT}/5.x"
mkdir -p "$OUT"
"$JDK/javac" --release 17 -encoding UTF-8 -Xlint:all -Werror -d "$OUT" OwnershipCase.java OwnershipTest.java
"$JDK/java" -Xmx64m -cp "$OUT" OwnershipTest vulnerable
"$JDK/java" -Xmx64m -cp "$OUT" OwnershipTest fixed
```

Expected: vulnerable RED, 9/23 passing, exit 1. Fixed GREEN, 23/23 passing, exit 0.
Project integration tests remain required for authenticated principals, helper wiring, HTTP denials, DAO identity, transactions, and concurrent updates.
