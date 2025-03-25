import { NextResponse } from 'next/server';
import { loadBacklogData, Backlog } from '../../../utils/backlogLoader';
import { loadBacklogFromFirestore } from '../../../utils/firebaseBacklogLoader';
import { ensureUser, getCurrentUser } from '../../../firebase/auth';

export async function GET() {
  try {
    // Ensure user is authenticated (anonymously if needed)
    const user = await ensureUser();
    
    if (user) {
      // User is authenticated (could be anonymous), load from Firestore
      const backlogData = await loadBacklogFromFirestore();
      return NextResponse.json(backlogData);
    } else {
      // Fallback to local file (should not happen with ensureUser)
      console.warn('Failed to ensure user authentication, falling back to local file');
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
