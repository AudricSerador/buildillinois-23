FROM umihico/aws-lambda-selenium-python:latest

RUN pip install supabase

COPY scraping.py ./
CMD [ "scraping.handler" ]