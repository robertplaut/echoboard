-- This script generates sample notes for every user for the past 30 days.
INSERT INTO public.notes (
  user_id,
  date,
  yesterday_text,
  today_text,
  blockers_text,
  learnings_text
)
SELECT
  u.id AS user_id,
  -- Generate a series of dates from 30 days ago until today
  generated_date::date,

  -- Create dynamic text for the 'yesterday' field
  'Yesterday I completed the final integration for the checkout feature and merged PR #123. Also had a sync with ' || u.display_name || ' about the upcoming API changes.',

  -- Create dynamic text for the 'today' field
  'Today I will be focusing on setting up the new testing environment and reviewing code from the team. The main goal is to resolve ticket #456.',

  -- Randomly add a blocker for about 30% of the notes
  CASE
    WHEN random() > 0.7 THEN 'Blocked by the design team''s feedback on the new mockups.'
    ELSE NULL
  END,

  -- Randomly add a learning for about 50% of the notes
  CASE
    WHEN random() > 0.5 THEN 'Learned a new, more efficient way to write SQL queries using window functions.'
    ELSE NULL
  END

FROM
  -- Get all users from the users table
  public.users u,
  -- Create a row for each day in the last 30 days
  generate_series(
    NOW() - interval '30 days',
    NOW(),
    '1 day'
  ) AS generated_date;