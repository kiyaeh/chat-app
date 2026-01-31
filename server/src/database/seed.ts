import { PrismaClient, RoomType } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create default admin user
  const hashedPassword = await bcryptjs.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@chatapp.com' },
    update: {},
    create: {
      email: 'admin@chatapp.com',
      username: 'admin',
      password: hashedPassword,
    },
  });

  // Create general chat room
  const generalRoom = await prisma.room.upsert({
    where: { id: 'general' },
    update: {},
    create: {
      id: 'general',
      name: 'General',
      description: 'Welcome to the general chat room',
      type: RoomType.GROUP,
      isPrivate: false,
      creatorId: adminUser.id,
    },
  });

  // Add admin as room member
  await prisma.roomMember.upsert({
    where: {
      userId_roomId: {
        userId: adminUser.id,
        roomId: generalRoom.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roomId: generalRoom.id,
      role: 'ADMIN',
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });