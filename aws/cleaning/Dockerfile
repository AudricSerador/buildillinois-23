FROM public.ecr.aws/lambda/python:3.9

RUN pip install supabase

COPY cleaning.py ./
CMD [ "cleaning.handler" ]