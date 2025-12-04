from flask import Flask, request, jsonify, make_response
from flask_caching import Cache
import json
import asyncio
import aiohttp
from marmiton import Marmiton, Recipe
from translator import translate_to_french, translate_to_english, translate_recipe_to_english, translate_recipe_list_to_english
import logging

logging.basicConfig(level=logging.DEBUG)
api = Flask(__name__)

# Configure caching (simple in-memory cache)
cache_config = {
    'CACHE_TYPE': 'SimpleCache',
    'CACHE_DEFAULT_TIMEOUT': 1800  # 30 minutes
}
api.config.from_mapping(cache_config)
cache = Cache(api)

# In-memory cache for recipe images (URL -> image URL)
image_cache = {}

# Async helper to fetch recipe images in parallel
async def fetch_recipe_image_async(session, recipe):
    """Fetch detailed recipe info asynchronously with caching"""
    if not recipe.get('url'):
        return {'name': recipe.get('name', ''), 'image': ''}
    
    # Check cache first
    recipe_url = recipe['url']
    if recipe_url in image_cache:
        return {'name': recipe.get('name', ''), 'image': image_cache[recipe_url]}
    
    try:
        # Use aiohttp for async HTTP requests
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        async with session.get(recipe_url, headers=headers, ssl=False, timeout=aiohttp.ClientTimeout(total=5)) as response:
            html = await response.text()
            # Parse synchronously (BeautifulSoup is not async)
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html, 'html.parser')
            # Extract first image
            img_tag = soup.find('img', class_='recipe-media__image')
            image_url = ''
            if img_tag and img_tag.get('src'):
                image_url = img_tag['src']
            else:
                # Fallback: try data-src
                img_tag = soup.find('img', {'data-src': True})
                if img_tag:
                    image_url = img_tag['data-src']
            
            # Store in cache
            if image_url:
                image_cache[recipe_url] = image_url
            
            return {'name': recipe.get('name', ''), 'image': image_url}
    except asyncio.TimeoutError:
        return {'name': recipe.get('name', ''), 'image': ''}

    except Exception as e:
        return {'name': recipe.get('name', ''), 'image': ''}

async def fetch_multiple_images(recipes, limit=4):
    """Fetch images for multiple recipes in parallel with configurable limit"""
    import ssl
    ssl_context = ssl._create_unverified_context()
    connector = aiohttp.TCPConnector(ssl=ssl_context, limit=10)
    
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [fetch_recipe_image_async(session, recipe) for recipe in recipes[:limit]]
        return await asyncio.gather(*tasks, return_exceptions=True)

@api.route('/<string:lang>/research_recipe/<string:ingredient_name>', methods=["GET"])
def get_recipe_from_ingredient(lang, ingredient_name):
    api.logger.info(f"Ingredient: {ingredient_name}")

    query = ingredient_name
    
    if lang == 'en':
        query = translate_to_french(query)
    
    recipes = Marmiton.search(query)
    
    # Fetch images in parallel for first 4 recipes only (faster initial load)
    if recipes:
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(fetch_multiple_images(recipes, limit=4))
            loop.close()
            
            # Filter out exceptions
            result = [r for r in result if isinstance(r, dict)]
            
            # Add remaining recipes without images (lazy load)
            for recipe in recipes[len(result):]:
                result.append({'name': recipe.get('name', ''), 'image': ''})

        except Exception as e:
            # Fallback: return without images
            result = [{'name': r.get('name', ''), 'image': ''} for r in recipes]
    else:
        result = []
    
    # Translate recipe names to English ONLY if language is 'en'
    if lang == 'en':
        result = translate_recipe_list_to_english(result)

    resp = make_response(jsonify(result))
    api.logger.info(result)
    return resp

# ---- Favorites (pins) ----
def _read_cookie_list(name: str) -> list:
    raw = request.cookies.get(name)
    try:
        return json.loads(raw) if raw else []
    except Exception:
        return []

def _write_cookie_list(resp, name: str, values: list):
    resp.set_cookie(name, json.dumps(values), max_age=60*60*24*30, httponly=False, samesite='Lax', path='/')

@api.route('/favorites', methods=['GET'])
def get_favorites():
    return jsonify(_read_cookie_list('favorites'))

@api.route('/favorites/toggle', methods=['POST'])
def toggle_favorite():
    payload = request.get_json() or {}
    name = payload.get('name')
    if not name:
        return jsonify({'error': 'missing name'}), 400
    favs = _read_cookie_list('favorites')
    if name in favs:
        favs = [f for f in favs if f != name]
        status = 'removed'
    else:
        favs.insert(0, name)
        favs = favs[:30]  # cap at 30 favorites
        status = 'added'
    resp = make_response(jsonify({'status': status, 'favorites': favs}))
    _write_cookie_list(resp, 'favorites', favs)
    return resp

@api.route('/<string:lang>/detailed_recipe/<string:ingredient_name>', methods=["GET"])
def getBestRecipe(language, ingredient_name):
    api.logger.info(ingredient_name)
    try:
        query = ingredient_name
        
        # Translate English query to French (only if language is 'en')
        if language == 'en':
            query = translate_to_french(query)
        
        all_recipes = Marmiton.search(query)
        if not all_recipes:
            return jsonify({"error": "no recipes found"}), 404

        main_recipe = all_recipes[0]
        main_recipe_url = main_recipe.get('url')
        if not main_recipe_url:
            return jsonify({"error": "recipe data incomplete"}), 502

        detailed_recipe = Marmiton.get(main_recipe_url)
        
        # Translate recipe to English (only if language is 'en')
        if language == 'en':
            detailed_recipe = translate_recipe_to_english(detailed_recipe)
        
        # Ensure 'images' is returned (frontend expects 'images')
        if 'images' in detailed_recipe and detailed_recipe['images']:
            detailed_recipe['image'] = detailed_recipe['images'][0] if isinstance(detailed_recipe['images'], list) else detailed_recipe['images']
        return jsonify(detailed_recipe)
    except IndexError:
        return jsonify({"error": "no recipes returned by search"}), 404
    except Exception as e:
        return jsonify({"error": "unexpected error", "details": str(e)}), 500


@api.route('/<string:lang>/recipe_image/<string:ingredient_name>', methods=["GET"])
def get_recipe_image(lang, recipe_name):
    """Get image for a specific recipe by name"""

    api.logger.info(f"Ingredient: {recipe_name}")

    try:
        if lang == 'en':
            query = translate_to_french(query)
    
        recipes = Marmiton.search(query)

        if not recipes:
            return jsonify({"error": "recipe not found"}), 404
        
        # Get the first match
        main_recipe = recipes[0]
        main_recipe_url = main_recipe.get('url')
        if not main_recipe_url:
            return jsonify({"error": "recipe url not found"}), 404
        
        # Fetch details to get image
        detailed = Marmiton.get(main_recipe_url)
        images = detailed.get('images', [])
        first_image = images[0] if images else ''
        
        return jsonify({
            'name': recipe_name,  # Return original English name
            'image': first_image
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    api.run(debug=True, port=5001)
