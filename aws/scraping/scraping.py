from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from supabase import create_client, Client
from tempfile import mkdtemp
import os
import uuid
from datetime import datetime, timedelta
import json
import time
import re



NON_VEGAN_INGREDIENTS = {'gelatin', 'fish', 'tuna', 'salmon', 'tilapia', 'rennet', 'carmine', 'isenglass', 'fish sauce', 'anchovies', 'suet', 'lard', 'cochineal', 'shellac', 'cysteine', 'tyrosine', 'enzymes', 'collagen', 'bone char', 'whey', 'casein', 'fish oil', 'omega-3', 'confectioner', 'beeswax', 'oleic acid', 'stearic acid', 'vitamin d3', 'lanolin', 'lecithin', 'glycerides', 'glycerin', 'lactic acid', 'squalane', 'squalene', 'tallow', 'glyceryl stearate', 'vitamin a', 'vitamin b12', 'vitamin d2', 'vitamin d3', 'xanthan gum', 'zinc stearate', 'meat', 'poultry', 'chicken', 'beef', 'pork', 'lamb', 'venison', 'rabbit', 'duck', 'goose', 'turkey', 'veal', 'organ meat', 'wild game', 'seafood', 'shellfish', 'clams', 'crab', 'lobster', 'shrimp', 'oysters', 'mussels', 'eggs', 'egg white', 'egg yolk', 'egg albumen', 'mayonnaise', 'aioli', 'milk', 'butter', 'cheese', 'cream', 'yogurt', 'honey'}
NON_VEGETARIAN_INGREDIENTS = {'gelatin', 'rennet', 'carmine', 'isinglass', 'fish', 'tuna', 'salmon', 'tilapia', 'fish sauce', 'anchovies', 'suet', 'lard', 'cochineal', 'shellac', 'cysteine', 'tyrosine', 'enzymes', 'collagen', 'bone char', 'whey', 'casein', 'fish oil', 'omega-3', 'confectioner', 'beeswax', 'oleic acid', 'stearic acid', 'vitamin d3', 'lanolin', 'lecithin', 'glycerides', 'glycerin', 'lactic acid', 'squalane', 'squalene', 'tallow', 'glyceryl stearate', 'vitamin a', 'vitamin b12', 'vitamin d2', 'vitamin d3', 'xanthan gum', 'zinc stearate', 'meat', 'poultry', 'chicken', 'beef', 'pork', 'lamb', 'venison', 'rabbit', 'duck', 'goose', 'turkey', 'veal', 'organ meat', 'wild game', 'seafood', 'shellfish', 'clams', 'crab', 'lobster', 'shrimp', 'oysters', 'mussels'}

def handler(event, context):
    start_time = time.time()
    food_data = []
    
    today = datetime.now()    
    date = today + timedelta(days=7)
    DATE_TO_SCRAPE = date.strftime('%A, %B %d, %Y')
    
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_KEY")
    supabase: Client = create_client(url, key)
    

    options = webdriver.ChromeOptions()
    service = webdriver.ChromeService("/opt/chromedriver")

    options.binary_location = '/opt/chrome/chrome'
    options.add_argument("--headless=chrome")
    options.add_argument('--no-sandbox')
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1696x1280")
    options.add_argument("--single-process")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-dev-tools")
    options.add_argument("--no-zygote")
    options.add_argument(f"--user-data-dir={mkdtemp()}")
    options.add_argument(f"--data-path={mkdtemp()}")
    options.add_argument(f"--disk-cache-dir={mkdtemp()}")
    options.add_argument("--remote-debugging-port=9222")
    driver = webdriver.Chrome(options=options, service=service)
    driver.get('https://eatsmart.housing.illinois.edu/NetNutrition/46')
    WebDriverWait(driver, 10).until(lambda d: d.execute_script('return document.readyState') == 'complete')
    
    ### GET RESTAURANT DATA ###
    back_to_food_list(driver)
    main_lists = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, '//*[@id="navBarResults"]/div/div'))
        )
    title_elements = main_lists.find_elements(By.XPATH, '//span[@class="text-white"]')
    restaurant_titles = []
    byw_count = 0
    for title in title_elements:
        if title.text == "Build Your Own":
            if byw_count == 0:
                restaurant_titles.append(f"{title.text} (Ike)")
            elif byw_count == 1:
                restaurant_titles.append(f"{title.text} (ISR)")
            elif byw_count == 2:
                restaurant_titles.append(f"{title.text} (PAR)")
            elif byw_count == 3:
                restaurant_titles.append(f"{title.text} (LAR)")
            byw_count += 1
        else:
            restaurant_titles.append(title.text)

    restaurant_meals = []
    restaurant_groups = main_lists.find_elements(By.XPATH, '//ul[@class="list-group"]')
    for meal in restaurant_groups:
        meal_nav = [nav.get_attribute('onclick') for nav in meal.find_elements(By.XPATH, './/li[@class="list-group-item"]')]
        meal_dates = [date.text for date in meal.find_elements(By.XPATH, './/div')]
        restaurant_meals.append(list(zip(meal_nav, meal_dates))) # 0th element: js navigation script, 1st element: date of meal

    # zip meals and titles together and make them into a dictionary
    restaurant_data = dict(zip(restaurant_titles, restaurant_meals))

    ### GET FOOD DATA ###
    for title, data in restaurant_data.items():
        for nav, info in data:
            # Only get food data for current day
            date = info.split('-', 1)[0].strip()
            if date != DATE_TO_SCRAPE:
                continue
            
            print(f"scraping food data for {title} - {info}")
            driver.execute_script(nav)
            get_food_nutrition(title, info, driver, food_data)

    print("All food data scraped. Starting upload to database...")
    import_json_to_database(food_data, supabase)
    
    driver.quit()
            
    end_time = time.time()
    elapsed_time = end_time - start_time
    
    return {
        'statusCode': 200,
        'body': json.dumps(f'Web scraping complete!\nTime taken: {elapsed_time} seconds\nItems scraped: {len(food_data)}')
    }
    
