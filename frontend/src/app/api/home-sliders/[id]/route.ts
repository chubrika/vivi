import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/home-sliders/${params.id}`);
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching home slider:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch home slider' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization');

    const response = await fetch(`${API_BASE_URL}/api/home-sliders/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token })
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error updating home slider:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update home slider' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization');

    const response = await fetch(`${API_BASE_URL}/api/home-sliders/${params.id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': token })
      }
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error deleting home slider:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete home slider' },
      { status: 500 }
    );
  }
} 