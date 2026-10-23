import { supabase, isSupabaseConfigured } from './supabase';

export interface DiagnosticResult {
  id: string;
  name: string;
  category: 'auth' | 'role' | 'table';
  status: 'pass' | 'fail' | 'warning';
  message: string;
  durationMs?: number;
}

export async function runPermissionDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  if (!isSupabaseConfigured || !supabase) {
    results.push({
      id: 'supabase_config',
      name: 'Supabase Connection',
      category: 'auth',
      status: 'fail',
      message: 'Supabase client is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    });
    return results;
  }

  const client = supabase;

  // 1. Check Authenticated Session
  let activeUser: any = null;
  const startAuth = performance.now();
  try {
    const { data: { user }, error: authError } = await client.auth.getUser();
    const durationMs = Math.round(performance.now() - startAuth);
    if (authError || !user) {
      results.push({
        id: 'auth_session',
        name: 'Supabase Auth Session',
        category: 'auth',
        status: 'fail',
        message: authError?.message || 'Not logged in. You must authenticate first.',
        durationMs,
      });
      return results;
    }
    activeUser = user;
    results.push({
      id: 'auth_session',
      name: 'Supabase Auth Session',
      category: 'auth',
      status: 'pass',
      message: `Logged in as ${user.email} (User UUID: ${user.id.substring(0, 8)}...)`,
      durationMs,
    });
  } catch (err: any) {
    results.push({
      id: 'auth_session',
      name: 'Supabase Auth Session',
      category: 'auth',
      status: 'fail',
      message: err?.message || 'Failed checking auth status',
    });
    return results;
  }

  // 2. Check public.admins Membership & Role
  const startAdmin = performance.now();
  let userRole = 'none';
  try {
    const { data: adminRecord, error: adminError } = await client
      .from('admins')
      .select('user_id, email, role')
      .eq('user_id', activeUser.id)
      .maybeSingle();

    const durationMs = Math.round(performance.now() - startAdmin);
    if (adminError) {
      results.push({
        id: 'admin_record',
        name: 'Admins Table Record',
        category: 'role',
        status: 'fail',
        message: `Query failed: ${adminError.message}. Make sure the admins table and RLS policies are created.`,
        durationMs,
      });
    } else if (!adminRecord) {
      results.push({
        id: 'admin_record',
        name: 'Admins Table Record',
        category: 'role',
        status: 'fail',
        message: `User ${activeUser.email} is NOT registered in public.admins. All table writes will be rejected by RLS!`,
        durationMs,
      });
    } else {
      userRole = adminRecord.role || 'editor';
      results.push({
        id: 'admin_record',
        name: 'Admins Table Record',
        category: 'role',
        status: 'pass',
        message: `Registered as '${userRole}' (${adminRecord.email || activeUser.email})`,
        durationMs,
      });
    }
  } catch (err: any) {
    results.push({
      id: 'admin_record',
      name: 'Admins Table Record',
      category: 'role',
      status: 'fail',
      message: err?.message || 'Error querying admins table',
    });
  }

  // Helper to test write & delete probe on a table
  const testTableWrite = async (
    table: string,
    insertPayload: any,
    primaryKeyField: string,
    primaryKeyValue: any
  ): Promise<DiagnosticResult> => {
    const start = performance.now();
    try {
      // 1. Attempt insert / upsert with .select()
      const { data: insData, error: insErr } = await client
        .from(table)
        .upsert(insertPayload)
        .select();

      if (insErr) {
        return {
          id: `table_${table}`,
          name: `Table: ${table}`,
          category: 'table',
          status: 'fail',
          message: `Write blocked: ${insErr.message}`,
          durationMs: Math.round(performance.now() - start),
        };
      }

      if (!insData || insData.length === 0) {
        return {
          id: `table_${table}`,
          name: `Table: ${table}`,
          category: 'table',
          status: 'fail',
          message: `Write blocked: 0 rows returned. RLS check failed.`,
          durationMs: Math.round(performance.now() - start),
        };
      }

      // 2. Clean up probe row
      await client.from(table).delete().eq(primaryKeyField, primaryKeyValue).select();

      return {
        id: `table_${table}`,
        name: `Table: ${table}`,
        category: 'table',
        status: 'pass',
        message: `Write & delete verified with .select()`,
        durationMs: Math.round(performance.now() - start),
      };
    } catch (err: any) {
      return {
        id: `table_${table}`,
        name: `Table: ${table}`,
        category: 'table',
        status: 'fail',
        message: err?.message || 'Write probe failed',
        durationMs: Math.round(performance.now() - start),
      };
    }
  };

  const probeTimestamp = Date.now();

  // 3. Test projects
  const probeProjectId = `__probe_${probeTimestamp}`;
  results.push(
    await testTableWrite(
      'projects',
      {
        id: probeProjectId,
        type: 'short',
        title: 'Permission Diagnostic Probe',
        category: 'Diagnostic',
        video_url: 'https://youtu.be/8YkP5xLwlis',
        thumbnail_url: 'https://img.youtube.com/vi/8YkP5xLwlis/hqdefault.jpg',
        visible: false,
        sort_order: 9999,
      },
      'id',
      probeProjectId
    )
  );

  // 4. Test testimonials
  const probeTestimonialId = `__probe_${probeTimestamp}`;
  results.push(
    await testTableWrite(
      'testimonials',
      {
        id: probeTestimonialId,
        name: 'Probe Testimonial',
        role: 'Tester',
        quote: 'Diagnostics quote',
        visible: false,
        sort_order: 9999,
      },
      'id',
      probeTestimonialId
    )
  );

  // 5. Test faqs
  const probeFaqId = `__probe_${probeTimestamp}`;
  results.push(
    await testTableWrite(
      'faqs',
      {
        id: probeFaqId,
        question: 'Probe FAQ?',
        answer: 'Probe answer.',
        visible: false,
        sort_order: 9999,
      },
      'id',
      probeFaqId
    )
  );

  // 6. Test tools
  const probeToolId = `__probe_${probeTimestamp}`;
  results.push(
    await testTableWrite(
      'tools',
      {
        id: probeToolId,
        name: 'Probe Tool',
        logo_url: '/tools/premiere-pro.png',
        short_description: 'Probe tool proficiency',
        visible: false,
        sort_order: 9999,
      },
      'id',
      probeToolId
    )
  );

  // 7. Test site_settings
  const probeSettingKey = `__probe_${probeTimestamp}`;
  results.push(
    await testTableWrite(
      'site_settings',
      {
        key: probeSettingKey,
        value: { probe: true, timestamp: probeTimestamp },
      },
      'key',
      probeSettingKey
    )
  );

  // 8. Test site_text
  const probeTextKey = `__probe_${probeTimestamp}`;
  results.push(
    await testTableWrite(
      'site_text',
      {
        key: probeTextKey,
        value: 'probe text value',
      },
      'key',
      probeTextKey
    )
  );

  return results;
}
