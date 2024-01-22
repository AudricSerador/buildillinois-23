FROM public.ecr.aws/lambda/python:3.9

RUN pip install supabase
RUN pip install pytz

COPY cleaning.py ./
CMD [ "cleaning.handler" ]