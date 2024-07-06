import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/clerk-sdk-node';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const userId = params.id;

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
