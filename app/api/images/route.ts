import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const albumId = searchParams.get('albumId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!albumId) {
    return NextResponse.json({ error: 'Album ID is required' }, { status: 400 });
  }

  try {
    // Use album ID to calculate page number, cycling through pages 1-20 for variety
    const albumIdNum = Number(albumId);
    const basePage = ((albumIdNum - 1) % 20) + 1;
    // Calculate the actual page to fetch (basePage + offset based on requested page)
    const actualPage = basePage + Math.floor((page - 1) * limit / 30);
    const url = `https://picsum.photos/v2/list?page=${actualPage}&limit=${limit}`;
    
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch images: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching images for album ${albumId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

