
start: react flask

react:
	@cd client && \
	npm start & 

flask: 
	@cd flask-server && \
	. venv/bin/activate && \
	flask --app test run &

setup: setupflask setupreact

setupflask:
	@cd flask-server && \
	python3 -m venv venv && \
	. venv/bin/activate && \
	pip install -r requirements.txt

setupreact:
	cd client && \
	npm install && \


clean:
	-@pkill -f "flask --app test run" || true
	-@pkill -f "node.*client" || true
	@stty echo
	
.PHONY: app clean	