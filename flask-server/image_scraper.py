from urllib.parse import quote_plus

def _normalize_input(ingredient):
    """
    Convert ingredient input to a string query.
    Handles: string, dict, list
    """
    if isinstance(ingredient, str):
        return ingredient.strip()
    elif isinstance(ingredient, dict):
        return ingredient.get("ingredient") or ingredient.get("value") or ingredient.get("aqt") or ""
    elif isinstance(ingredient, list) and len(ingredient) > 0:
        return ingredient[0]
    return ""

def getImageFromIngredient(ingredient):
    """
    Generate a placeholder image URL for the given ingredient.
    Uses ui-avatars.com to create SVG text placeholders.
    """
    q = _normalize_input(ingredient)
    if not q:
        return None
    
    try:
        # Generate a placeholder image with the ingredient name
        placeholder_url = f"https://ui-avatars.com/api/?name={quote_plus(q)}&size=400&background=random&color=fff&bold=true&format=svg"
        print(f"Returning placeholder for '{q}': {placeholder_url}")
        return placeholder_url
    except Exception as e:
        print(f"Placeholder generation failed for '{q}': {e}") 
        
    return None
    