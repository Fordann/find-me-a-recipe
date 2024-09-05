
start: react flask

react:
	@cd client && \
	npm start & 

flask: 
	@cd flask-server && \
	pyenv activate marmiton && \
	flask --app test run &

setup: setupflask setupreact

setupflask:
	@cd flask-server && \
	pyenv virtualenv 3.12.5 marmiton && \
	source venv/bin/activate && \
	pyenv activate marmiton && \
	pipenv install *

setupreact:
	cd client && \
	npm install


clean:
	-@pkill -f "flask --app test run" || true
	-@pkill -f "node.*client" || true
	@stty echo
	
.PHONY: app clean	