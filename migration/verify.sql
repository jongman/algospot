\set ON_ERROR_STOP on

SELECT current_database() AS database,
       current_setting('server_version') AS server_version,
       pg_size_pretty(pg_database_size(current_database())) AS database_size;

SELECT 'auth_user' AS table_name, count(*) AS rows FROM auth_user
UNION ALL
SELECT 'base_userprofile', count(*) FROM base_userprofile
UNION ALL
SELECT 'judge_problem', count(*) FROM judge_problem
UNION ALL
SELECT 'judge_solver', count(*) FROM judge_solver
UNION ALL
SELECT 'judge_submission', count(*) FROM judge_submission
UNION ALL
SELECT 'newsfeed_activity', count(*) FROM newsfeed_activity
UNION ALL
SELECT 'django_session', count(*) FROM django_session
ORDER BY table_name;

SELECT schemaname,
       relname,
       n_live_tup AS estimated_rows,
       pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 20;

SELECT count(*) AS profiles_without_user
FROM base_userprofile profile
LEFT JOIN auth_user account ON account.id = profile.user_id
WHERE account.id IS NULL;

SELECT count(*) AS submissions_without_problem
FROM judge_submission submission
LEFT JOIN judge_problem problem ON problem.id = submission.problem_id
WHERE problem.id IS NULL;

SELECT count(*) AS invalid_constraints
FROM pg_constraint
WHERE NOT convalidated;

SELECT count(*) AS invalid_indexes
FROM pg_index
WHERE NOT indisvalid;
