import { NextResponse } from 'next/server';
import { loadBacklogData, Backlog } from '../../../utils/backlogLoader';

export async function GET() {
  try {
    const backlogData = await loadBacklogData();
    return NextResponse.json(backlogData);
  } catch (error) {
    console.error('Error fetching backlog data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backlog data' },
      { status: 500 }
    );
  }
}
