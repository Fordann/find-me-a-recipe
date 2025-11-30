from flask import Flask, request, jsonify, make_response
from flask_caching import Cache
import json
import asyncio
import aiohttp
import logging
from marmiton import Marmiton, Recipe
from image_scraper import getImageFromIngredient
from translator import translate_to_french, translate_to_english, translate_recipe_to_english, translate_recipe_list_to_english

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure caching
cache_config = {
    'CACHE_TYPE': 'SimpleCache',
    'CACHE_DEFAULT_TIMEOUT': 1800
}
app.config.from_mapping(cache_config)
cache = Cache(app)

# In-memory cache for recipe images
image_cache = {}

async def fetch_recipe_image_async(session, recipe):
    """Fetch detailed recipe info asynchronously with caching"""
    if not recipe.get('url'):
        return {'name': recipe.get('name', ''), 'image': ''}
    
    recipe_url = recipe['url']
    if recipe_url in image_cache:
        logger.debug(f"Image cache hit for {recipe.get('name', '')}")
        return {'name': recipe.get('name', ''), 'image': image_cache[recipe_url]}
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        async with session.get(recipe_url, headers=headers, ssl=False, timeout=aiohttp.ClientTimeout(total=5)) as response:
            html = await response.text()
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html, 'html.parser')
            
            img_tag = soup.find('img', class_='recipe-media__image')
            image_url = ''
            if img_tag and img_tag.get('src'):
                image_url = img_tag['src']
            else:
                img_tag = soup.find('img', {'data-src': True})
                if img_tag:
                    image_url = img_tag['data-src']
            
            if image_url:
                image_cache[recipe_url] = image_url
                logger.debug(f"Cached image for {recipe.get('name', '')}")
            
            return {'name': recipe.get('name', ''), 'image': image_url}
    except asyncio.TimeoutError:
        logger.warning(f"Timeout fetching image for {recipe.get('name')}")
        return {'name': recipe.get('name', ''), 'image': ''}
    except Exception as e:
        logger.error(f"Error fetching image for {recipe.get('name')}: {e}")
        return {'name': recipe.get('name', ''), 'image': ''}

async def fetch_multiple_images(recipes, limit=4):
    """Fetch images for multiple recipes in parallel"""
    import ssl
    ssl_context = ssl._create_unverified_context()
    connector = aiohttp.TCPConnector(ssl=ssl_context, limit=10)
    
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [fetch_recipe_image_async(session, recipe) for recipe in recipes[:limit]]
        return await asyncio.gather(*tasks, return_exceptions=True)

@app.route('/research_recipe', methods=["POST"])
def loadIngredients():
    data = request.get_json()
    logger.info(f"Recipe search request received")
    
    language = data.get('language', 'en') if isinstance(data, dict) else 'en'
    ingredients = data.get('ingredients', data) if isinstance(data, dict) and 'ingredients' in data else data
    
    logger.info(f"Language: {language}")
    
    if language == 'en' and isinstance(ingredients, dict) and 'aqt' in ingredients:
        original_query = ingredients['aqt']
        french_query = translate_to_french(original_query)
        logger.debug(f"Query translation: '{original_query}' -> '{french_query}'")
        ingredients['aqt'] = french_query
    
    logger.debug(f"Searching Marmiton with: {ingredients}")
    
    recipes = Marmiton.search(ingredients)
    logger.info(f"Found {len(recipes)} recipes from Marmiton")
    
    if recipes:
        try:
            logger.debug(f"Fetching images for {min(4, len(recipes))} recipes")
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(fetch_multiple_images(recipes, limit=4))
            loop.close()
            
            result = [r for r in result if isinstance(r, dict)]
            
            for recipe in recipes[len(result):]:
                result.append({'name': recipe.get('name', ''), 'image': ''})
        except Exception as e:
            logger.error(f"Error in parallel image fetch: {e}")
            result = [{'name': r.get('name', ''), 'image': ''} for r in recipes]
    else:
        result = []
    
    if language == 'en':
        logger.debug(f"Translating {len(result)} recipe names to English")
        result = translate_recipe_list_to_english(result)
    
    logger.info(f"Returning {len(result)} recipes")
    
    if isinstance(ingredients, dict):
        search_term = ingredients.get('aqt') or ' '.join(v for v in ingredients.values() if isinstance(v, str))
    else:
        search_term = str(ingredients)

    raw_history = request.cookies.get('search_history')
    try:
        history = json.loads(raw_history) if raw_history else []
    except Exception:
        history = []

    if search_term and search_term.strip():
        new_list = [search_term.strip()] + [h for h in history if h != search_term.strip()]
        history = new_list[:10]

    resp = make_response(jsonify(result))
    resp.set_cookie('search_history', json.dumps(history), max_age=60*60*24*30, httponly=False, samesite='Lax', path='/')
    return resp

