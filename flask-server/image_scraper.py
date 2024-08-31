from bs4 import BeautifulSoup
from selenium import webdriver

def getImageFromIngredient(ingredient): 
    base_url = "https://www.pexels.com/fr-fr/chercher/"
    query_url = ingredient
    url = f"{base_url}{query_url}"
    
    browser = webdriver.Chrome()  # start a web browser
    browser.get(url)  # navigate to URL
    # wait for page to load
    # by waiting for <h1> element to appear on the page

    # retrieve fully rendered HTML content
    content = browser.page_source
    browser.close()

    # we then could parse it with beautifulsoup

    soup = BeautifulSoup(content, "html.parser")
    grids = soup.find_all("article")
    result = [grid.find("img")["src"] for grid in grids]
    return result[0]
    