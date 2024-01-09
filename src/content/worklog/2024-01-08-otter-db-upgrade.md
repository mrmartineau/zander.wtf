---
title: Otter database upgrade
date: 2024-01-08
---

I updated Otter's PostgreSQL database to version 15 through the Supabase dashboard. There was an issue with the database migration, I wasn't able to add new items anymore. After a bit of searching, I [found out](https://github.com/supabase/supabase/issues/4883#issuecomment-1818421081) that the `pg_net` extension was the cause of the issue. To fix I had to disable it then re-enable it in the "Database extensions" section of the Supabase dashboard.
