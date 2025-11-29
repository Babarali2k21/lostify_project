import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('items')
            .select(`
        id,
        title,
        description,
        date,
        type,
        imageUrl,
        category:categories ( name ),
        location:locations ( name ),
        user:users ( name, email, phone )
      `)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const items = data.map((i: any) => ({
            id: i.id,
            title: i.title,
            category: i.category?.name ?? '',
            status: i.type,
            location: i.location?.name ?? '',
            date: formatDate(i.date),
            imageUrl: i.imageUrl,
            description: i.description,
            contactName: i.user?.name ?? '',
            contactEmail: i.user?.email ?? '',
            contactPhone: i.user?.phone ?? ''
        }));

        return NextResponse.json(items, { status: 200 });
    } catch (err: any) {
        return NextResponse.json(
            { error: 'Internal Server Error', details: err.message },
            { status: 500 }
        );
    }
}
