import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  // Query the profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is standard 'Row not found' error
    // Some unexpected database error
    return NextResponse.json({ error: 'Internal server error while verifying username' }, { status: 500 });
  }

  // If data is returned, username exists. Otherwise it is available.
  const isAvailable = !data;

  return NextResponse.json({ available: isAvailable }, { status: 200 });
}
