from flask import jsonify, make_response
from ..utils.translator import translate_request_if_necessary, translate_response_if_necessary
from ..API.recipe_handler import recipe_handler


def services_getRecipeCardsFromIngredient(lang: str, ingredients: str):
    query = translate_request_if_necessary(lang, ingredients) 

    recipes = recipe_handler.load_recipes(query)
    print("HANDLE_RECIPE", recipes, flush=True)
         
    recipes = translate_response_if_necessary(lang, recipes)
    return make_response(jsonify(recipes))


def services_getDetailedRecipeFromId(lang: str, recipe_id: str):
    """
    if recipe_id not in cache:
        return jsonify({"error": "wrong id, recipe not found"}), 404
    
    if 'content' in cache[recipe_id]:
        return cache[recipe_id].get('content')
    
    detailed_recipe = Marmiton.get_recipe_from_url(cache['id'].get('url'))
    detailed_recipe = translate_response_if_necessary(lang, detailed_recipe)
    cache[recipe_id]['content'] = detailed_recipe
    return detailed_recipe
    """
    return ""