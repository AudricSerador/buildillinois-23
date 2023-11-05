from scraping import DiningWebScraper
import json
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    with open('data/data.json') as json_file:
        json_data = json.load(json_file)
    return render_template('index.html', json_data=json_data)

@app.route('/scrape')
def scrape():
    scraper = DiningWebScraper()
    scraper.populateData()
    scraper.readToJSON()
    return render_template('scrape.html')

if __name__ == '__main__':
    app.run(debug=True)
    

