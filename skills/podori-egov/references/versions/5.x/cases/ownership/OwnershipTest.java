import java.util.HashMap;
import java.util.Map;

// Original in-memory policy tests; no eGov helper, HTTP, database, or framework execution.
public final class OwnershipTest {
    static int checks, failures;
    static OwnershipCase.Update update;
    static final OwnershipCase.Actor ALICE = new OwnershipCase.Actor("alice", false);
    static final OwnershipCase.Target A = new OwnershipCase.Target("a", "alice", "files-a", "old");
    static final OwnershipCase.Target B = new OwnershipCase.Target("b", "bob", "files-b", "other");

    static OwnershipCase.Input input(String lookup, String write, String owner, String attachment) {
        return new OwnershipCase.Input(lookup, write, owner, attachment, "edited");
    }

    static void check(String name, boolean ok) {
        checks++;
        if (!ok) failures++;
        System.out.println((ok ? "PASS " : "FAIL ") + name);
    }

    static OwnershipCase.Store store(OwnershipCase.Target target) {
        var db = new OwnershipCase.Store();
        if (target != null) db.rows.put("a", target);
        db.rows.put("b", B);
        return db;
    }

    static void denied(String name, OwnershipCase.Actor actor,
                       OwnershipCase.Target target, OwnershipCase.Input request) {
        var db = store(target);
        Map<String, OwnershipCase.Target> before = new HashMap<>(db.rows);
        boolean denied = false;
        try { update.apply(actor, db, request); } catch (SecurityException expected) { denied = true; }
        check(name, denied && db.writes == 0 && before.equals(db.rows));
    }

    static void allowed(String name, OwnershipCase.Actor actor,
                        OwnershipCase.Target target, OwnershipCase.Input request) {
        var db = store(target);
        boolean accepted = true;
        try { update.apply(actor, db, request); } catch (SecurityException unexpected) { accepted = false; }
        var expected = new OwnershipCase.Target(target.id(), target.owner(), target.attachment(), "edited");
        check(name, accepted && db.writes == 1 && db.rows.equals(Map.of("a", expected, "b", B)));
    }

    public static void main(String[] args) {
        if (args.length != 1) throw new IllegalArgumentException("Use vulnerable or fixed");
        update = OwnershipCase.variant(args[0]);
        var normal = input("a", "a", "alice", "files-a");
        denied("forged request owner", new OwnershipCase.Actor("mallory", false), A,
                input("a", "a", "mallory", "files-a"));
        denied("other owner", new OwnershipCase.Actor("mallory", false), A, normal);
        denied("nonowner admin", new OwnershipCase.Actor("mallory", true), A, normal);
        denied("missing principal", null, A, normal);
        for (String missing : new String[] {null, "", " "}) {
            denied("invalid principal id: " + missing, new OwnershipCase.Actor(missing, false), A,
                    input("a", "a", missing, "files-a"));
            denied("invalid target id: " + missing, ALICE, A, input(missing, "a", "alice", "files-a"));
            denied("invalid stored id: " + missing, ALICE,
                    new OwnershipCase.Target(missing, "alice", "files-a", "old"), normal);
            denied("invalid stored owner: " + missing, ALICE,
                    new OwnershipCase.Target("a", missing, "files-a", "old"), normal);
        }
        denied("missing target", ALICE, null, normal);
        denied("lookup/stored identity mismatch", ALICE,
                new OwnershipCase.Target("b", "alice", "files-a", "old"), normal);
        allowed("normal owner", ALICE, A, normal);
        allowed("owning admin", new OwnershipCase.Actor("alice", true), A, normal);
        allowed("forged mutation and attachment ids ignored", ALICE, A,
                input("a", "b", "alice", "files-b"));
        allowed("untrusted claims unnecessary", ALICE, A, input("a", null, null, null));
        allowed("null stored attachment preserved", ALICE,
                new OwnershipCase.Target("a", "alice", null, "old"), input("a", "a", "alice", "files-b"));
        System.out.printf("%s checks=%d passed=%d failed=%d%n", args[0], checks, checks - failures, failures);
        if (failures != 0) System.exit(1);
    }
}
