/**
 * Script to set up public permissions for the Translation API
 * Run this after Strapi is running: node scripts/setup-public-permissions.js
 */

// Node 18+ has native fetch built-in
// No need to import anything

async function setupPublicPermissions() {
  const STRAPI_URL = 'http://localhost:1337';
  
  console.log('🔧 Setting up public permissions for Translation API...');
  
  try {
    // First, we need to get the public role ID
    const rolesResponse = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!rolesResponse.ok) {
      console.log('⚠️  Could not fetch roles. You may need to set permissions manually in Strapi admin panel.');
      console.log('\nManual setup instructions:');
      console.log('1. Go to http://localhost:1337/admin');
      console.log('2. Navigate to Settings → Users & Permissions → Roles');
      console.log('3. Click on "Public" role');
      console.log('4. Under "Translation" section, enable:');
      console.log('   - find');
      console.log('   - findOne');
      console.log('5. Click "Save"');
      return;
    }
    
    const roles = await rolesResponse.json();
    const publicRole = roles.roles.find(role => role.type === 'public');
    
    if (!publicRole) {
      console.error('❌ Public role not found');
      return;
    }
    
    console.log(`✅ Found public role with ID: ${publicRole.id}`);
    
    // Now update the permissions for the public role
    const updateResponse = await fetch(`${STRAPI_URL}/api/users-permissions/roles/${publicRole.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        permissions: {
          'api::translation': {
            controllers: {
              translation: {
                find: {
                  enabled: true
                },
                findOne: {
                  enabled: true
                }
              }
            }
          }
        }
      })
    });
    
    if (updateResponse.ok) {
      console.log('✅ Public permissions set successfully!');
      console.log('   - Public users can now read translations');
      
      // Test the API
      console.log('\n🧪 Testing the API...');
      const testResponse = await fetch(`${STRAPI_URL}/api/translations`);
      if (testResponse.ok) {
        const data = await testResponse.json();
        console.log('✅ API test successful! Response:', data);
      } else {
        console.log('⚠️  API test failed. Status:', testResponse.status);
      }
    } else {
      console.log('⚠️  Could not update permissions automatically.');
      console.log('Please set them manually in the Strapi admin panel (see instructions above).');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Manual setup required - see instructions above.');
  }
}

// Run the setup
setupPublicPermissions();