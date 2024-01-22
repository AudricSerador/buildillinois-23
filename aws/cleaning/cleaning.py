from supabase import create_client, Client
from datetime import datetime
import pytz
import os

def handler(event, context):
    try:
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(url, key)
    except Exception as e:
        print(f"Failed to create Supabase client: {e}")
    
    today = datetime.now(pytz.timezone('UTC'))

    # Fetch all unique 'dateServed' values from the database
    response = supabase.table('mealDetails').select('dateServed').execute()

    if response.error:
        print(f"Failed to fetch rows: {response.error}")
        return {
            'statusCode': 500,
            'body': f"Failed to fetch rows: {response.error}"
        }

    # Convert 'dateServed' values to date objects and compare with 'today'
    dates_to_delete = []
    for row in response.data:
        date_served = datetime.strptime(row['dateServed'], '%A, %B %d, %Y')
        if date_served < today:
            dates_to_delete.append(row['dateServed'])

    # Delete rows where 'dateServed' is in 'dates_to_delete'
    for date in dates_to_delete:
        response = supabase.table('mealDetails').delete().eq('dateServed', date).execute()

        if response.error:
            print(f"Failed to delete rows: {response.error}")
            return {
                'statusCode': 500,
                'body': f"Failed to delete rows: {response.error}"
            }

    print(f"Deleted {len(dates_to_delete)} rows")
    return {
        'statusCode': 200,
        'body': f"Deleted {len(dates_to_delete)} rows"
    }