import { db } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user-utils';

async function createDemoData() {
  try {
    console.log('Creating demo data...');
    
    // Get or create default user
    const user = await getOrCreateDefaultUser();
    console.log('User:', user);

    // Create demo company
    const demoCompany = await db.company.create({
      data: {
        name: 'Технологии Будущего',
        description: 'Разработка инновационных IT-решений',
        ownerId: user.id
      }
    });
    console.log('Demo company created:', demoCompany);

    // Create demo folder
    const demoFolder = await db.folder.create({
      data: {
        name: 'Рабочие пароли',
        description: 'Основные рабочие аккаунты',
        color: '#3b82f6',
        icon: '💼',
        ownerId: user.id
      }
    });
    console.log('Demo folder created:', demoFolder);

    // Create demo folder with company
    const demoFolderWithCompany = await db.folder.create({
      data: {
        name: 'Личные проекты',
        description: 'Персональные проекты и аккаунты',
        color: '#10b981',
        icon: '🏠',
        companyId: demoCompany.id,
        ownerId: user.id
      }
    });
    console.log('Demo folder with company created:', demoFolderWithCompany);

    console.log('Demo data created successfully!');
  } catch (error) {
    console.error('Error creating demo data:', error);
  }
}

// Run the function
createDemoData()
  .then(() => {
    console.log('Demo data script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Demo data script failed:', error);
    process.exit(1);
  });