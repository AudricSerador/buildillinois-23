import os
import datetime
from supabase import create_client, Client

def handler(event, context):
    try:
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(url, key)
    except Exception as e:
        print(f"Failed to create Supabase client: {e}")
    
    today = datetime.date.today()

    try:
        response = supabase.table('mealDetails').select('dateServed').execute()
    except Exception as e:
        print(f"Failed to fetch rows: {e}")
        return {
            'statusCode': 500,
            'body': f"Failed to fetch rows: {e}"
        }

    dates_to_delete = []
    for row in response.data:
        _, date = row['dateServed'].strip().split(', ', 1)
        month, day, year = date.split()
        day = int(day.strip(','))
        date_served = datetime.datetime.strptime(f"{month} {day} {year}", '%B %d %Y').date()
        if date_served < today:
            dates_to_delete.append(row['dateServed'])

    for date in dates_to_delete:
        try:
            response = supabase.table('mealDetails').delete().eq('dateServed', date).execute()
        except Exception as e:
            print(f"Failed to delete rows: {e}")
            return {
                'statusCode': 500,
                'body': f"Failed to delete rows: {e}"
            }

    print(f"Deleted {len(dates_to_delete)} rows")
    return {
        'statusCode': 200,
        'body': f"Deleted {len(dates_to_delete)} rows"
    }