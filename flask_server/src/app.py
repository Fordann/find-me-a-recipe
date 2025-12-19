from flask import Flask, request, jsonify
import logging
from .services.handle_recipes import services_getRecipeCardsFromIngredient, services_getDetailedRecipeFromId
from .services.handle_favorites import services_getFavoriteRecipes, services_addRecipeToFavoriteRecipes, services_getNumberFavoriteRecipes

logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__)

@app.route('/<string:lang>/recipes/<string:id>', methods=["GET"])
def getDetailedRecipeFromId(lang: str, id: str):
    return services_getDetailedRecipeFromId(lang, id)


@app.route('/<string:lang>/recipes/ingredient_name/<string:ingredient_name>', methods=["GET"])
def getRecipeCardsFromIngredient(lang: str, ingredient_name: str):
    app.logger.info(f"Ingredient: {ingredient_name}")
    res = services_getRecipeCardsFromIngredient(lang, ingredient_name)
    app.logger.info(res)
    return res

@app.route('/favorites', methods=['GET'])
def getFavoriteRecipes():
    return services_getFavoriteRecipes()

@app.route('/<string:lang>/favorites/number', methods=['GET'])
def getNumberFavoriteRecipes(lang: str):
    return services_getNumberFavoriteRecipes()

@app.route('/favorites', methods=['POST'])
def addRecipeToFavoriteRecipes():
    payload = request.get_json() or {}
    recipe_name = payload.get('name')
    if not recipe_name:
        return jsonify({'error': 'missing name'}), 400 
    return services_addRecipeToFavoriteRecipes(recipe_name)


if __name__ == '__main__':
    app.run(debug=True, port=5001)
