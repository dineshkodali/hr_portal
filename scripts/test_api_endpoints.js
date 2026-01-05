// Test API CRUD endpoints
const API_BASE = 'http://localhost:3001/api';

async function testEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test GET users
    console.log('1️⃣ Testing GET /api/users/list');
    const usersRes = await fetch(`${API_BASE}/users/list`);
    if (usersRes.ok) {
      const users = await usersRes.json();
      console.log(`✅ GET users: ${users.length} users found`);
    } else {
      console.log(`❌ GET users failed: ${usersRes.status} ${usersRes.statusText}`);
    }

    // Test GET groups
    console.log('\n2️⃣ Testing GET /api/permission_groups');
    const groupsRes = await fetch(`${API_BASE}/permission_groups`);
    if (groupsRes.ok) {
      const groups = await groupsRes.json();
      console.log(`✅ GET groups: ${groups.length} groups found`);
    } else {
      console.log(`❌ GET groups failed: ${groupsRes.status} ${groupsRes.statusText}`);
    }

    // Test GET branches
    console.log('\n3️⃣ Testing GET /api/branches');
    const branchesRes = await fetch(`${API_BASE}/branches`);
    if (branchesRes.ok) {
      const branches = await branchesRes.json();
      console.log(`✅ GET branches: ${branches.length} branches found`);
    } else {
      console.log(`❌ GET branches failed: ${branchesRes.status} ${branchesRes.statusText}`);
    }

    // Test CREATE a test user
    console.log('\n4️⃣ Testing POST /api/users (Create)');
    const testUser = {
      id: `test-user-${Date.now()}`,
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'test123',
      role: 'employee',
      status: 'Active',
      avatar: 'https://ui-avatars.com/api/?name=Test+User'
    };
    
    const createRes = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (createRes.ok) {
      const created = await createRes.json();
      console.log(`✅ CREATE user: ${created.name} (ID: ${created.id})`);
      
      // Test UPDATE
      console.log('\n5️⃣ Testing PUT /api/users/:id (Update)');
      const updateRes = await fetch(`${API_BASE}/users/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...created, name: 'Updated Test User' })
      });
      
      if (updateRes.ok) {
        const updated = await updateRes.json();
        console.log(`✅ UPDATE user: ${updated.name}`);
      } else {
        const errorText = await updateRes.text();
        console.log(`❌ UPDATE failed: ${updateRes.status} ${errorText}`);
      }

      // Test DELETE
      console.log('\n6️⃣ Testing DELETE /api/users/:id');
      const deleteRes = await fetch(`${API_BASE}/users/${created.id}`, {
        method: 'DELETE'
      });
      
      if (deleteRes.ok) {
        console.log(`✅ DELETE user: Test user deleted successfully`);
      } else {
        const errorText = await deleteRes.text();
        console.log(`❌ DELETE failed: ${deleteRes.status} ${errorText}`);
      }
    } else {
      const errorText = await createRes.text();
      console.log(`❌ CREATE failed: ${createRes.status} ${errorText}`);
    }

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
}

testEndpoints();
