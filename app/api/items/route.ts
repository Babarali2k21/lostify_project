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
    const formData = await req.formData();
    const user_id = formData.get("user_id") as string | null;
    const category_id = formData.get("category_id") as string | null;
    const location_id = formData.get("location_id") as string | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const date = formData.get("date") as string | null;
    const type = formData.get("type") as string | null;
    const status = (formData.get("status") as string | null) ?? "open";
    const file = formData.get("image") as File | null;
    const name = formData.get("name") as string | null;
    const email = formData.get("email") as string | null;
    const phone = formData.get("phone") as string | null;

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

    if (name || email || phone) {
      const updateData: Record<string, any> = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;

      const { error: userUpdateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user_id);

      if (userUpdateError) {
        console.error("User update error:", userUpdateError);
        return NextResponse.json(
          { error: "Failed to update user profile" },
          { status: 500 }
        );
      }
    }

    let imageUrl: string | null = null;

    if (file && file.size > 0) {
      const bucket = "item-images";
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${user_id}/${Date.now()}.${ext}`;

      console.log("Uploading file to Supabase storage:", filePath);
      const { data: storageData, error: storageError } =
        await supabase.storage.from(bucket).upload(filePath, file, {
          contentType: file.type,
        });

      if (storageError) {
        console.error("Supabase storage upload error:", storageError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(storageData.path);

      imageUrl = publicUrlData.publicUrl;
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