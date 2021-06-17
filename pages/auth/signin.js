import { signIn, getCsrfToken, getProviders } from 'next-auth/client'
import { useState } from 'react';
import _ from 'lodash';

export default function SignIn({ csrfToken, callbackUrl, providers }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const defaultSignInOptions = { callbackUrl }

  const handleSubmit = async (event) => {
    event.preventDefault();
    await signIn('credentials', {
      ...defaultSignInOptions,
      email,
      password,
    })
  }

  const oAuthButtons = _.map(providers.oauth, (provider) => {
    return (
      <div key={provider.id}>
        <button
          onClick={() => signIn(provider.id, {...defaultSignInOptions})}
          style={{ marginTop: '1rem' }}
        >
          Login via { provider.name }
        </button>
      </div>
    )
  });

  return (
    <div>
      <form method='post' onSubmit={handleSubmit}>
        <label>
          Email
          <input name='email' type='text' value={email} onChange={(event) => setEmail(event.target.value)}/>
        </label>
        <label>
          Password
          <input name='password' type='password' value={password} onChange={(event) => setPassword(event.target.value)}/>
        </label>
        <button type='submit'>Sign in</button>
      </form>
      { oAuthButtons }
    </div>
  )
}

// This is the recommended way for Next.js 9.3 or newer
export async function getServerSideProps(context) {
  let providers = await getProviders();
  providers = _.groupBy(providers, 'type');

  return {
    props: {
      csrfToken: await getCsrfToken(context),
      callbackUrl: context.query.callbackUrl,
      providers
    }
  }
}
