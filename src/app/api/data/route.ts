import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_ACCOUNTS } from '@/lib/initialData';

const DATA_FILE = path.join(process.cwd(), 'data', 'accounts.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_ACCOUNTS, null, 2), 'utf-8');
  }
}

export async function GET() {
  try {
    ensureDataFile();
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(content);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(INITIAL_ACCOUNTS);
  }
}

export async function POST(request: Request) {
  try {
    ensureDataFile();
    const data = await request.json();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

