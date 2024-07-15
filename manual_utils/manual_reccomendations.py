import json
import pandas as pd
from supabase import create_client, Client
from datetime import datetime
import os

# Initialize Supabase client
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_recommendations(user_id):
    # Fetch user data
    user = supabase.table('User').select('*').eq('id', user_id).execute().data[0]
    
    # Fetch all meal details
    meal_details = supabase.table('mealDetails').select('*').execute().data
    
    # Extract all unique food IDs from meal details
    food_ids = list(set(detail['foodId'] for detail in meal_details))
    
    # Fetch food items corresponding to the extracted food IDs
    food_items = supabase.table('FoodInfo').select('*').in_('id', food_ids).execute().data
    
    # Convert to pandas DataFrames for easier processing
    df_food = pd.DataFrame(food_items)
    
    # Ensure necessary columns exist
    required_columns = ['id', 'allergens', 'preferences', 'ingredients', 'calories', 'protein', 'diningFacility']
    for col in required_columns:
        if col not in df_food.columns:
            df_food[col] = None
    
    # Strictly filter out foods with user's allergens
    if 'allergies' in user and user['allergies']:
        df_food = df_food[~df_food['allergens'].apply(lambda x: any(allergen in x for allergen in user['allergies']) if x else False)]
    
    # Strictly filter based on dietary restrictions
    if 'dietaryRestrictions' in user and user['dietaryRestrictions']:
        df_food = df_food[df_food['preferences'].apply(lambda x: user['dietaryRestrictions'] in x if x else False)]
    
    # If no foods remain after filtering, return an empty list
    if df_food.empty:
        return []
    
    # Calculate scores
    df_food['preference_score'] = calculate_preference_score(df_food, user)
    df_food['nutritional_score'] = calculate_nutritional_score(df_food, user)
    df_food['location_score'] = calculate_location_score(df_food, user)
    
    # Calculate final score (you can adjust weights as needed)
    df_food['final_score'] = (
        df_food['preference_score'] * 0.4 + 
        df_food['nutritional_score'] * 0.4 + 
        df_food['location_score'] * 0.2
    )
    
    # Sort by final score and get top 20 recommendations
    top_recommendations = df_food.sort_values('final_score', ascending=False).head(20)
    top_food_ids = top_recommendations['id'].astype(str).tolist()
    recommendations_str = ",".join(top_food_ids)
    
    return recommendations_str

def calculate_preference_score(df, user):
    if 'preferences' in user and user['preferences']:
        return df['ingredients'].apply(lambda x: sum(pref in x for pref in user['preferences']) / len(user['preferences']) if x else 0)
    return pd.Series(0, index=df.index)

def calculate_nutritional_score(df, user):
    score = pd.Series(0, index=df.index)
    
    if 'goal' in user and user['goal']:
        if user['goal'] == 'weight_loss':
            score += (500 - df['calories']) / 500  # Lower calories are better
        elif user['goal'] == 'muscle_gain':
            score += df['protein'] / 50  # Higher protein is better
        # Add more goals as needed
    
    return score

def calculate_location_score(df, user):
    if 'locations' in user and user['locations']:
        return df['diningFacility'].apply(lambda x: 1 if x in user['locations'] else 0 if x else 0)
    return pd.Series(1, index=df.index)  # If no location preference, all locations are equally good

def lambda_handler(event, context):
    user_id = event['user_id']
    recommendations_str = generate_recommendations(user_id)
    print(recommendations_str)
    
    # Store recommendations in Supabase
    supabase.table('Recommendation').upsert({
        'userId': user_id,
        'foodIds': recommendations_str,
        'createdAt': datetime.now().isoformat(),
        'type': 'test'  # Example type, adjust as needed
    }).execute()
    
    return {
        'statusCode': 200,
        'body': json.dumps('Recommendations updated successfully')
    }

# Example event
event = {
    'user_id': '988262be-e5cb-4b76-8bdd-a3a90e12dc48'  # User ID for which recommendations are to be generated
}
data = lambda_handler(event, None)
print(data)
