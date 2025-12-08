
from collections import deque
from .recipe_scraper import Marmiton
from .scheduler import Scheduler

MINIMUN_STOCK_MAIN_QUEUE = 15
MINIMUN_STOCK_BACKUP_QUEUE = 20

class RecipeHandler:
    def __init__(self):
        self.cache = {}
        self.scheduler = Scheduler()
        #self.scheduler.addRecipesToQueue(self.search_recipes(self.scheduler.get_current_ingredient()))
        #print("NUMBER ELEM", len(self.scheduler.backup_queue), flush=True)

    def search_recipes(self, ingredient:str):
        url_recipe = self.scheduler.build_next_url(ingredient)
        print("URL RECIPE", url_recipe, flush=True)
        recipes, is_next_page_available = Marmiton.scrape(url_recipe, self.scheduler.get_page_to_search())

        if is_next_page_available:
            self.scheduler.update_next_page(ingredient) 
        else:
            self.scheduler.reset()
            
        print("HANDLE_RECIPE nb", len(recipes), flush=True)
        result = []

        for recipe in recipes:
            if recipe['id'] not in self.cache:
                self.cache[recipe['id']] = { 'name': recipe['name'], 'image': recipe['image'], 'url': recipe['url']}
                result.append(recipe['id'])      
        return result
    

    def load_recipe_ids(self, ingredient:str, nb_recipes:int = MINIMUN_STOCK_MAIN_QUEUE):
        print("Load_recipes", ingredient, flush=True)   
        self.scheduler.update_scheduler(ingredient)

        if self.scheduler.get_len_main_queue() < MINIMUN_STOCK_MAIN_QUEUE:
            print("url", self.scheduler.build_next_url(ingredient))
            self.scheduler.addRecipesToMainQueue(self.search_recipes(self.scheduler.get_current_ingredient()))
            self.scheduler.update_next_page(self.scheduler.get_current_ingredient())

        if self.scheduler.get_len_backup_queue() < MINIMUN_STOCK_BACKUP_QUEUE:
            print("url", self.scheduler.build_next_url(""))
            self.scheduler.addRecipesToBackupQueue(self.search_recipes(""))
            self.scheduler.update_next_page("")  
        
        print("CACHE", len(self.cache.items()))
        print("NUMBER ELEM in main queue", len(self.scheduler.main_queue), flush=True)
        print("NUMBER ELEM in backup queue", len(self.scheduler.backup_queue), flush=True)

        if self.scheduler.get_len_main_queue() > nb_recipes:
            recipes = self.scheduler.popRecipesFromMainQueue(nb_recipes)
            print("MAIN QUEUE recipe found", len(recipes))
        else:
            recipes = self.scheduler.popUntilEmptyMainQueue()
            recipes += self.scheduler.popRecipesFromBackupQueue(nb_recipes - len(recipes))

        print("Recipe ids found", len(recipes))
        return recipes
    
    def load_recipes(self, ingredient:str, nb_recipes:int = MINIMUN_STOCK_MAIN_QUEUE):
        recipe_ids = self.load_recipe_ids(ingredient, nb_recipes)
        recipes = []
        for id in recipe_ids:
            if id in self.cache:
                recipes.append(self.cache[id])
        return recipes
    
   
recipe_handler = RecipeHandler()