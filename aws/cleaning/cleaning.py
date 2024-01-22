from supabase_py import create_client, Client
from datetime import datetime
import pytz
import os

def lambda_handler(event, context):
    try:
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(url, key)
    except Exception as e:
        print(f"Failed to create Supabase client: {e}")
    
    today = datetime.now(pytz.timezone('UTC')).strftime('%A, %B %d, %Y')

    response = supabase.table('your-table-name').delete().lte('your-date-column', today).execute()

    if response.error:
        print(f"Failed to delete rows: {response.error}")
        return {
            'statusCode': 500,
            'body': f"Failed to delete rows: {response.error}"
        }
    else:
        print(f"Deleted {response.count} rows")
        return {
            'statusCode': 200,
            'body': f"Deleted {response.count} rows"
        }