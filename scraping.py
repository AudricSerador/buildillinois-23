from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


class DiningWebScraper:
    def __init__(self) -> None:
        self.driver = webdriver.Chrome()
        self.data = {"diningHalls": []}
        self.driver.get('https://eatsmart.housing.illinois.edu/NetNutrition/46')
        print('waiting for page to load!\n\n')
    
    def __del__(self):
        self.driver.quit()
    
    def resetDiningPage(self):
        home = self.driver.find_element(By.XPATH, "//a[@href='']")
        home.click()
    
    def getFoodsByNutritionalValue(self, value, threshold):
        if threshold < 0 or threshold > 100:
            raise ValueError("Invalid threshold values. Must be from 0-100.")
        if value not in ['protein', 'calorie', 'carbohydrate', 'sugar', 'fiber', 'fat', 'potassium', 'cholesterol']:
            raise ValueError("Invalid nutritional value entered.")
        time.sleep(1)
        
        halls_section = self.driver.find_element(By.ID, 'cbo_nn_sideUnitDataList')
        halls = halls_section.find_elements(By.XPATH, './/a')
        
        # Save hall data
        for hall in halls:
            text_content = hall.get_attribute("textContent")
            on_click = hall.get_attribute("onClick")
            hall_info = {"hall_name": text_content, "onClick": on_click, "diningFacilities": []}
            print(hall_info)
            self.data['diningHalls'].append(hall_info)
        
        # Get dining facilities in each hall,w save data
        idx = 0
        for hall in halls:
            self.driver.execute_script(self.data['diningHalls'][idx]["onClick"])
            time.sleep(1)
            
            facility_section = self.driver.find_element(By.ID, 'cbo_nn_childUnitDataList')
            facilities = facility_section.find_elements(By.XPATH, './/a[@class="text-white"]')
            for facility in facilities:
                text_content = facility.get_attribute("textContent")
                on_click = hall.get_attribute("onClick")
                facility_info = {"facility_name": text_content, "onClick": on_click, "mealDates": []}
                print(facility_info)
                self.data['diningHalls'][idx]["diningFacilities"].append(facility_info)
            
            self.resetDiningPage()
            time.sleep(1)
            idx += 1
        time.sleep(3)
        '''
        if text_content.strip():  # Check if the text content is not empty or contains only whitespace
            print(text_content)
        
        if(on_click):
            try:
                self.driver.execute_script(on_click)
            except Exception as e:
                print(f"Javascript Error: {e}")
            self.driver.implicitly_wait(5)
            self.resetDiningPage()
        '''
        
            


    