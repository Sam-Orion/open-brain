import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { entityType, entityId } = body;

    // Validate inputs
    if (!['brain', 'thought', 'tag'].includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entityType. Must be brain, thought, or tag.' },
        { status: 400 }
      );
    }

    if (entityType !== 'brain' && !entityId) {
      return NextResponse.json(
        { error: `entityId is required for entityType '${entityType}'.` },
        { status: 400 }
      );
    }

    // Generate a secure 10-character alphanumeric share token
    const shareToken = crypto.randomBytes(5).toString('hex');
    const safeEntityId = entityType === 'brain' ? null : entityId;

    // Insert into Supabase shares table
    const { error: insertError } = await supabase
      .from('shares')
      .insert({
        user_id: user.id,
        share_token: shareToken,
        entity_type: entityType,
        entity_id: safeEntityId,
        is_active: true,
      });

    if (insertError) {
      console.error('Error inserting share record:', insertError);
      return NextResponse.json(
        { error: 'Failed to generate share link. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ token: shareToken }, { status: 201 });

  } catch (error: any) {
    console.error('Share Generate API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
