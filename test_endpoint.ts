import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from './src/config/env';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function run() {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        fullName: 'Test User',
        email: 'test' + Date.now() + '@example.com',
        passwordHash: 'dummy'
      }
    });
  }

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '7d' });

  const res = await fetch('http://localhost:4001/api/v1/addresses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      label: 'SCHOOL',
      recipientName: 'Kunle Test',
      line1: 'FUTA South Gate',
      city: 'Akure',
      state: "Ondo",
      isDefault: true
    })
  });

  const data = await res.json();
  console.log('STATUS:', res.status);
  console.log('DATA:', JSON.stringify(data, null, 2));

  await prisma.$disconnect();
}

run().catch(console.error);
