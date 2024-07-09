from supabase import create_client, Client
from uuid import uuid4
import os

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def import_json_to_database(food_data):
    try:
        for food in food_data:
            response = supabase.table('FoodInfo').select('name, id').eq('name', food['name']).execute()
            existing_food = response.data

            if existing_food:
                existing_food = existing_food[0]
                for entry in food['mealEntries']:
                    supabase.table('mealDetails').insert({
                        'diningHall': entry['diningHall'],
                        'diningFacility': entry['diningFacility'],
                        'mealType': entry['mealType'],
                        'dateServed': entry['dateServed'],
                        'foodId': existing_food['id'],
                    }).execute()
                print(f"Updated FoodInfo with ID: {existing_food['id']}")
            else:
                new_id = str(uuid4())
                response = supabase.table('FoodInfo').insert({
                    'id': new_id,
                    'name': food['name'],
                    'servingSize': food['servingSize'],
                    'ingredients': food['ingredients'],
                    'allergens': food['allergens'],
                    'preferences': food['preferences'],
                    'calories': food['calories'],
                    'caloriesFat': food['caloriesFat'],
                    'totalFat': food['totalFat'],
                    'saturatedFat': food['saturatedFat'],
                    'transFat': food['transFat'],
                    'polyFat': food['polyFat'],
                    'monoFat': food['monoFat'],
                    'cholesterol': food['cholesterol'],
                    'sodium': food['sodium'],
                    'potassium': food['potassium'],
                    'totalCarbohydrates': food['totalCarbohydrates'],
                    'fiber': food['fiber'],
                    'sugars': food['sugars'],
                    'protein': food['protein'],
                    'calciumDV': food['calciumDV'],
                    'ironDV': food['ironDV'],
                }, returning='minimal', count=None).execute()

                print(f"Created FoodInfo with ID: {new_id}")

                for entry in food['mealEntries']:
                    supabase.table('mealDetails').insert({
                        'diningHall': entry['diningHall'],
                        'diningFacility': entry['diningFacility'],
                        'mealType': entry['mealType'],
                        'dateServed': entry['dateServed'],
                        'foodId': new_id,
                    }).execute()

    except Exception as error:
        print(f"Error appending data to the database: {error}")
        raise error

    finally:
        print("Upload successful.")

# load the json file and call the function
import json
def main():
    with open('food_data.json', 'r') as file:
        food_data = json.load(file)
        import_json_to_database(food_data)

main()