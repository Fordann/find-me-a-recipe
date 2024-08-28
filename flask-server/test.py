from flask import Flask, request
from marmiton import Marmiton, Recipe


api = Flask(__name__)

detailed_recipe = {}

@api.route('/data', methods=["POST"])
def loadIngredients():
    ingredients = request.get_json()
    print(ingredients)
    category_recipe = Marmiton.searchCategory(ingredients)
    print(category_recipe)
    #detailed_recipe = Marmiton.search(ingredients)
    #recipe = detailed_recipe[0]
    #main_recipe_url = recipe['url']
    #detailed_recipe = Marmiton.get(main_recipe_url) 
    #return detailed_recipe
    return category_recipe 

@api.route('/data')
def my_profile():
    return detailed_recipe
 


if __name__ == '__main__':
    api.run(debug=True)
