import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/auth/auth.service';

export default function Onboarding(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [allergies, setAllergies] = useState('');
  const [preferences, setPreferences] = useState('');

  useEffect(() => {
    if (user) {
      // Create the user object in the database
      fetch('/api/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          azureId: user.user_metadata.azure_id,
          name,
          allergies,
          preferences,
          isNew: true,
        }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // If the user object was created successfully, ask the user about their food preferences
          // ...
        }
      });
    }
  }, [user, name, allergies, preferences]);

  const handleOnboardingCompletion = () => {
    // Save the user's food preferences in the database
    // ...

    // Redirect the user to the dashboard
    router.push('/dashboard');
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