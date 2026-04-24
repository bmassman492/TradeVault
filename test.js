const response = await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser', password: 'testpass' })
});

const data = await response.json();
console.log('Status:', response.status);
console.log('Response:', data);