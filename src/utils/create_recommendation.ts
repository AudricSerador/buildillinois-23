export const generateRecommendations = async (userId: string): Promise<any> => {
    const apiUrl = 'https://o9qw8zdtpe.execute-api.us-east-1.amazonaws.com/dev/generate';
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  };
  