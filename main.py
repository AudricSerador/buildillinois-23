from scraping import DiningWebScraper
import time

scraper = DiningWebScraper()

time.sleep(10)
scraper.resetDiningPage()
time.sleep(10)

scraper.getFoodsByNutritionalValue("protein", 50)