from flask import Flask, request, jsonify
import logging
from .services.handle_recipes import services_getRecipeCardsFromIngredient, services_getDetailedRecipeFromId
from .services.handle_favorites import services_getFavoriteRecipes, services_addRecipeToFavoriteRecipes

logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__)


@app.route('/<string:lang>/research_recipe/<string:ingredient_name>', methods=["GET"])
def getRecipeCardsFromIngredient(lang, ingredient_name):
    app.logger.info(f"Ingredient: {ingredient_name}")
    res = services_getRecipeCardsFromIngredient(lang, ingredient_name)
    app.logger.info(res)
    return res


@app.route('/<string:lang>/detailed_recipe/<string:id>', methods=["GET"])
def getDetailedRecipeFromId(lang: str, id: str):
    return services_getDetailedRecipeFromId(lang, id)


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


if __name__ == '__main__':
    app.run(debug=True, port=5001)
