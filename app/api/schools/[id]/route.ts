import { NextResponse, NextRequest } from 'next/server';
import connection, { initializeDatabase } from '@/lib/db';
import { promises as fs } from 'fs';
import { ResultSetHeader, RowDataPacket, FieldPacket } from 'mysql2';

// Define the School interface
interface School extends RowDataPacket {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  contact: string;
  email_id: string;
  image?: string;
}

let isInitialized = false;

async function ensureInitialized(): Promise<void> {
  if (!isInitialized) {
    await initializeDatabase();
    isInitialized = true;
  }
}

// GET - Fetch single school
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureInitialized();
    
    // Await the params before accessing properties
    const { id } = await params;
    
    const [rows]: [School[], FieldPacket[]] = await connection.execute(
      'SELECT * FROM schools WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'School not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      school: rows[0] 
    });
  } catch (error) {
    console.error('Error fetching school:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Failed to fetch school: ' + errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Update school
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureInitialized();
    
    // Await the params before accessing properties
    const { id } = await params;
    
    const formData = await request.formData();
    
    const schoolData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      contact: formData.get('contact') as string,
      email_id: formData.get('email_id') as string,
    };

    let imagePath: string | null = null;
    const imageFile = formData.get('image') as File;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileName = `school-${Date.now()}-${Math.round(Math.random() * 1E9)}.${imageFile.name.split('.').pop()}`;
      const filePath = `./public/schoolImages/${fileName}`;
      
      await fs.writeFile(filePath, buffer);
      imagePath = `/schoolImages/${fileName}`;

      // Delete old image
      const [oldSchool]: [School[], FieldPacket[]] = await connection.execute(
        'SELECT image FROM schools WHERE id = ?',
        [id]
      );

      if (oldSchool.length > 0 && oldSchool[0].image) {
        try {
          await fs.unlink(`./public${oldSchool[0].image}`);
        } catch (error) {
          console.log('Old image file not found');
        }
      }
    }

    const updateQuery = `
      UPDATE schools 
      SET name = ?, address = ?, city = ?, state = ?, contact = ?, email_id = ?
      ${imagePath ? ', image = ?' : ''}
      WHERE id = ?
    `;

    const values: (string | number)[] = [
      schoolData.name, 
      schoolData.address, 
      schoolData.city, 
      schoolData.state, 
      schoolData.contact, 
      schoolData.email_id
    ];

    if (imagePath) {
      values.push(imagePath);
    }
    values.push(id);

    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.execute(updateQuery, values);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'School not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'School updated successfully' 
    });
  } catch (error) {
    console.error('Error updating school:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Failed to update school: ' + errorMessage },
      { status: 500 }
    );
  }
}