def import_json_to_database(food_data, supabase):
    try:
        for food in food_data:
            existing_food = supabase.table('foodInfo').select().eq('name', food['name']).execute()

            if existing_food['data']:
                for entry in food['mealEntries']:
                    supabase.table('mealDetails').insert({
                        'diningHall': entry['diningHall'],
                        'diningFacility': entry['diningFacility'],
                        'mealType': entry['mealType'],
                        'dateServed': entry['dateServed'],
                        'foodId': existing_food['data'][0]['id'],
                    }).execute()
                print(f"Updated FoodInfo with ID: {existing_food['data'][0]['id']}")
            else:
                new_food = supabase.table('foodInfo').insert({
                    'id': str(uuid.uuid4()),
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
                }, {
                    'returning': 'minimal',  # Only return the number of rows inserted
                }).execute()
                print(f"Created FoodInfo with ID: {new_food['data'][0]['id']}")

                for entry in food['mealEntries']:
                    supabase.table('mealDetails').insert({
                        'diningHall': entry['diningHall'],
                        'diningFacility': entry['diningFacility'],
                        'mealType': entry['mealType'],
                        'dateServed': entry['dateServed'],
                        'foodId': new_food['data'][0]['id'],
                    }).execute()
    except Exception as e:
        print(f"Error appending data to the database: {e}")
        raise e
    finally:
        print("Upload successful.")

def back_to_food_list(driver):
    dropdown = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, '//*[@id="nav-unit-selector"]'))
    )
    current_class = dropdown.get_attribute('class')
    if 'show' not in current_class:
        new_class = current_class + ' show'
    
    driver.execute_script("arguments[0].setAttribute('class', arguments[1]);", dropdown, new_class)
    
    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//a[@class="dropdown-item" and @title="Show All Units"]'))
    )
    time.sleep(1)
    element.click()

def check_preferences(ingredients, name):
    preferences = []
    
    if 'halal' in name.lower():
        preferences.append('halal')
    
    if 'kosher' in name.lower():
        preferences.append('kosher')

    non_vegan_pattern = re.compile('|'.join(NON_VEGAN_INGREDIENTS))
    non_vegetarian_pattern = re.compile('|'.join(NON_VEGETARIAN_INGREDIENTS))

    if non_vegan_pattern.search(ingredients.lower()):
        return ' '.join(preferences)

    preferences.append('vegan')
    preferences.append('vegetarian')

    if non_vegetarian_pattern.search(ingredients.lower()):
        preferences.remove('vegetarian')

    return ' '.join(preferences)

