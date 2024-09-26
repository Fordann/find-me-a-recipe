from flask import Flask, request
from marmiton import Marmiton, Recipe
from image_scraper import getImageFromIngredient
api = Flask(__name__)

@api.route('/research_recipe', methods=["POST"])
def loadIngredients():
    ingredients = request.get_json()
    category_recipe = Marmiton.searchCategory(ingredients)
    print(ingredients)
    print(category_recipe)
    return category_recipe 

@api.route('/detailed_recipe', methods=["POST"])
def getBestRecipe():
    recipe = request.get_json()
    all_recipes = Marmiton.search(recipe)
    main_recipe = all_recipes[0]
    main_recipe_url = main_recipe['url']
    detailed_recipe = Marmiton.get(main_recipe_url) 
    return detailed_recipe

@api.route('/image_ingredient', methods=["POST"])
def findImageIngredient():
    
    ingredient = request.get_json()
    print(ingredient)
    result = getImageFromIngredient(ingredient)
    print([result])
    return [result]



if __name__ == '__main__':
    api.run(debug=True)
