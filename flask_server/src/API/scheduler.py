from collections import deque

class Scheduler:
    def __init__(self):
        self.main_queue = deque()
        self.backup_queue = deque()
        self.current_ingredient = ""
        self.next_page_to_search = 1
        self.next_page_on_home_page = 1
        self.is_more_recipe_to_scrape = True
    

    def reset(self):
        self.main_queue.clear()
        self.current_ingredient = ''
        self.next_page_to_search = self.next_page_on_home_page
    

    def change_ingredient(self, ingredient: str):
        self.main_queue.clear()
        self.current_ingredient = ingredient
        self.next_page_to_search = 1


    def get_current_ingredient(self):
        return self.current_ingredient
    

    def get_page_to_search(self):
        return self.next_page_to_search
    
    
    def get_len_main_queue(self):
        return len(self.main_queue)
    
    def get_len_backup_queue(self):
        return len(self.backup_queue)

    
    def addRecipesToMainQueue(self, recipe_ids: list):
        for recipe in recipe_ids:     
            self.main_queue.append(recipe)


    def addRecipesToBackupQueue(self, recipe_ids: list):
        for recipe in recipe_ids:     
            self.backup_queue.append(recipe)


    def popRecipesFromMainQueue(self, number: int):
        recipes = []
        for i in range(number):
            recipes.append(self.main_queue.popleft())
        return recipes


    def popUntilEmptyMainQueue(self):
        recipes = []
        while self.main_queue:
            recipes.append(self.main_queue.popleft())
        return recipes


    def popRecipesFromBackupQueue(self, number: int):
        recipes = []
        for i in range(number):
            if self.backup_queue:
                recipes.append(self.backup_queue.popleft())
        return recipes

    def update_next_page(self, ingredient:str):
        #if run out of recipe on an ingredient -> come back to homepage to get more recipes of any kind
        if ingredient == "":
            self.update_next_home_page()
        else:
            self.next_page_to_search += 1
    

    def update_next_home_page(self):
        self.next_page_on_home_page +=1

    
    def build_next_url(self, query: str):
        page_number = self.next_page_to_search
        if query == "":
            page_number = self.next_page_on_home_page

        base_url = "http://www.marmiton.org/recettes/recherche.aspx?"
        query_url = f"aqt={query}&page={page_number}"
        return base_url + query_url
    
    
    def update_scheduler(self, ingredient: str):
        if ingredient != self.current_ingredient:
            self.change_ingredient(ingredient)
            
