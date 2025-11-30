# -*- coding: utf-8 -*-
from deep_translator import GoogleTranslator
import time

def translate_to_french(text: str) -> str:
    """Translate English text to French for backend search"""
    if not text or not text.strip():
        return text
    try:
        translator = GoogleTranslator(source='en', target='fr')
        result = translator.translate(text)
        return result
    except Exception as e:
        return text

def translate_to_english(text: str) -> str:
    """Translate French text to English for UI display"""
    if not text or not text.strip():
        return text
    try:
        translator = GoogleTranslator(source='fr', target='en')
        result = translator.translate(text)
        return result
    except Exception as e:
        return text

def translate_recipe_to_english(recipe_data: dict) -> dict:
    """Translate a complete recipe from French to English"""
    translated = {}
    
    # Copy non-translatable fields first
    for key in ['url', 'images', 'rate', 'nb_comments', 'cook_time', 'prep_time', 'total_time', 'recipe_quantity']:
        if key in recipe_data:
            translated[key] = recipe_data[key]
    
    # Translate name
    if 'name' in recipe_data and recipe_data['name']:
        original_name = recipe_data['name']
        translated['name'] = translate_to_english(original_name)
    
    # Translate ingredients
    if 'ingredients' in recipe_data and isinstance(recipe_data['ingredients'], list):
        translated_ingredients = []
        for idx, ing in enumerate(recipe_data['ingredients']):
            try:
                if isinstance(ing, str):
                    trans_ing = translate_to_english(ing)
                    translated_ingredients.append(trans_ing)
                elif isinstance(ing, (list, tuple)) and len(ing) >= 3:
                    # Format: [quantity, unit, ingredient]
                    trans_unit = translate_to_english(str(ing[1])) if ing[1] else ing[1]
                    trans_ingredient = translate_to_english(str(ing[2]))
                    translated_ingredients.append([
                        ing[0],  # quantity
                        trans_unit,  # unit
                        trans_ingredient  # ingredient
                    ])
                else:
                    translated_ingredients.append(ing)
            except Exception as e:
                translated_ingredients.append(ing)
        translated['ingredients'] = translated_ingredients
    
    # Translate steps
    if 'steps' in recipe_data and isinstance(recipe_data['steps'], list):
        translated_steps = []
        for idx, step in enumerate(recipe_data['steps']):
            try:
                if step and isinstance(step, str):
                    trans_step = translate_to_english(step)
                    translated_steps.append(trans_step)
                else:
                    translated_steps.append(step)
            except Exception as e:
                translated_steps.append(step)
        translated['steps'] = translated_steps
    
    # Translate other text fields
    text_fields = ['author_tip', 'difficulty', 'budget', 'author', 'recipe_quantity']
    for field in text_fields:
        if field in recipe_data and recipe_data[field]:
            try:
                original = recipe_data[field]
                translated[field] = translate_to_english(str(original))
            except Exception as e:
                translated[field] = recipe_data[field]
        else:
            if field in recipe_data:
                translated[field] = recipe_data[field]
    
    return translated

def translate_recipe_list_to_english(recipes: list) -> list:
    """Translate a list of recipe previews to English"""
    return [
        {
            'name': translate_to_english(r.get('name', '')),
            'image': r.get('image', '')
        }
        for r in recipes
    ]
