# -*- coding: utf-8 -*-

from bs4 import BeautifulSoup
import urllib.parse
import urllib.request

import re
import ssl

import asyncio 
import aiohttp

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
		self.recipe["rct"] = COOKING_METHOD["BAKING_TRAY"] + COOKING_METHOD["MICRO_WAVE"] +  COOKING_METHOD["BARBECUE"]
		return self
	
	def withoutCooking(self):
		self.recipe["rct"] = COOKING_METHOD["WITHOUT_COOKING"]
		return self

	

#type : recipe, season, menuSuggestion










class Marmiton:
	@staticmethod
	def searchCategory(query_dict):
		base_url = "http://www.marmiton.org/recettes/recherche.aspx?"
		query_url = urllib.parse.urlencode(query_dict)
		search_data = []
		
		async def scrap(html):
			soup = BeautifulSoup(html, 'html.parser')
			links = [a["href"].split("_")[1] for a in soup.find_all('a', href=True) 
					if a["href"].startswith("https://www.marmiton.org/recettes/recette_")]	
			return links
		
		async def fetch_scrap(session, current_page):
			url = f"{base_url}{query_url}&page={current_page}"
			async with session.get(url) as response:
				html = await response.text()
				return await scrap(html)
		
		async def get_urls_from_pages(session):
			tasks = [fetch_scrap(session, current_page) for current_page in range(1, NUMBER_PAGES + 1)]
			urls = await asyncio.gather(*tasks)
			return urls

		async def main(search_data):
			async with aiohttp.ClientSession() as session:
				urls = await get_urls_from_pages(session)
				for response_in_one_page in urls:
					search_data += response_in_one_page
		asyncio.run(main(search_data))
			
				
		#Super slow !!!!
		"""
		recipe = search_data[0]
		main_recipe_url = recipe['url']
		detailed_recipe = Marmiton.get(main_recipe_url)  # Get the details of the first returned recipe (most relevant in our case)
		"""
		print(search_data)
		return search_data
		

	
	@staticmethod
	def search(query_dict):
		"""
		Search recipes parsing the returned html data.
		Options:
		'aqt': string of keywords separated by a white space  (query search)
		Optional options :
		'dt': "entree" | "platprincipal" | "accompagnement" | "amusegueule" | "sauce"  (plate type)
		'exp': 1 | 2 | 3  (plate expense 1: cheap, 3: expensive)
		'dif': 1 | 2 | 3 | 4  (recipe difficultie 1: easy, 4: advanced)
		'veg': 0 | 1  (vegetarien only: 1)
		'rct': 0 | 1  (without cook: 1)
		'sort': "markdesc" (rate) | "popularitydesc" (popularity) | "" (empty for relevance)
		"""

		
		base_url = "http://www.marmiton.org/recettes/recherche.aspx?"
		query_url = urllib.parse.urlencode(query_dict)

		url = base_url + query_url

		handler = urllib.request.HTTPSHandler(context=ssl._create_unverified_context())
		opener = urllib.request.build_opener(handler)
		response = opener.open(url)
		html_content = response.read()
		

		soup = BeautifulSoup(html_content, 'html.parser')
		search_data = []

		articles = soup.findAll("a", href=True)
		articles = [a for a in articles if ("/recettes/recette_" in a["href"])]
		iterarticles = iter(articles)
		for article in iterarticles:
			data = {}
			try:
				data["name"] = article.find("h4").get_text().strip(' \t\n\r')
				data["url"] = article['href']
				""""
				try:
					data["rate"] = article.find("span").get_text().split("/")[0]
				except Exception as e0:
					pass
				try:
					data["image"] = article.find('img')['data-src']
				except Exception as e1:
					try:
						data["image"] = article.find('img')['src']
					except Exception as e1:
						pass
					pass"""
			except Exception as e2:
				pass

			if data:
				search_data.append(data)
			
			#Super slow !!!!
			"""
			recipe = search_data[0]
			main_recipe_url = recipe['url']
			detailed_recipe = Marmiton.get(main_recipe_url)  # Get the details of the first returned recipe (most relevant in our case)
			"""

		return search_data
		return detailed_recipe

	@staticmethod
	def _get_name(soup):
		return soup.find("h1").get_text().strip(' \t\n\r')

	@staticmethod
	def _get_ingredients(soup):

		quantity = [item["data-ingredientquantity"] for item in soup.findAll("span", {"class": "card-ingredient-quantity"})]
		unit = [item["data-unitsingular"] for item in soup.findAll("span", {"class": "unit"})]
		ingredients = [item["data-ingredientnamesingular"] for item in soup.findAll("span", {"class":"ingredient-name"})]
		return list(zip(quantity, unit, ingredients))

	@staticmethod
	def _get_author_tip(soup):
		return soup.find("div", text="Note de l'auteur :").parent.parent.findAll("div")[3].find_all("div")[1].get_text().replace("\xa0", " ").replace("\r\n", " ").replace("  ", " ").replace("« ", "").replace(" »", "")

	@staticmethod
	def _get_steps(soup):
		return [" ".join(step.text.strip().replace("\n", " ").split(" ")[2:]).strip() for step in soup.findAll("div", {"class": "recipe-step-list__container"})]

	@staticmethod
	def _get_images(soup):
		return [img.get("data-srcset") for img in soup.find_all("img") if img.get("data-srcset")]

	@staticmethod
	def _get_rate(soup):
		return soup.find("span", {"class": "recipe-header__rating-text"}).text

	@staticmethod
	def _get_nb_comments(soup):
		return soup.find("div", {"class": "recipe-header__comment"}).text.strip().split()[0]

	@classmethod
	def _get_total_time(cls, soup):
		return cls._get_total_time__difficulty__budget(soup)[0].replace("\xa0", " ")
	
	@classmethod
	def _get_total_time__difficulty__budget(cls, soup):
		return [item.findChildren("span")[0].text for item in soup.findAll("div", {"class": "recipe-primary__item"})]

	@classmethod
	def _get_difficulty(cls, soup):
		return cls._get_total_time__difficulty__budget(soup)[1]

	@classmethod
	def _get_budget(cls, soup):
		return cls._get_total_time__difficulty__budget(soup)[2]
	
	def _total_time(cls, soup):
		return cls._get_total_time__difficulty__budget(soup)[0]
	
	@staticmethod
	def _get_cook_time(soup):
		return soup.find_all(text=re.compile("Préparation"))[1].parent.next_sibling.next_sibling.get_text().replace("\xa0", " ")

	@staticmethod
	def _get_prep_time(soup):
		return soup.find_all(text=re.compile("Cuisson"))[0].parent.next_sibling.next_sibling.get_text().replace("\xa0", " ")

	@staticmethod
	def _get_recipe_quantity(soup):
		return [item["data-servingsnb"] for item in soup.findAll("div", {"class": "mrtn-recette_ingredients-counter"})][0]

	@classmethod
	def get(cls, url):

		try:
			handler = urllib.request.HTTPSHandler(context=ssl._create_unverified_context())
			opener = urllib.request.build_opener(handler)
			response = opener.open(url)
			html_content = response.read()
		except urllib.error.HTTPError as e:
			pass

		soup = BeautifulSoup(html_content, 'html.parser')
		elements = [
			{"name": "images", "default_value": []},
			{"name": "name", "default_value": ""},
			{"name": "ingredients", "default_value": []},
			{"name": "author", "default_value": "Anonyme"},
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
			except:
				data[element["name"]] = element["default_value"]
		return data

	@staticmethod
	def displayRecipe(detailed_recipe):
		print("## %s\n" % detailed_recipe['name'])  # Name of the recipe
		print("Noté %s par %s personnes." % (detailed_recipe['rate'], detailed_recipe['nb_comments']))
		print("Temps de cuisson : %s / Temps de préparation : %s / Temps total : %s." % (detailed_recipe['cook_time'] if detailed_recipe['cook_time'] else 'N/A',detailed_recipe['prep_time'], detailed_recipe['total_time']))
		print("Difficulté : '%s'" % detailed_recipe['difficulty'])
		print("Budget : '%s'" % detailed_recipe['budget'])

		print("\nRecette pour %s :\n" % detailed_recipe['recipe_quantity'])
		for ingredient in detailed_recipe['ingredients']:  # List of ingredients
			print("-", ingredient[0], ingredient[1])

		print("")

		for step in detailed_recipe['steps']:  # List of cooking steps
			print("# %s\n" % step)

		if detailed_recipe['author_tip']:
			print("\nNote de l'auteur :\n%s" % detailed_recipe['author_tip'])

