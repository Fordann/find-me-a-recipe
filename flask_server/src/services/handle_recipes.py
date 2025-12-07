from flask import Flask, request, jsonify, make_response
from ..utils.translator import translate_request_if_necessary, translate_response_if_necessary
import asyncio
import aiohttp
from ..API.recipe_scraper import Marmiton

#must be deleted once fetch multiple images in parallel is fixed
from bs4 import BeautifulSoup

def services_getRecipeFromIngredient(lang: str, ingredients: str):
    query = translate_request_if_necessary(lang, ingredients)

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
    
    result = translate_response_if_necessary(lang, result)
    return make_response(jsonify(result))

def services_getBestRecipe(lang: str, ingredient_name: str):
    try:
        query = translate_request_if_necessary(lang, ingredient_name)
        
        all_recipes = Marmiton.search(query)
        if not all_recipes:
            return jsonify({"error": "no recipes found"}), 404

        main_recipe = all_recipes[0]
        main_recipe_url = main_recipe.get('url')
        if not main_recipe_url:
            return jsonify({"error": "recipe data incomplete"}), 502

        detailed_recipe = Marmiton.get(main_recipe_url)
        
        detailed_recipe = translate_response_if_necessary(detailed_recipe)
        
        # Ensure 'images' is returned (frontend expects 'images')
        if 'images' in detailed_recipe and detailed_recipe['images']:
            detailed_recipe['image'] = detailed_recipe['images'][0] if isinstance(detailed_recipe['images'], list) else detailed_recipe['images']
        return jsonify(detailed_recipe)
    
    except IndexError:
        return jsonify({"error": "no recipes returned by search"}), 404
    
    except Exception as e:
        return jsonify({"error": "unexpected error", "details": str(e)}), 500


def services_getRecipeImageAndName(lang: str, recipe_name: str):
    """Get image for a specific recipe by name"""

    try:
        query = translate_request_if_necessary(lang, recipe_name)
    
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

# Async helper to fetch recipe images in parallel
async def fetch_recipe_image_async(session, recipe):
    """Fetch detailed recipe info asynchronously with caching"""
    if not recipe.get('url'):
        return {'name': recipe.get('name', ''), 'image': ''}
    
    recipe_url = recipe['url']
    
    try:
        # Use aiohttp for async HTTP requests
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        async with session.get(recipe_url, headers=headers, ssl=False, timeout=aiohttp.ClientTimeout(total=5)) as response:
            html = await response.text()
            # Parse synchronously (BeautifulSoup is not async)

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
    
