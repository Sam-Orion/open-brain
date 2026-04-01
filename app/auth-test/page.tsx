'use client';

import { signUpAction, signInAction } from '@/actions/auth';
import { useState } from 'react';

export default function AuthTestPage() {
  const [signUpResult, setSignUpResult] = useState<any>(null);
  const [signInResult, setSignInResult] = useState<any>(null);

  const handleSignUp = async (formData: FormData) => {
    const res = await signUpAction(formData);
    setSignUpResult(res);
  };

  const handleSignIn = async (formData: FormData) => {
    const res = await signInAction(formData);
    setSignInResult(res);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Authentication API Test Page</h1>
      <p>This page allows you to test the Next.js Server Actions directly in your browser without styling.</p>

      <hr style={{ margin: '2rem 0' }} />

      <section>
        <h2>Test Sign Up</h2>
        <form action={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
          <label>
            Email: <br />
            <input type="email" name="email" required />
          </label>
          <label>
            Username: <br />
            <input type="text" name="username" required pattern="^[a-z0-9]{3,20}$" title="3-20 characters, lowercase alphanumeric only" />
          </label>
          <label>
            Password: <br />
            <input type="password" name="password" required />
          </label>
          <button type="submit">Sign Up</button>
        </form>
        {signUpResult && <pre style={{ background: '#f4f4f4', padding: '1rem', marginTop: '1rem' }}>{JSON.stringify(signUpResult, null, 2)}</pre>}
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <section>
        <h2>Test Sign In</h2>
        <form action={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
          <label>
            Username OR Email: <br />
            <input type="text" name="identifier" required />
          </label>
          <label>
            Password: <br />
            <input type="password" name="password" required />
          </label>
          <button type="submit">Sign In</button>
        </form>
        {signInResult && <pre style={{ background: '#f4f4f4', padding: '1rem', marginTop: '1rem' }}>{JSON.stringify(signInResult, null, 2)}</pre>}
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <section>
        <h2>Test Username Availability API (via Client Fetch)</h2>
        <TestUsernameCheck />
      </section>
    </div>
  );
}

function TestUsernameCheck() {
  const [username, setUsername] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const checkUsername = async () => {
    try {
      const res = await fetch(`/api/auth/check-username?username=${username}`);
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    }
  };

  return (
    <div>
      <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" />
      <button onClick={checkUsername} style={{ marginLeft: '1rem' }}>Check</button>
      {result && <pre style={{ background: '#f4f4f4', padding: '1rem', marginTop: '1rem' }}>{result}</pre>}
    </div>
  );
}
