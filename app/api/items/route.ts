import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      user_id,
      category_id,
      location_id,
      title,
      description,
      date,
      type,
      status = "open",
      imageUrl = null,
    } = body;

    if (
      !user_id ||
      !category_id ||
      !location_id ||
      !title ||
      !description ||
      !date ||
      !type
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("items")
      .insert([
        {
          user_id,
          category_id,
          location_id,
          title,
          description,
          date,
          type,
          status,
          imageUrl,
        },
      ])
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to create item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/items error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}