import axios from 'axios';

async function testApi() {
    console.log('--- Testing API Connectivity & Data ---');
    try {
        // 1. Login as Director
        console.log('Attempting login as director...');
        const loginRes = await axios.post('http://localhost:3000/auth/login', {
            email: 'director@school.dz',
            password: 'password123'
        });

        if (!loginRes.data.success) {
            console.log('Login failed!', loginRes.data);
            return;
        }

        const token = loginRes.data.data.tokens.accessToken;
        console.log('Login success! Token acquired.');

        // 2. Fetch Classes
        console.log('\nFetching classes...');
        const classesRes = await axios.get('http://localhost:3000/academic/classes', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Classes Response Success:', classesRes.data.success);
        console.log('Classes Count:', classesRes.data.data?.length);
        if (classesRes.data.data?.length > 0) {
            console.log('Sample Class Year:', classesRes.data.data[0].academicYear?.name);
            console.log('Sample Class isCurrent Year:', classesRes.data.data[0].academicYear?.isCurrent);
        }

        // 3. Fetch Years
        console.log('\nFetching academic years...');
        const yearsRes = await axios.get('http://localhost:3000/academic/years', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Years found:', yearsRes.data.data?.map((y: any) => `${y.name} (isCurrent: ${y.isCurrent})`));

    } catch (error: any) {
        console.error('API Test Error:', error.response?.data || error.message);
    }
}

testApi();
