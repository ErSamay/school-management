import { NextResponse, NextRequest } from 'next/server';
import connection, { initializeDatabase } from '@/lib/db';
import { promises as fs } from 'fs';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

let isInitialized = false;

async function ensureInitialized(): Promise<void> {
  if (!isInitialized) {
    await initializeDatabase();
    isInitialized = true;
  }
}

// GET - Fetch all schools
export async function GET() {
  try {
    await ensureInitialized();
    const [rows] = await connection.execute('SELECT * FROM schools ORDER BY id DESC') as [RowDataPacket[], any];
    
    return NextResponse.json({ 
      success: true, 
      schools: rows 
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Failed to fetch schools: ' + errorMessage },
      { status: 500 }
    );
  }
}

// POST - Add new school
export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    const formData = await request.formData();
    
    const schoolData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      contact: formData.get('contact') as string,
      email_id: formData.get('email_id') as string,
    };

    const imageFile = formData.get('image') as File;
    let imagePath: string | null = null;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileName = `school-${Date.now()}-${Math.round(Math.random() * 1E9)}.${imageFile.name.split('.').pop()}`;
      const filePath = `./public/schoolImages/${fileName}`;
      
      await fs.writeFile(filePath, buffer);
      imagePath = `/schoolImages/${fileName}`;
    }

    const [result] = await connection.execute(
      'INSERT INTO schools (name, address, city, state, contact, image, email_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [schoolData.name, schoolData.address, schoolData.city, schoolData.state, schoolData.contact, imagePath, schoolData.email_id]
    ) as [ResultSetHeader, any];

    return NextResponse.json({ 
      success: true, 
      message: 'School added successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error adding school:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Failed to add school: ' + errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Delete school
export async function DELETE(request: NextRequest) {
  try {
    await ensureInitialized();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'School ID is required' },
        { status: 400 }
      );
    }

    // Get school info to delete image
    const [schools] = await connection.execute(
      'SELECT image FROM schools WHERE id = ?',
      [id]
    ) as [RowDataPacket[], any];

    if (schools.length > 0 && schools[0].image) {
      try {
        await fs.unlink(`./public${schools[0].image}`);
      } catch (error) {
        console.log('Image file not found or already deleted');
      }
    }

    const [result] = await connection.execute(
      'DELETE FROM schools WHERE id = ?',
      [id]
    ) as [ResultSetHeader, any];

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'School not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'School deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting school:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Failed to delete school: ' + errorMessage },
      { status: 500 }
    );
  }
}