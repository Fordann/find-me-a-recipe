from flask import Flask, request, jsonify, make_response
from flask_caching import Cache
import json
import asyncio
import aiohttp
from marmiton import Marmiton, Recipe
from translator import translate_to_french, translate_to_english, translate_recipe_to_english, translate_recipe_list_to_english

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
        print(f"✓ Image cache hit for {recipe.get('name', '')}")
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
                print(f"✓ Cached image for {recipe.get('name', '')}")
            
            return {'name': recipe.get('name', ''), 'image': image_url}
    except asyncio.TimeoutError:
        print(f"⏱ Timeout fetching image for {recipe.get('name')}")
        return {'name': recipe.get('name', ''), 'image': ''}
    except Exception as e:
        print(f"✗ Error fetching image for {recipe.get('name')}: {e}")
        return {'name': recipe.get('name', ''), 'image': ''}

async def fetch_multiple_images(recipes, limit=4):
    """Fetch images for multiple recipes in parallel with configurable limit"""
    import ssl
    ssl_context = ssl._create_unverified_context()
    connector = aiohttp.TCPConnector(ssl=ssl_context, limit=10)
    
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [fetch_recipe_image_async(session, recipe) for recipe in recipes[:limit]]
        return await asyncio.gather(*tasks, return_exceptions=True)

@api.route('/research_recipe', methods=["POST"])
def loadIngredients():
    data = request.get_json()
    print(f"\n{'='*60}")
    print(f"🔍 RECIPE SEARCH REQUEST")
    print(f"{'='*60}")
    print(f"Raw request: {data}")
    
    # Extract language and ingredients
    language = data.get('language', 'en') if isinstance(data, dict) else 'en'
    ingredients = data.get('ingredients', data) if isinstance(data, dict) and 'ingredients' in data else data
    
    print(f"🌐 Language: {language}")
    
    # Translate English query to French for Marmiton search (only if language is 'en')
    if language == 'en' and isinstance(ingredients, dict) and 'aqt' in ingredients:
        original_query = ingredients['aqt']
        french_query = translate_to_french(original_query)
        print(f"🔄 Query translation: '{original_query}' -> '{french_query}'")
        ingredients['aqt'] = french_query
    elif language == 'fr':
        print(f"✓ French mode: NO translation will be applied")
    
    print(f"🔎 Searching Marmiton with: {ingredients}")
    
    recipes = Marmiton.search(ingredients)
    print(f"📋 Found {len(recipes)} recipes from Marmiton")
    if recipes:
        print(f"   Top 3 results: {[r.get('name', 'N/A') for r in recipes[:3]]}")
    
    # Fetch images in parallel for first 4 recipes only (faster initial load)
    if recipes:
        try:
            print(f"📥 Fetching images for {min(4, len(recipes))} recipes...")
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
            print(f"✗ Error in parallel image fetch: {e}")
            # Fallback: return without images
            result = [{'name': r.get('name', ''), 'image': ''} for r in recipes]
    else:
        result = []
    
    # Translate recipe names to English ONLY if language is 'en'
    if language == 'en':
        print(f"🔄 Translating {len(result)} recipe names to English...")
        result = translate_recipe_list_to_english(result)
    else:
        print(f"✓ Keeping {len(result)} recipe names in French (language={language})")

    print(f"✓ Returning {len(result)} recipes")
    if result:
        print(f"   Sample recipe name: '{result[0].get('name', 'N/A')}'")
        print(f"   Language mode was: {language}")
    print(f"{'='*60}\n")
    
    # Build search term from ingredients payload (supports both dicts and already formatted aqt)
    if isinstance(ingredients, dict):
        search_term = ingredients.get('aqt') or ' '.join(v for v in ingredients.values() if isinstance(v, str))
    else:
        search_term = str(ingredients)

    # Retrieve existing history from cookie
    raw_history = request.cookies.get('search_history')
    try:
        history = json.loads(raw_history) if raw_history else []
    except Exception:
        history = []

    # Update history: prepend latest, dedupe preserving order, cap length
    if search_term and search_term.strip():
        new_list = [search_term.strip()] + [h for h in history if h != search_term.strip()]
        history = new_list[:10]  # keep last 10

    resp = make_response(jsonify(result))
    resp.set_cookie('search_history', json.dumps(history), max_age=60*60*24*30, httponly=False, samesite='Lax', path='/')
    return resp

