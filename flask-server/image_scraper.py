from bs4 import BeautifulSoup
import requests

def getImageFromIngredient(ingredient):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    base_url = "https://www.pexels.com/fr-fr/chercher/"
    query_url = ingredient
    url = f"{base_url}{query_url}"
    html = requests.get(url, headers=headers).content
    soup = BeautifulSoup(html, 'html.parser')
    print(soup.prettify())
    image_link = soup.find_all("div", {"class": "BreakpointGrid_column__9MIoh"})
     
    return image_link
    
print(getImageFromIngredient("fromage"))