@app.route('/history', methods=['GET'])
def get_history():
    raw_history = request.cookies.get('search_history')
    try:
        history = json.loads(raw_history) if raw_history else []
    except Exception:
        history = []
    return jsonify(history)

@app.route('/history/clear', methods=['POST'])
def clear_history():
    resp = make_response(jsonify({"status": "cleared"}))
    resp.set_cookie('search_history', json.dumps([]), max_age=60*60*24*30, httponly=False, samesite='Lax', path='/')
    return resp

def _read_cookie_list(name: str) -> list:
    raw = request.cookies.get(name)
    try:
        return json.loads(raw) if raw else []
    except Exception:
        return []

def _write_cookie_list(resp, name: str, values: list):
    resp.set_cookie(name, json.dumps(values), max_age=60*60*24*30, httponly=False, samesite='Lax', path='/')

@app.route('/favorites', methods=['GET'])
def get_favorites():
    return jsonify(_read_cookie_list('favorites'))

@app.route('/favorites/toggle', methods=['POST'])
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
        favs = favs[:30]
        status = 'added'
    resp = make_response(jsonify({'status': status, 'favorites': favs}))
    _write_cookie_list(resp, 'favorites', favs)
    return resp

@app.route('/detailed_recipe', methods=["POST"])
def getBestRecipe():
    try:
        data = request.get_json()
        logger.info("Detailed recipe request received")
        
        language = data.get('language', 'en') if isinstance(data, dict) else 'en'
        recipe_request = data.get('ingredients', data) if isinstance(data, dict) and 'ingredients' in data else data
        
        logger.info(f"Language: {language}")
        
        if language == 'en' and isinstance(recipe_request, dict) and 'aqt' in recipe_request:
            original_query = recipe_request['aqt']
            french_query = translate_to_french(original_query)
            logger.debug(f"Recipe query translation: '{original_query}' -> '{french_query}'")
            recipe_request['aqt'] = french_query
        
        all_recipes = Marmiton.search(recipe_request)
        if not all_recipes:
            return jsonify({"error": "no recipes found"}), 404

        main_recipe = all_recipes[0]
        main_recipe_url = main_recipe.get('url')
        logger.info(f"Selected recipe: '{main_recipe.get('name')}' from {len(all_recipes)} results")
        
        if not main_recipe_url:
            return jsonify({"error": "recipe data incomplete"}), 502

        detailed_recipe = Marmiton.get(main_recipe_url)
        
        if language == 'en':
            detailed_recipe = translate_recipe_to_english(detailed_recipe)
            logger.debug(f"Recipe translated to English: '{detailed_recipe.get('name')}'")
        
        if 'images' in detailed_recipe and detailed_recipe['images']:
            detailed_recipe['image'] = detailed_recipe['images'][0] if isinstance(detailed_recipe['images'], list) else detailed_recipe['images']
        
        return jsonify(detailed_recipe)
    except IndexError:
        return jsonify({"error": "no recipes returned by search"}), 404
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "unexpected error", "details": str(e)}), 500

@app.route('/recipe_image', methods=["POST"])
def get_recipe_image():
    """Get image for a specific recipe by name"""
    try:
        payload = request.get_json()
        recipe_name = payload.get('name')
        language = payload.get('language', 'en')
        
        if not recipe_name:
            return jsonify({"error": "missing recipe name"}), 400
        
        search_name = recipe_name
        if language == 'en':
            search_name = translate_to_french(recipe_name)
            logger.debug(f"Recipe image search: '{recipe_name}' -> '{search_name}'")
        
        recipes = Marmiton.search({'aqt': search_name})
        if not recipes:
            return jsonify({"error": "recipe not found"}), 404
        
        main_recipe = recipes[0]
        main_recipe_url = main_recipe.get('url')
        if not main_recipe_url:
            return jsonify({"error": "recipe url not found"}), 404
        
        detailed = Marmiton.get(main_recipe_url)
        images = detailed.get('images', [])
        first_image = images[0] if images else ''
        
        return jsonify({
            'name': recipe_name,
            'image': first_image
        })
    except Exception as e:
        logger.error(f"Error fetching recipe image: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/image_ingredient', methods=["POST"])
def findImageIngredient():
    payload = request.get_json()
    if isinstance(payload, dict):
        term = payload.get("ingredient") or payload.get("value") or payload.get("aqt")
    else:
        term = payload

    result = None
    if term:
        result = getImageFromIngredient(term)

    return {"image": result}

if __name__ == '__main__':
    app.run(debug=True, port=5001)