@api.route('/history', methods=['GET'])
def get_history():
    raw_history = request.cookies.get('search_history')
    try:
        history = json.loads(raw_history) if raw_history else []
    except Exception:
        history = []
    return jsonify(history)

@api.route('/history/clear', methods=['POST'])
def clear_history():
    resp = make_response(jsonify({"status": "cleared"}))
    resp.set_cookie('search_history', json.dumps([]), max_age=60*60*24*30, httponly=False, samesite='Lax', path='/')
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

@api.route('/detailed_recipe', methods=["POST"])
def getBestRecipe():
    try:
        data = request.get_json()
        print("getBestRecipe called with:", data)
        
        # Extract language and recipe request
        language = data.get('language', 'en') if isinstance(data, dict) else 'en'
        recipe_request = data.get('ingredients', data) if isinstance(data, dict) and 'ingredients' in data else data
        
        print(f"🌐 Language: {language}")
        
        # Translate English query to French (only if language is 'en')
        if language == 'en' and isinstance(recipe_request, dict) and 'aqt' in recipe_request:
            original_query = recipe_request['aqt']
            french_query = translate_to_french(original_query)
            print(f"🔄 Detailed recipe query translation: '{original_query}' -> '{french_query}'")
            recipe_request['aqt'] = french_query
        elif language == 'fr':
            print(f"✓ French mode: NO translation will be applied")
        
        all_recipes = Marmiton.search(recipe_request)
        if not all_recipes:
            return jsonify({"error": "no recipes found"}), 404

        main_recipe = all_recipes[0]
        main_recipe_url = main_recipe.get('url')
        print(f"📍 Selected recipe: '{main_recipe.get('name')}' from {len(all_recipes)} results")
        print(f"   URL: {main_recipe_url}")
        if not main_recipe_url:
            return jsonify({"error": "recipe data incomplete"}), 502

        detailed_recipe = Marmiton.get(main_recipe_url)
        
        # Translate recipe to English (only if language is 'en')
        if language == 'en':
            detailed_recipe = translate_recipe_to_english(detailed_recipe)
            print(f"✅ Returning recipe: '{detailed_recipe.get('name')}' (translated from French)")
        else:
            print(f"✅ Returning recipe: '{detailed_recipe.get('name')}' (French)")
        
        # Ensure 'images' is returned (frontend expects 'images')
        if 'images' in detailed_recipe and detailed_recipe['images']:
            detailed_recipe['image'] = detailed_recipe['images'][0] if isinstance(detailed_recipe['images'], list) else detailed_recipe['images']
        return jsonify(detailed_recipe)
    except IndexError:
        return jsonify({"error": "no recipes returned by search"}), 404
    except Exception as e:
        return jsonify({"error": "unexpected error", "details": str(e)}), 500


@api.route('/recipe_image', methods=["POST"])
def get_recipe_image():
    """Get image for a specific recipe by name"""
    try:
        payload = request.get_json()
        recipe_name = payload.get('name')
        language = payload.get('language', 'en')
        
        if not recipe_name:
            return jsonify({"error": "missing recipe name"}), 400
        
        # Translate English recipe name to French for search (only if language is 'en')
        search_name = recipe_name
        if language == 'en':
            search_name = translate_to_french(recipe_name)
            print(f"Recipe image search: '{recipe_name}' -> '{search_name}'")
        else:
            print(f"Recipe image search: '{recipe_name}' (French)")
        
        # Search for the recipe
        recipes = Marmiton.search({'aqt': search_name})
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


@api.route('/image_ingredient', methods=["POST"])
def findImageIngredient():
    payload = request.get_json()
    # Accept either a raw string or a JSON object like { "ingredient": "tomato" }
    if isinstance(payload, dict):
        # try common keys that the frontend may send
        term = payload.get("ingredient") or payload.get("value") or payload.get("aqt")
    else:
        term = payload

    result = None
    if term:
        result = getImageFromIngredient(term)

    # Return a consistent JSON object the frontend expects
    return {"image": result}



if __name__ == '__main__':
    api.run(debug=True, port=5001)
