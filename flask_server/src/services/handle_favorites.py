from flask import Flask, request, jsonify, make_response
import json

def read_cookie_list(name: str) -> list:
    raw = request.cookies.get(name)
    try:
        return json.loads(raw) if raw else []
    except Exception:
        return []

def write_cookie_list(resp, name: str, values: list):
    resp.set_cookie(name, json.dumps(values), max_age=60*60*24*30, httponly=False, samesite='Lax', path='/')

def services_getFavoriteRecipes():
    return jsonify(read_cookie_list('favorites'))

def services_getNumberFavoriteRecipes():
    return jsonify({'number': len(read_cookie_list('favorites'))})

def services_addRecipeToFavoriteRecipes(recipe_name: str):
    favs = read_cookie_list('favorites')
    if recipe_name in favs:
        favs = [f for f in favs if f != recipe_name]
        status = 'removed'
    else:
        favs.insert(0, recipe_name)
        status = 'added'
    resp = make_response(jsonify({'status': status, 'favorites': favs}))
    write_cookie_list(resp, 'favorites', favs)
    return resp