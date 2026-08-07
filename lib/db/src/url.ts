/**
 * Resolves the database connection string.
 *
 * Prefers SUPABASE_DATABASE_URL over the runtime-managed DATABASE_URL.
 * Supabase's direct host (db.<ref>.supabase.co) is IPv6-only, which this
 * environment cannot reach; when SUPABASE_POOLER_HOST is set, the URL is
 * rewritten to the session pooler (IPv4) with the pooler username format
 * `postgres.<ref>`.
 */
export function resolveDatabaseUrl(): string | undefined {
  const supabase = process.env.SUPABASE_DATABASE_URL;
  if (!supabase) return process.env.DATABASE_URL;

  const poolerHost = process.env.SUPABASE_POOLER_HOST;
  const match = supabase.match(
    /^postgresql:\/\/([^:]+):(.*)@db\.([a-z0-9]+)\.supabase\.co(:\d+)?\/(.*)$/,
  );
  if (poolerHost && match) {
    const [, user, password, ref, , dbName] = match;
    return `postgresql://${user}.${ref}:${password}@${poolerHost}:5432/${dbName}`;
  }
  return supabase;
}
