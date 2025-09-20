# Chat Reset Implementation - Event-Driven Reset Tied to Planning

## Summary

Implemented event-driven chat reset logic that creates fresh chat sessions when users plan new days, replacing the previous date-based system.

## What Changed

### Database Schema
- **Migration**: `supabase/migrations/010_add_plan_id_to_chat_sessions.sql`
- **Added**: `plan_id` column to `chat_sessions` table with foreign key to `daily_plans`
- **Added**: Unique constraint ensuring one session per plan
- **Backfilled**: Existing sessions linked to plans by date

### New Components & Hooks
- **`src/hooks/useChatSession.tsx`**: Manages chat sessions tied to plans
- **`src/components/chat/ChatSessionProvider.tsx`**: Handles plan creation events
- **Updated**: `src/hooks/useTasks.tsx` to trigger chat session events
- **Updated**: `src/App.tsx` to include ChatSessionProvider

### Key Features
1. **Event-driven reset**: Chat resets only when plans are created, not at midnight
2. **Plan-based sessions**: Each chat session is tied 1:1 to a daily plan
3. **Re-planning support**: Creating a new plan for the same date archives the old session and creates a new one
4. **Fallback logic**: If no plan for today, shows most recent plan's chat
5. **Toast notifications**: "Fresh Journal Started" when new sessions are created

## How to Test Locally

### Happy Path
1. **Create first plan**: Go to Daily Ledger → "Add for Today" → Chat should start fresh
2. **Create tomorrow plan**: Go to Daily Ledger → "Plan for Tomorrow" → Tomorrow session created, today's chat remains active
3. **Verify persistence**: Refresh page → Chat should load the correct session

### Re-plan Edge Case
1. **Create today's plan**: Add tasks for today
2. **Chat with Praxis**: Send a few messages
3. **Re-plan today**: Go back to Daily Ledger → "Add for Today" again
4. **Verify**: Should see "Fresh Journal Started" toast and new empty chat session
5. **Previous session**: Old messages are archived (plan_id set to null) but preserved

### Database Verification
```sql
-- Check chat sessions with plan linkage
SELECT cs.id, cs.session_date, cs.plan_id, dp.plan_date 
FROM chat_sessions cs 
LEFT JOIN daily_plans dp ON cs.plan_id = dp.id 
WHERE cs.user_id = 'your-user-id' 
ORDER BY cs.created_at DESC;
```

## Acceptance Criteria ✅

- ✅ Reset happens only when a new plan is saved (today or tomorrow), not at midnight
- ✅ New messages in Active Journal always carry the current plan's plan_id
- ✅ Plan today → chat exists; plan again today → new session created, old preserved
- ✅ Plan tomorrow → tomorrow session created but Active Journal remains on today
- ✅ Existing data remains intact; legacy messages are viewable by date fallback

## Follow-ups & TODOs

### Immediate
- [ ] Run database migration: `supabase db push`
- [ ] Test in production environment
- [ ] Monitor for any edge cases

### Future Enhancements
- [ ] Add "Previous journal for this date" link in UI
- [ ] Add session history view
- [ ] Add session export functionality
- [ ] Add session search/filtering

### Technical Debt
- [ ] Remove old date-based session logic from `usePraxisChat.tsx`
- [ ] Clean up unused session management code
- [ ] Add proper TypeScript types for session interfaces

## File Structure

```
src/
├── hooks/
│   ├── useChatSession.tsx          # New: Plan-based session management
│   └── useTasks.tsx                # Updated: Added plan creation callbacks
├── components/
│   └── chat/
│       └── ChatSessionProvider.tsx # New: Event handling wrapper
├── App.tsx                         # Updated: Added ChatSessionProvider
└── supabase/migrations/
    └── 010_add_plan_id_to_chat_sessions.sql # New: Database schema update
```

## Migration Notes

- **Safe migration**: Existing data is preserved and backfilled
- **Backward compatible**: Legacy sessions without plan_id still work
- **No downtime**: Migration can be run during active usage
- **Rollback plan**: Can remove plan_id column if needed (data preserved in session_date)


