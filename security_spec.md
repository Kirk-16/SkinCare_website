# Security Specification for Aura Glow

## Data Invariants
- A user can only write to their own profile and wishlist.
- User email must be verified for all writes.
- Reviews can only be written by signed-in users with their own UID.
- Document IDs must be valid (no injection).
- String sizes must be constrained.

## The Dirty Dozen (Attack Scenarios)
1. **Unauthorized Profile Update**: User A tries to update User B's profile.
2. **Missing Field Creation**: User tries to create a profile without a UID.
3. **Ghost Field Injection**: User tries to add `isAdmin: true` to their profile.
4. **Unverified Write**: User with unverified email tries to post a review.
5. **ID Poisoning**: User tries to create a wishlist item with a 1MB string as ID.
6. **Time Spoofing**: User tries to set `createdAt` to a past date instead of `request.time`.
7. **Cross-User Wishlist**: User A tries to add an item to User B's wishlist subcollection.
8. **Rating Poisoning**: User tries to set a rating of 100 on a product (must be 1-5).
9. **Review Hijacking**: User tries to update someone else's review.
10. **Orphaned Review**: User tries to create a review for a non-existent product path (though products are static, path masking could be tried).
11. **Massive Comment**: User tries to post a 1MB comment in a review.
12. **Public Data Scraping**: Unauthenticated user tries to list all user emails.

## Test Runner (Conceptual Plan)
- Tests will verify `allow` logic for all collections based on `request.auth.uid` and `verified` status.
- Exact key matching will be enforced on creation.
- `affectedKeys().hasOnly()` will be used for updates.
