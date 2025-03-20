import { NextResponse } from "next/server";

// In a real application, you would store this in a database
let bookmarkedItems = new Set<string>();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    bookmarkedItems.add(id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to bookmark item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    bookmarkedItems.delete(id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    );
  }
}
