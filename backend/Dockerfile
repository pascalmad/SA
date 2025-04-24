# 
FROM --platform=linux/amd64 python:3.10-slim-buster

# 
WORKDIR /code

# 
COPY ./requirements.txt /code/requirements.txt

# 

RUN pip install --upgrade pip
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt



# 
COPY . /code

# 
#CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]
CMD ["python", "main.py"]