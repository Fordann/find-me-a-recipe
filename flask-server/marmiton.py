# -*- coding: utf-8 -*-

from bs4 import BeautifulSoup
import urllib.parse
import urllib.request

import re
import ssl

import asyncio
import aiohttp

# --- Constantes ---
NUMBER_PAGES = 2
RECIPE_PRICE = {
"CHEAP": 1,
"MEDIUM": 2,
"EXPENSIVE": 3,
}

RECIPE_DIFFICULTY = {
"VERY_EASY": 1,
"EASY": 2,
"MEDIUM": 3,
"HARD": 4,
}

RECIPE_KIND = {
"STARTER": 'entree',
"MAIN_COURSE": 'platprincipal',
"DESSERT": 'dessert',
"SIDE_DISH": 'accompagnement',
"SAUCE": 'sauce',
"BEVERAGE": 'boisson',
"CANDY": 'confiserie',
"ADVICE": 'conseil',
}

RECIPE_WITHOUT_KIND_FOOD = {
	"VEGE": 1,
	"GLUTEN_FREE": 2,
	"VEGAN": 3,
	"LACTOSE_FREE": 4,
	"HEALTHY": 5,
}

COOKING_METHOD = {
	"OVEN": 1,
	"BAKING_TRAY": 2,
	"WITHOUT_COOKING": 3,
	"MICRO_WAVE": 4,
	"BARBECUE": 5,
}


class Recipe:
	def __init__(self):
		self.recipe = {"aqt":""}
	
	def buildRecipe(self):
		return self.recipe
	
	def withTitleContaining(self, keywords):
		self.recipe["aqt"] += "-" + keywords
		return self
	
	def withPrice(self, price):
		self.recipe["exp"] = RECIPE_PRICE[price]
		return self
	
	def withDifficulty(self, difficulty):
		self.recipe["dif"] = RECIPE_DIFFICULTY[difficulty]
		return self
		
	def withType(self, kind):
		self.recipe["dt"] = RECIPE_KIND[kind]
		return self

	def takingLessThan(self, time_limit):
		self.recipe["ttlt"] = time_limit
		return self

	def vegetarian(self):
		self.recipe["prt"] = RECIPE_WITHOUT_KIND_FOOD["VEGE"]
		return self

	def vegan(self):
		self.recipe["prt"] = RECIPE_WITHOUT_KIND_FOOD["VEGAN"]
		return self
		
	def withoutGluten(self):
		self.recipe["prt"] = RECIPE_WITHOUT_KIND_FOOD["GLUTEN_FREE"]
		return self
	
	def withoutDairyProducts(self):
		self.recipe["prt"] = RECIPE_WITHOUT_KIND_FOOD["LACTOSE_FREE"]
		return self
	
	def withoutOven(self):
		self.recipe["rct"] = COOKING_METHOD["BAKING_TRAY"] + COOKING_METHOD["MICRO_WAVE"] + COOKING_METHOD["BARBECUE"]
		return self
	
	def withoutCooking(self):
		self.recipe["rct"] = COOKING_METHOD["WITHOUT_COOKING"]
		return self


