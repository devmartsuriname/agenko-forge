import { createClient } from '@supabase/supabase-js';

// Environment variables for admin seeding
const SUPABASE_URL = 'https://dvgubqqjvmsepkilnkak.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@devmart.sr';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

if (!ADMIN_PASSWORD) {
  console.error('❌ ADMIN_PASSWORD environment variable is required');
  console.error('💡 Set this in your Supabase Edge Functions secrets');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedAdmin() {
  console.log('🌱 Starting admin user seeding...');
  console.log(`📧 Admin email: ${ADMIN_EMAIL}`);

  try {
    // Check if admin user already exists
    const { data: existingUsers, error: fetchError } = await supabase.auth.admin.listUsers();
    
    if (fetchError) {
      throw new Error(`Failed to fetch existing users: ${fetchError.message}`);
    }

    const existingAdmin = existingUsers.users.find(user => user.email === ADMIN_EMAIL);
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists, checking profile...');
      
      // Check if profile exists with admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', existingAdmin.id)
        .single();
        
      if (profileError) {
        console.log('🔧 Creating missing admin profile...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: existingAdmin.id,
            email: ADMIN_EMAIL,
            role: 'admin'
          });
          
        if (insertError) {
          throw new Error(`Failed to create admin profile: ${insertError.message}`);
        }
        console.log('✅ Admin profile created successfully');
      } else if (profile.role !== 'admin') {
        console.log('🔧 Updating user role to admin...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', existingAdmin.id);
          
        if (updateError) {
          throw new Error(`Failed to update user role: ${updateError.message}`);
        }
        console.log('✅ User role updated to admin');
      } else {
        console.log('✅ Admin user and profile already exist with correct permissions');
      }
      
      return;
    }

    // Create new admin user
    console.log('👤 Creating new admin user...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Skip email verification for admin
      user_metadata: {
        role: 'admin'
      }
    });

    if (createError) {
      throw new Error(`Failed to create admin user: ${createError.message}`);
    }

    if (!newUser.user) {
      throw new Error('User creation succeeded but no user data returned');
    }

    console.log(`✅ Admin user created with ID: ${newUser.user.id}`);

    // Create admin profile (the trigger should handle this, but let's ensure it)
    console.log('👤 Creating admin profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        email: ADMIN_EMAIL,
        role: 'admin'
      });

    if (profileError) {
      throw new Error(`Failed to create admin profile: ${profileError.message}`);
    }

    console.log('✅ Admin profile created successfully');
    console.log('🎉 Admin seeding completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log(`   1. Login at /admin/login with: ${ADMIN_EMAIL}`);
    console.log('   2. Disable public signup in Supabase Auth settings');
    console.log('   3. Configure email templates if needed');
    console.log('');

  } catch (error) {
    console.error('❌ Admin seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
seedAdmin();