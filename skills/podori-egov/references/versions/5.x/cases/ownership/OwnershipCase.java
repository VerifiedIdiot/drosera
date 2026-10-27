import java.util.HashMap;
import java.util.Map;

// Original owner-only policy model inspired by common-components v5.0.7 semantics.
// Actor comes from trusted authentication; request claims are attacker-controlled.
public final class OwnershipCase {
    record Actor(String uniqueId, boolean admin) {}
    record Target(String id, String owner, String attachment, String title) {}
    record Input(String lookupId, String writeId, String claimedOwner, String attachment, String title) {}

    static final class Store {
        final Map<String, Target> rows = new HashMap<>();
        int writes;
        void save(Target value) { rows.put(value.id(), value); writes++; }
    }
    interface Update { void apply(Actor actor, Store db, Input input); }

    static Update variant(String name) {
        return switch (name) {
            case "vulnerable" -> OwnershipCase::vulnerable;
            case "fixed" -> OwnershipCase::fixed;
            default -> throw new IllegalArgumentException("Use vulnerable or fixed");
        };
    }

    static boolean missing(String value) { return value == null || value.isBlank(); }

    // Trusted immutable snapshot supplies both authorization and mutation identities.
    static void fixed(Actor actor, Store db, Input input) {
        if (actor == null || missing(actor.uniqueId()) || input == null || missing(input.lookupId()))
            throw new SecurityException("Denied");
        final Target saved = db.rows.get(input.lookupId());
        if (saved == null || missing(saved.id()) || !saved.id().equals(input.lookupId())
                || missing(saved.owner()) || !saved.owner().equals(actor.uniqueId()))
            throw new SecurityException("Denied");
        // No admin bypass; request owner, write ID, and attachment ID never reach storage.
        db.save(new Target(saved.id(), saved.owner(), saved.attachment(), input.title()));
    }

    // Wrong: request-controlled ownership, admin bypass, and mutation/attachment identities.
    static void vulnerable(Actor actor, Store db, Input input) {
        Target saved = db.rows.get(input.lookupId());
        if (actor == null || actor.uniqueId() == null || saved == null
                || (!actor.admin() && !actor.uniqueId().equals(input.claimedOwner())))
            throw new SecurityException("Denied");
        db.save(new Target(input.writeId(), saved.owner(), input.attachment(), input.title()));
    }
}
