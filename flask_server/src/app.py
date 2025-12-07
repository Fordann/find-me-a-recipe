from flask import Flask, request, jsonify, make_response
import logging
from .services.handle_recipes import services_getRecipeFromIngredient, services_getBestRecipe, services_getRecipeImageAndName
from .services.handle_favorites import services_getFavoriteRecipes, services_addRecipeToFavoriteRecipes


logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__)


@app.route('/<string:lang>/research_recipe/<string:ingredient_name>', methods=["GET"])
def getRecipeFromIngredient(lang, ingredient_name):
    app.logger.info(f"Ingredient: {ingredient_name}")
    return services_getRecipeFromIngredient(lang, ingredient_name)


@app.route('/favorites', methods=['GET'])
def getFavoriteRecipes():
    return services_getFavoriteRecipes()


@app.route('/favorites/toggle', methods=['POST'])
def addRecipeToFavoriteRecipes():
    payload = request.get_json() or {}
    recipe_name = payload.get('name')
    if not recipe_name:
        return jsonify({'error': 'missing name'}), 400 
    return services_addRecipeToFavoriteRecipes(recipe_name)


@app.route('/<string:lang>/detailed_recipe/<string:ingredient_name>', methods=["GET"])
def getBestRecipe(lang: str, ingredient_name: str):
    return services_getBestRecipe(lang, ingredient_name)


@app.route('/<string:lang>/recipe_image/<string:ingredient_name>', methods=["GET"])
def getRecipeImageAndName(lang: str, recipe_name: str):
    return services_getRecipeImageAndName(lang, recipe_name)


if __name__ == '__main__':
    app.run(debug=True, port=5001)
