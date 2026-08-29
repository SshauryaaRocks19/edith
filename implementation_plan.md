# Fix Static Problems, Add Problem Selection, and Integrate Supabase

We need to make significant architectural additions to Edith to support problem selection, persistence of solved states using Supabase, and to fix the static test case execution.

## User Review Required

> [!IMPORTANT]
> **Supabase Setup Required:** To track solved states permanently, you will need to create a free [Supabase](https://supabase.com/) project. 
> 
> You will need to add the following to your `.env.local`:
> - `NEXT_PUBLIC_SUPABASE_URL`
> - `SUPABASE_SERVICE_ROLE_KEY` (We will use the service role key on the server-side to bypass RLS for now, keyed by the Clerk `userId`).
> 
> You will also need to run a simple SQL script in the Supabase SQL Editor to create the `user_progress` table:
> ```sql
> create table user_progress (
>   id uuid default uuid_generate_v4() primary key,
>   user_id text not null,
>   company text not null,
>   problem_title text not null,
>   status text not null, -- 'solved' or 'attempted'
>   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
>   unique(user_id, company, problem_title)
> );
> ```

## Open Questions

> [!WARNING]
> 1. The prebuilt problems currently lack **Starter Code** and **Test Cases** because the original generator script was instructed specifically *not* to generate them to save Gemini tokens. To fix execution for these 30 problems, do you want me to write a script to re-generate them (which will cost more API quota), or should I build an AI auto-generator in the UI that uses Gemini to instantly create the test cases and starter code on-the-fly when the user clicks "Start Practicing"?

## Proposed Changes

### Database & State Management

#### [NEW] `src/lib/supabase.ts`
- Initialize the Supabase client using `@supabase/supabase-js`.

#### [NEW] `src/app/api/progress/route.ts`
- Create a Next.js API route to fetch a user's solved problems, and to mark a problem as solved when the execution API returns a success.

### Routing & UI

#### [NEW] `src/app/problem-sets/[company]/page.tsx`
- Create a new intermediate screen that lists all 15 problems for a specific company.
- Fetch the user's progress from the `progress` API and display a "Solved" or "Unsolved" badge next to each problem.
- Clicking a problem will route to `/find-problems?company={company}&problemIndex={index}&mode=static`.

#### [MODIFY] `src/app/problem-sets/page.tsx`
- Update the "Start Practicing" button to route to `/problem-sets/[company]` instead of directly to `/find-problems`.

#### [MODIFY] `src/app/find-problems/page.tsx`
- Update the `useEffect` to parse `problemIndex` from the URL to load the specific problem selected by the user.

#### [MODIFY] `src/components/find-problems/LeetCodeView.tsx`
- Add "Next Problem" and "Previous Problem" buttons to the top/bottom navigation when in static mode.
- Trigger the `/api/progress` route to mark the problem as solved when `handleRunCode` evaluates all test cases successfully.

## Verification Plan

### Manual Verification
- Ensure navigating to `/problem-sets/Meta` displays a beautiful list of 15 problems.
- Ensure clicking one loads it properly in the IDE.
- Ensure executing and passing the problem updates Supabase and reflects a "Solved" state on the list page.