class Marmiton:
    @staticmethod
    async def searchCategory_async_only(query_dict):
        base_url = "http://www.marmiton.org/recettes/recherche.aspx?"
        query_url = urllib.parse.urlencode(query_dict)
        search_data = []
        
        async def scrap(html):
            soup = BeautifulSoup(html, 'html.parser')
            # Target links on search results page
            links = [li.find('a')['href'] for li in soup.find_all('li', class_='search-list__item') if li.find('a', href=True)]
            recipe_urls = []
            for l in links:
                if 'recette_' in l:
                    # Convert relative URL to absolute URL
                    recipe_urls.append(f"https://www.marmiton.org{l}") if l.startswith('/') else recipe_urls.append(l)
            return recipe_urls
        
        async def fetch_scrap(session, current_page):
            url = f"{base_url}{query_url}&page={current_page}"
            headers = {'User-Agent': 'Mozilla/5.0'}
            # Add ssl=False argument for aiohttp.ClientSession.get
            async with session.get(url, headers=headers, ssl=False) as response:
                html = await response.text()
                return await scrap(html)
        
        async def get_urls_from_pages(session):
            tasks = [fetch_scrap(session, current_page) for current_page in range(1, NUMBER_PAGES + 1)]
            urls = await asyncio.gather(*tasks)
            return urls

        async def main():
            # Requires aiohttp.ClientSession with ssl=False to handle potentially unverified certificates
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl._create_unverified_context())) as session:
                urls = await get_urls_from_pages(session)
                for response_in_one_page in urls:
                    search_data.extend(response_in_one_page)
                return search_data

        return await main()
        
    # --- SYNCHRONOUS WRAPPER (Called by Flask /research_recipe) ---
    @staticmethod
    def searchCategory(query_dict, html_content=None):
        """Synchronous wrapper to execute async coroutine."""
        try:
            # Create new event loop to avoid conflicts in synchronous environment
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(Marmiton.searchCategory_async_only(query_dict))
            finally:
                loop.close()
        except Exception as e:
            # You can keep print(f"Category search error: {e}") for debugging
            return []


    # --- SYNCHRONOUS (Used by Flask /detailed_recipe to find URL) ---
    @staticmethod
    def search(query_dict, html_content=None):
        """Synchronous search of first results page."""
        base_url = "http://www.marmiton.org/recettes/recherche.aspx?"
        query_url = urllib.parse.urlencode(query_dict)
        url = base_url + query_url
        search_data = []

        try:
            handler = urllib.request.HTTPSHandler(context=ssl._create_unverified_context())
            opener = urllib.request.build_opener(handler)
            opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')]
            response = opener.open(url)
            html_content = response.read()
        except urllib.error.URLError:
            return []

        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Target <li class="search-list__item"> element
        for item in soup.find_all("li", class_="search-list__item"):
            data = {}
            try:
                title_tag = item.find("a", class_="card-content__title")
                if title_tag:
                    data["name"] = title_tag.get_text().strip()
                    href = title_tag['href']
                    data["url"] = f"https://www.marmiton.org{href}" if href.startswith('/') else href
                    data["id"] = item.get('data-algolia-object-id', '').replace('recipe#', '')
            except Exception:
                pass

            if data and data.get("url"):
                search_data.append(data)

        return search_data
        
    # --- SCRAPING DÉTAILLÉ DE LA RECETTE (Marmiton.get) ---

    @classmethod
    def get(cls, url):
        # Use provided URL (the one that generated the HTML) for the request
        try:
            handler = urllib.request.HTTPSHandler(context=ssl._create_unverified_context())
            opener = urllib.request.build_opener(handler)
            opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')] 
            response = opener.open(url)
            html_content = response.read()
        except urllib.error.URLError as e:
            return {"url": url, "error": str(e)}

        soup = BeautifulSoup(html_content, 'html.parser')
        elements = [
            {"name": "images", "default_value": []},
            {"name": "name", "default_value": ""},
            {"name": "ingredients", "default_value": []},
            {"name": "author_tip", "default_value": ""},
            {"name": "steps", "default_value": []},
            {"name": "rate", "default_value": ""},
            {"name": "difficulty", "default_value": ""},
            {"name": "budget", "default_value": ""},
            {"name": "cook_time", "default_value": ""},
            {"name": "prep_time", "default_value": ""},
            {"name": "total_time", "default_value": ""},
            {"name": "recipe_quantity", "default_value": ""},
            {"name": "nb_comments", "default_value": 0},
        ]

        data = {"url": url}
        for element in elements:
            try:
                data[element["name"]] = getattr(cls, "_get_" + element["name"])(soup)
            except Exception:
                data[element["name"]] = element["default_value"]
            
        try:
            author_tag = soup.find('span', class_='recipe-author-note__author-name')
            data['author'] = author_tag.get_text().strip() if author_tag else 'Anonyme'
        except:
            data['author'] = 'Anonyme'
            
        return data

    # --- DETAILED RECIPE SCRAPING METHODS ---

    @staticmethod
    def _get_name(soup):
        # Target <h1> tag with "main-title" class
        name_tag = soup.find('h1', class_='main-title')
        return name_tag.get_text().strip() if name_tag else ""

    @staticmethod
    def _get_ingredients(soup):
        # Use <div class="card-ingredient"> elements in new structure
        ingredients_list = []
        for item in soup.find_all("div", class_="card-ingredient"):
            try:
                quantity_tag = item.find("span", class_="card-ingredient-quantity")
                unit_tag = item.find("span", class_="unit")
                name_tag = item.find("span", class_="ingredient-name")
                
                # Extract values or empty strings
                quantity = quantity_tag.find("span", class_="count").get_text().strip() if quantity_tag and quantity_tag.find("span", class_="count") else ""
                unit = unit_tag.get_text().strip() if unit_tag else ""
                name = name_tag.get_text().strip() if name_tag else ""
                
                # Add quantity, unit and ingredient name
                if name:
                    ingredients_list.append((quantity, unit, name))
            except AttributeError:
                # Ignore malformed ingredient divs
                continue
        return ingredients_list

    @staticmethod
    def _get_author_tip(soup):
        # "Author's note" seems to have disappeared in new HTML structure
        # Use more generic selector if format changes
        tip_div = soup.find("div", class_="recipe-author-note__text") # Potential new class
        return tip_div.get_text().strip().replace("\xa0", " ").replace("\r\n", " ").replace("  ", " ").replace("« ", "").replace(" »", "") if tip_div else ""

    @staticmethod
    def _get_steps(soup):
        # Steps are now in <p> tags inside <div class="recipe-step-list__container">
        steps = []
        step_containers = soup.find_all("div", class_="recipe-step-list__container")
        
        for container in step_containers:
            # Text is directly in <p> tag
            step_text = container.find("p")
            if step_text:
                text = step_text.get_text().strip()
                # Clean line breaks / multiple spaces
                steps.append(re.sub(r'\s+', ' ', text).strip())
        
        return steps

    @staticmethod
    def _get_images(soup):
        images = []
        # Target main image - try to get highest quality version
        main_img = soup.find('img', id='af-diapo-desktop-0_img')
        if main_img:
            # First try data-srcset for highest resolution
            srcset = main_img.get('data-srcset')
            if srcset:
                # Parse srcset to get the largest image
                # Format: "url1 300w, url2 600w, url3 1200w"
                srcset_entries = [s.strip() for s in srcset.split(',')]
                if srcset_entries:
                    # Get the last entry (usually highest resolution)
                    largest = srcset_entries[-1].split()[0]
                    images.append(largest)
            # Fallback to data-src if srcset not available
            elif main_img.get('data-src'):
                images.append(main_img['data-src'])
        
        # You can also extract URLs from <script type="application/ld+json"> tag of type "Recipe"
        # but current code uses diapo block, we'll keep it for now.
        return images


    @staticmethod
    def _get_rate(soup):
        # Use visible rating text next to stars
        rate_span = soup.find("span", class_="recipe-header__rating-text")
        return rate_span.get_text().strip() if rate_span else ""
    
    @staticmethod
    def _get_nb_comments(soup):
        # Target comments div and extract only the number
        comments_div = soup.find("div", class_="recipe-header__comment")
        if comments_div:
            # Use regex to find number (e.g., "3177 commentaires" -> "3177")
            return re.search(r'\d+', comments_div.text).group(0) if re.search(r'\d+', comments_div.text) else 0
        return 0

    @classmethod
    def _get_times_difficulty_budget(cls, soup):
        # Get total time, difficulty and budget from .recipe-primary__item blocks
        data = {}
        info_items = soup.find_all("div", class_="recipe-primary__item")
        
        for item in info_items:
            # Value is in <span> immediately following icon
            value_span = item.find('span')
            value = value_span.get_text().strip().replace("\xa0", " ") if value_span else ""

            # Check icon content to know which data we have (or visible value)
            if "min" in value or "h" in value:
                 # First item is often total time
                 if "total_time" not in data:
                     data["total_time"] = value
            elif "difficul" in value.lower():
                 data["difficulty"] = value
            elif "marché" in value.lower() or "budget" in value.lower():
                 data["budget"] = value
            # Use LD+JSON code for more reliable source if available
            
        return data

    @classmethod
    def _get_total_time(cls, soup):
        # If possible, use "totalTime" field from JSON-LD for more reliability
        json_ld_script = soup.find('script', type='application/ld+json', text=re.compile('Recipe'))
        if json_ld_script:
            try:
                import json
                data = json.loads(json_ld_script.text)
                # Format is PTxxM (e.g. PT22M), we clean it
                total_time = data.get("totalTime", "").replace("PT", "").replace("M", " min").replace("H", " h ")
                if total_time:
                    return total_time.strip()
            except Exception:
                pass # Revert to scraping if JSON fails
        
        return cls._get_times_difficulty_budget(soup).get("total_time", "")

    @classmethod
    def _get_difficulty(cls, soup):
        return cls._get_times_difficulty_budget(soup).get("difficulty", "")

    @classmethod
    def _get_budget(cls, soup):
        return cls._get_times_difficulty_budget(soup).get("budget", "")

    @staticmethod
    def _get_cook_time(soup):
        # Recherche la div spécifique pour le temps de cuisson dans le bloc de préparation
        cook_time_div = soup.find('div', class_='time__details')
        if cook_time_div:
            # Cherche la div qui contient le span 'Cuisson'
            for item in cook_time_div.find_all('div'):
                 if item.find('span') and 'Cuisson' in item.find('span').text:
                     # La valeur est le <div> suivant (sibling) ou l'élément suivant dans la liste
                     time_value = item.find('div')
                     return time_value.get_text().strip().replace("\xa0", " ") if time_value else ""
        return ""

    @staticmethod
    def _get_prep_time(soup):
        prep_time_div = soup.find('div', class_='time__details')
        if prep_time_div:
            for item in prep_time_div.find_all('div'):
                 if item.find('span') and 'Préparation' in item.find('span').text:
                     time_value = item.find('div')
                     return time_value.get_text().strip().replace("\xa0", " ") if time_value else ""
        return ""

    @staticmethod
    def _get_recipe_quantity(soup):
        # Use data-servingsnb attribute from counter
        quantity_counter = soup.find("div", class_="mrtn-recette_ingredients-counter")
        if quantity_counter and quantity_counter.get("data-servingsnb"):
            nb = quantity_counter.get("data-servingsnb")
            unit = quantity_counter.get("data-servingsunit", "servings")
            return f"{nb} {unit}"
        return ""

    @staticmethod
    def displayRecipe(detailed_recipe):
        # (This method is not used by Flask API, but kept for completeness)
        print(f"## {detailed_recipe.get('name', 'N/A')}\n") 
        print(f"Rated {detailed_recipe.get('rate', 'N/A')}/5 by {detailed_recipe.get('nb_comments', 0)} people.")
        print(f"Cook time: {detailed_recipe.get('cook_time', 'N/A')} / Prep time: {detailed_recipe.get('prep_time', 'N/A')} / Total time: {detailed_recipe.get('total_time', 'N/A')}.")
        print(f"Difficulty: '{detailed_recipe.get('difficulty', 'N/A')}'")
        print(f"Budget: '{detailed_recipe.get('budget', 'N/A')}'")
        print(f"Author: {detailed_recipe.get('author', 'Anonymous')}")

        print(f"\nRecipe for {detailed_recipe.get('recipe_quantity', 'N/A')}:\n")
        
        ingredients = detailed_recipe.get('ingredients', [])
        if ingredients:
            for quantity, unit, ingredient_name in ingredients: 
                print(f"- {quantity} {unit} {ingredient_name}")
        else:
             print("- Ingredients list not available.")

        print("\nSteps:\n")
        steps = detailed_recipe.get('steps', [])
        if steps:
            for index, step in enumerate(steps, 1):
                print(f"{index}. {step}\n")
        else:
            print("- Steps not available.")

        author_tip = detailed_recipe.get('author_tip')
        if author_tip:
            print(f"\nAuthor's note:\n{author_tip}")