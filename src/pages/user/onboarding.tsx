import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/auth/auth.service';

export default function Onboarding(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [allergies, setAllergies] = useState('');
  const [preferences, setPreferences] = useState('');

  useEffect(() => {
    if (user && !user.isNew) {
      router.push('/dashboard');
    }
  }, []);

  const handleOnboardingCompletion = () => {
    if (user) {
      // Update the user object in the database
      fetch('/api/update_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          name,
          allergies,
          preferences,
        }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          router.push('/dashboard');
        }
      });
    }
  };

  return (
    <div>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Allergies" />
      <input type="text" value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="Preferences" />
      <button onClick={handleOnboardingCompletion}>Complete Onboarding</button>
    </div>
  );
}