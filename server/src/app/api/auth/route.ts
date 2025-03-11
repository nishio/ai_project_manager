import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, signOutUser } from '../../../firebase/auth';

// Get current user information
export async function GET() {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (error) {
    console.error('Error getting auth status:', error);
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
}

// Sign out the current user
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'signout') {
      await signOutUser();
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in auth action:', error);
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
}
