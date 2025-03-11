import { NextResponse } from 'next/server';
import { loadBacklogData, Backlog } from '../../../utils/backlogLoader';
import { loadBacklogFromFirestore } from '../../../utils/firebaseBacklogLoader';
import { getCurrentUser } from '../../../firebase/auth';

export async function GET() {
  try {
    // Check if user is authenticated
    const user = getCurrentUser();
    
    if (user) {
      // User is authenticated, load from Firestore
      const backlogData = await loadBacklogFromFirestore();
      return NextResponse.json(backlogData);
    } else {
      // User is not authenticated, load from local file
      const backlogData = await loadBacklogData();
      return NextResponse.json(backlogData);
    }
  } catch (error) {
    console.error('Error fetching backlog data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backlog data' },
      { status: 500 }
    );
  }
}