def scrape_nutrition_facts(food_id, driver):
    data =  {   
                "name": "N/A",
                "mealEntries": [],
                "servingSize": "N/A",
                "ingredients": "N/A",
                "allergens": "N/A",
                "preferences": "N/A",
                "calories": 0,
                "caloriesFat": 0,
                "totalFat": 0,
                "saturatedFat": 0,
                "transFat": 0,
                "polyFat": 0,
                "monoFat": 0,
                "cholesterol": 0,
                "sodium": 0,
                "potassium": 0,
                "totalCarbohydrates": 0,
                "fiber": 0,
                "sugars": 0,
                "protein": 0,
                "calciumDV": 0,
                "ironDV": 0,
            }
    
    driver.execute_script(f'javascript:NetNutrition.UI.getItemNutritionLabel({food_id});')
    nutrition_modal = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, '//div[@id="cbo_nn_nutritionDialogInner"]'))
    )
    data['name'] = nutrition_modal.find_element(By.XPATH, './/td[@class="cbo_nn_LabelHeader"]').text
    data['servingSize'] = nutrition_modal.find_element(By.XPATH, './/td[@class="cbo_nn_LabelBottomBorderLabel"]').text.replace("Serving Size: ", "")
    
    try:
        data['ingredients'] = nutrition_modal.find_element(By.XPATH, './/span[@class="cbo_nn_LabelIngredients"]').text
        data['preferences'] = check_preferences(data['ingredients'], data['name'])
    except:
        data['ingredients'] = "N/A"
        data['preferences'] = "N/A"
        
    try:
        data['allergens'] = nutrition_modal.find_element(By.XPATH, './/span[@class="cbo_nn_LabelAllergens"]').text
    except:
        data['allergens'] = "N/A"
    
    nutrition_data = nutrition_modal.find_elements(By.XPATH, './/span[@class="cbo_nn_SecondaryNutrient" or @class="cbo_nn_LabelPrimaryDetailIncomplete"]')
    keys = [
        "calories", "caloriesFat", "totalFat", "saturatedFat", "transFat",
        "polyFat", "monoFat", "cholesterol", "sodium", "potassium",
        "totalCarbohydrates", "fiber", "sugars", "protein"
    ]
    for key, nutrition in zip(keys, nutrition_data):
        text = nutrition.text
        if text.strip().isdigit():
            data[key] = int(text)
        elif 'mg' in text or 'g' in text:
            value = ''.join(filter(str.isdigit, text))
            data[key] = int(value) if value else 0
        else:
            data[key] = 0
    
    secondary_rows = nutrition_modal.find_elements(By.XPATH, './/table[@class="cbo_nn_LabelSecondaryTable"]/tbody/tr')
    for row in secondary_rows:
        nutrient_name = row.find_element(By.XPATH, './/td[@class="cbo_nn_SecondaryNutrientLabel"]').text.lower()
        nutrient_value = row.find_element(By.XPATH, './/td[@class="cbo_nn_SecondaryNutrient" or @class="cbo_nn_SecondaryNutrientIncomplete"]').text

        if nutrient_name in ["calcium", "iron"]:
            nutrient_value = nutrient_value.replace('%', '').strip()
            if nutrient_value.isdigit():
                data[nutrient_name + "DV"] = int(nutrient_value)   
            
    driver.execute_script('javascript:NetNutrition.UI.closeNutritionDetailPanel(true);')

    return data


def get_dining_hall_name(facility_name):
    if facility_name in ["Baked Expectations", "Don's Chophouse", "Euclid Street Deli", "Gregory Drive Diner", "Penne Lane", "Prairie Fire", "Soytainly", "Inclusive Solutions Kitchen at Ikenberry", "Build Your Own (Ike)"]:
        return 'Ikenberry Dining Center (Ike)'
    elif facility_name in ["Fusion 48", "Inclusive Solutions Kitchen at ISR", "Build Your Own (ISR)", "Grains & Greens", "Grillworks", "Latitude", "Saporito Pasta", "Saporito Pizza", "Rise & Dine", "Cafe a la Crumb"]:
        return 'Illinois Street Dining Center (ISR)'
    elif facility_name in ["Sky Garden", "Abbondante Grill", "Abbondante Pizza & Pasta", "Arugula's Salad Bar", "La Avenida", "Provolone Soup, Salad, Deli & Dessert Station", "Build Your Own (PAR)"]:
        return 'Pennsylvania Avenue Dining Hall (PAR)'
    elif facility_name in ["LAR Daily Menu", "Build Your Own (LAR)", "Kosher Kitchen"]:
        return 'Lincoln Avenue Dining Hall (Allen)'
    elif facility_name in ["Field of Greens"]:
        return 'Field of Greens (LAR)'
    else:
        return facility_name

def get_food_nutrition(title, info, driver, food_data):
    elements_present = EC.presence_of_element_located((By.XPATH, '//a[starts-with(@id, "showNutrition_")]'))
    WebDriverWait(driver, 10).until(elements_present)

    food_ids = [food.get_attribute('id') for food in driver.find_elements(By.XPATH, '//a[starts-with(@id, "showNutrition_")]')]
    for food_id in food_ids:
        parsed_id = food_id.split('_')[-1]
        data_to_add = scrape_nutrition_facts(parsed_id, driver)
        
        meal_details = {}
        meal_details['diningFacility'] = title
        meal_details['diningHall'] = get_dining_hall_name(title)
        meal_details['dateServed'], meal_details['mealType'] = [part.strip() for part in info.split('-', 1)] if '-' in info else (None, None)
        
        existing_food = next((food for food in food_data if food['name'] == data_to_add['name']), None)
        
        if existing_food:
            duplicate_meal = next((meal for meal in existing_food['mealEntries'] if meal == meal_details), None)
            if not duplicate_meal:
                existing_food['mealEntries'].append(meal_details)
        else:
            data_to_add['mealEntries'].append(meal_details)
            food_data.append(data_to_add)






