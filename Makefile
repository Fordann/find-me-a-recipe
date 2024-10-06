# Variables
PYTHON_VERSION = 3.12.5
VENV_NAME = marmiton
FLASK_DIR = flask-server
REACT_DIR = client

# Commande principale pour démarrer Flask et React
start: react flask
	@echo "Les serveurs Flask et React sont démarrés."

# Démarre le serveur React
react:
	@cd $(REACT_DIR) && \
	npm start &

#activate virtual env
venv:
	cd $(FLASK_DIR) && \
	export PATH="$${HOME}/.pyenv/bin:$$PATH" && \
	eval "$$(pyenv init --path)" && \
	eval "$$(pyenv init -)" && \
	eval "$$(pyenv virtualenv-init -)" && \
	pyenv activate $(VENV_NAME)


# Démarre le serveur Flask
flask:
	@cd $(FLASK_DIR) && \
	export PATH="$${HOME}/.pyenv/bin:$$PATH" && \
	eval "$$(pyenv init --path)" && \
	eval "$$(pyenv init -)" && \
	eval "$$(pyenv virtualenv-init -)" && \
	pyenv activate $(VENV_NAME) && \
	flask --app test run

# Installation complète des environnements Flask et React
setup: setupflask setupreact
	@echo "Installation complète terminée."

# Configuration de l'environnement Flask avec pyenv et pipenv
setupflask:
	cd $(FLASK_DIR) && \
	curl https://pyenv.run | bash || true && \
	export PATH="$${HOME}/.pyenv/bin:$$PATH" && \
	eval "$$(pyenv init --path)" && \
	eval "$$(pyenv init -)" && \
	eval "$$(pyenv virtualenv-init -)" && \
	pyenv install -s $(PYTHON_VERSION) && \
	pyenv virtualenv $(PYTHON_VERSION) $(VENV_NAME) && \
	pyenv activate $(VENV_NAME) && \
	pip install -r ../requirements.txt

# Installation des dépendances du client React
setupreact:
	@cd $(REACT_DIR) && \
	npm install

# Arrête les processus Flask et React démarrés par le Makefile
clean:
	-@pkill -f "flask --app test run" || true
	-@pkill -f "node.*$(REACT_DIR)" || true

# Déclaration des cibles qui ne sont pas des fichiers
.PHONY: start react flask setup setupflask setupreact clean