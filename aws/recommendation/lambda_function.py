import json
import pandas as pd
from supabase import create_client, Client
from datetime import datetime
import os
import logging

# Initialize logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

ALLOWED_ORIGINS = ['http://localhost:3000', 'https://illineats.com']

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
    
    # Calculate final score with adjusted weights based on user's goal
    if 'goal' in user and user['goal']:
        if user['goal'] == 'lose_weight':
            df_food['final_score'] = (
                df_food['preference_score'] * 0.3 + 
                df_food['nutritional_score'] * 0.5 + 
                df_food['location_score'] * 0.2
            )
            df_food = df_food.sort_values(['final_score', 'calories'], ascending=[False, True])
        elif user['goal'] == 'bulk':
            df_food['final_score'] = (
                df_food['preference_score'] * 0.2 + 
                df_food['nutritional_score'] * 0.6 + 
                df_food['location_score'] * 0.2
            )
            df_food = df_food.sort_values(['final_score', 'protein', 'calories'], ascending=[False, False, True])
        elif user['goal'] == 'eat_healthy':
            df_food['final_score'] = (
                df_food['preference_score'] * 0.3 + 
                df_food['nutritional_score'] * 0.5 + 
                df_food['location_score'] * 0.2
            )
            df_food = df_food.sort_values(['final_score', 'nutritional_score'], ascending=[False, False])
        else:
            df_food['final_score'] = (
                df_food['preference_score'] * 0.4 + 
                df_food['nutritional_score'] * 0.4 + 
                df_food['location_score'] * 0.2
            )
            df_food = df_food.sort_values('final_score', ascending=False)
    else:
        df_food['final_score'] = (
            df_food['preference_score'] * 0.4 + 
            df_food['nutritional_score'] * 0.4 + 
            df_food['location_score'] * 0.2
        )
        df_food = df_food.sort_values('final_score', ascending=False)
    
    # Get top 20 recommendations
    top_recommendations = df_food.head(20)
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
        if user['goal'] == 'lose_weight':
            score += (500 - df['calories']) / 500  # Lower calories are better
        elif user['goal'] == 'bulk':
            score += df['protein'] / 5  # Higher protein is better
        elif user['goal'] == 'eat_healthy':
            pass
        # Add more goals as needed
    
    return score

def calculate_location_score(df, user):
    if 'locations' in user and user['locations']:
        return df['diningFacility'].apply(lambda x: 1 if x in user['locations'] else 0 if x else 0)
    return pd.Series(1, index=df.index)  # If no location preference, all locations are equally good

def lambda_handler(event, context):
    logger.info("Received event: " + json.dumps(event, indent=2))

    try:
        if event['httpMethod'] == 'OPTIONS':
            origin = event['headers'].get('origin', '*')
            if origin not in ALLOWED_ORIGINS:
                origin = '*'
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token'
                },
                'body': ''
            }
        
        body = json.loads(event['body'])
        user_id = body['user_id']
        recommendations_str = generate_recommendations(user_id)
        
        supabase.table('Recommendation').upsert({
            'userId': user_id,
            'foodIds': recommendations_str,
            'createdAt': datetime.now().isoformat(),
            'type': 'dashboard'
        }, on_conflict='userId,type').execute()

        origin = event['headers'].get('origin', '*')
        if origin not in ALLOWED_ORIGINS:
            origin = '*'
        
        response = {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token'
            },
            'body': json.dumps('Recommendations updated successfully')
        }

        logger.info("Response: " + json.dumps(response, indent=2))
        return response
    except Exception as e:
        logger.error(f"Error in lambda_handler: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token'
            },
            'body': json.dumps(f"Internal server error: {e}")
        }