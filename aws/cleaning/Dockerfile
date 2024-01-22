FROM public.ecr.aws/lambda/python:3.9

RUN pip install supabase

COPY app.py ./
CMD [ "app.handler" ]