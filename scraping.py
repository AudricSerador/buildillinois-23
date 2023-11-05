from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import re
from datetime import datetime
import json

WAIT_TIME_SECONDS = 2

class DiningWebScraper:
    def __init__(self) -> None:
        self.driver = webdriver.Chrome()
        self.data = {"diningHalls": []}
        self.driver.get('https://eatsmart.housing.illinois.edu/NetNutrition/46')
        print('waiting for page to load!\n\n')
    
    def __del__(self):
        self.driver.quit()
    
    def readToJSON(self):
        with open('data/data.json', 'w') as json_file:
            json.dump(self.data, json_file, indent=3)
        print("Dining data successfully convertered to JSON.")
    
    def resetDiningPage(self):
        home = self.driver.find_element(By.XPATH, "//a[@href='']")
        home.click()
        
    def returnToPreviousPage(self):
        prev = self.driver.find_element()
        prev.click()
        
        
    # Must be in page context of foodData (foodType dropdowns expanded on page)
    def getNutritionData(self, on_click):
        data =  {
                "servingSize": "N/A",
                "calories": "0",
                "caloriesFat": "0",
                "totalFat": "0g",
                "saturatedFat": "0g",
                "transFat": "0g",
                "polyFat": "0g",
                "monoFat": "0g",
                "cholesterol": "0mg",
                "sodium": "0mg",
                "potassium": "0mg",
                "totalCarbohydrates": "0g",
                "fiber": "0g",
                "sugars": "0g",
                "protein": "0g"}

        self.driver.execute_script(on_click)
        wait = WebDriverWait(self.driver, WAIT_TIME_SECONDS)
        nutrition_modal = wait.until(EC.visibility_of_element_located((By.XPATH, '//div[@id="nutritionLabel"]')))
        
        data['servingSize'] = nutrition_modal.find_element(By.XPATH, './/td[@class="cbo_nn_LabelBottomBorderLabel"]').text
        nutrition_data = nutrition_modal.find_elements(By.XPATH, './/span[@class="cbo_nn_SecondaryNutrient" or @class="cbo_nn_LabelPrimaryDetailIncomplete"]')
        
        # Define the order of keys to match the order of nutrition_data
        keys = [
            "calories", "caloriesFat", "totalFat", "saturatedFat", "transFat",
            "polyFat", "monoFat", "cholesterol", "sodium", "potassium",
            "totalCarbohydrates", "fiber", "sugars", "protein"
        ]

        for key, nutrition in zip(keys, nutrition_data):
            text = nutrition.text
            if 'mg' in text or 'g' in text:
                value = ''.join(filter(str.isdigit, text))
                data[key] = value
            else:
                data[key] = text
        self.driver.execute_script('javascript:NetNutrition.UI.closeNutritionDetailPanel(true);')
        return data
        
    # Must be in page context of food menu for specific hall, facility, date, and meal type
    def getFoodData(self):
        data = []
        print("<--------Attempting to find food data---------->")
        WebDriverWait(self.driver, WAIT_TIME_SECONDS).until(EC.presence_of_element_located((By.XPATH, '//div[@class="table-responsive pt-3"]')))
        food_section = self.driver.find_element(By.XPATH, '//div[@class="table-responsive pt-3"]')
        food_type_btns = food_section.find_elements(By.XPATH, './/tr[@class="cbo_nn_itemGroupRow bg-faded"]')
        for type_btn in food_type_btns:
            if type_btn.get_attribute("aria-expanded") == "true":
                continue
            on_click = type_btn.get_attribute("onClick")
            self.driver.execute_script(on_click)
        print("<--------Buttons clicked, attempting to read food data---------->")
        foods = self.driver.find_elements(By.XPATH, '//a[@title="Open the nutrition label for this item"]')
        print(foods)
        print("<--------Food data found, starting food data iteration---------->")
        for food in foods:
            food_data = {"foodName": "", "onClick": "", "nutritionFacts": {}}
            food_data['foodName'] = food.get_attribute("textContent")
            nutrition_id = re.search(r'\d+$', food.get_attribute("id")).group(0) 
            food_data['onClick'] = f'javascript:NetNutrition.UI.getItemNutritionLabel({nutrition_id});'
            food_data["nutritionFacts"] = self.getNutritionData(food_data['onClick'])
            
            data.append(food_data)
            print(food_data)
        return data
    
    def getMealDateData(self):
        pass
    
    # implement later
    def getFoodsByNutritionalValue(self, value, threshold):
        if threshold < 0 or threshold > 100:
            raise ValueError("Invalid threshold values. Must be from 0-100.")
        if value not in ['protein', 'calorie', 'carbohydrate', 'sugar', 'fiber', 'fat', 'potassium', 'cholesterol']:
            raise ValueError("Invalid nutritional value entered.")
    
    def populateData(self):
        WebDriverWait(self.driver, WAIT_TIME_SECONDS).until(EC.presence_of_element_located((By.ID, 'cbo_nn_sideUnitDataList')))
        halls_section = self.driver.find_element(By.ID, 'cbo_nn_sideUnitDataList')
        halls = halls_section.find_elements(By.XPATH, './/a')
        
        # Save hall data
        for hall in halls:
            text_content = hall.get_attribute("textContent")
            on_click = hall.get_attribute("onClick")
            hall_info = {"hallName": text_content, "onClick": on_click, "diningFacilities": []}
            self.data['diningHalls'].append(hall_info)
            print(hall_info)
        
        # Get dining facilities in each hall,w save data
        for hall_info in self.data['diningHalls']:
            self.driver.execute_script(hall_info["onClick"])
            try:
                WebDriverWait(self.driver, WAIT_TIME_SECONDS).until(EC.presence_of_element_located((By.ID, 'cbo_nn_childUnitDataList')))
                facility_section = self.driver.find_element(By.ID, 'cbo_nn_childUnitDataList')
                facilities = facility_section.find_elements(By.XPATH, './/a[@class="text-white"]')
                
                for facility in facilities:
                    text_content = facility.get_attribute("textContent")
                    on_click = facility.get_attribute("onClick")
                    facility_info = {"facilityName": text_content, "onClick": on_click, "mealDates": []}
                    hall_info["diningFacilities"].append(facility_info)
                    print(facility_info)
             # Cases when dining facilities do not have separate facilities
            except Exception as e:
                null_facility = {"facilityName": "None",  "onClick": "None", "mealDates": []}
                hall_info['diningFacilities'].append(null_facility)
                print(null_facility)
            self.resetDiningPage()
            
        # Get meals in each dining facility on each date
        for hall_info in self.data['diningHalls']:
            self.driver.execute_script(hall_info["onClick"])
            for facility_info in hall_info['diningFacilities']:
                if facility_info['onClick'] != "None":
                    self.driver.execute_script(facility_info['onClick'])
                WebDriverWait(self.driver, WAIT_TIME_SECONDS).until(EC.visibility_of_element_located((By.ID, 'cbo_nn_menuListDiv'))) 
                      
                try: # Check if facility is serving food in the first place (ex. Caffeinator)
                    menu_section = self.driver.find_element(By.XPATH, '//div[@id="cbo_nn_menuTableDiv"]')
                    meal_dates = menu_section.find_elements(By.XPATH, './/section[@class="card mb-3 h4"]')
                
                    for meal_date in meal_dates:
                        wait = WebDriverWait(meal_date, WAIT_TIME_SECONDS)
                        date = wait.until(EC.visibility_of_element_located((By.XPATH, './/header[@class="card-title h4"]'))).text
                        # Only get data from today's date and beyond
                        if(datetime.strptime(date, "%A, %B %d, %Y").date() < (datetime.today().date())):
                            print(f"invalid date ({date}). Moving to next date")
                            continue
                        meal_types = meal_date.find_elements(By.XPATH, './/a[@class="cbo_nn_menuLink"]')
                        on_click_meal_types = {meal_type.get_attribute("textContent") : meal_type.get_attribute("onClick") for meal_type in meal_types}
                        print(on_click_meal_types)
                        
                        meal_date_info = {"date": date, "breakfast": [], "lunch": [], "dinner": [], "lightLunch": []}
                        
                        for meal_type, on_click in on_click_meal_types.items():
                            self.driver.execute_script(on_click) # Click into food menu, from lunch, dinner, etc.
                            match meal_type:
                                case "Breakfast":
                                    try:
                                        meal_date_info["breakfast"] = self.getFoodData()  
                                    except Exception as e:
                                        meal_date_info["breakfast"] = []
                                case "Lunch":
                                    try:
                                        meal_date_info["lunch"] = self.getFoodData()  
                                    except Exception as e:
                                        meal_date_info["lunch"] = []
                                case "Dinner":
                                    try:
                                        meal_date_info["dinner"] = self.getFoodData()  
                                    except Exception as e:
                                        meal_date_info["dinner"] = []
                                case "Light Lunch":
                                    try:
                                        meal_date_info["lightLunch"] = self.getFoodData()  
                                    except Exception as e:
                                        print("light lunch was not found")
                                        meal_date_info["lightLunch"] = []
                                case _:
                                    try:
                                        meal_date_info[meal_type] = self.getFoodData()  
                                    except Exception as e:
                                        meal_date_info[meal_type] = []
                            self.driver.execute_script('javascript:NetNutrition.UI.menuDetailBackBtn();')
                except Exception as e:
                    print(f"\nError finding meal dates: {e}\n")
                    continue
                facility_info['mealDates'].append(meal_date_info)
                    
                self.driver.execute_script('javascript:NetNutrition.UI.menuListBackBtn();')

        print(f"\n\n\n{self.data}")
        
            


    