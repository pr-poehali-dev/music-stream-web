import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage tracks - add, list, get current track
    Args: event with httpMethod, body, queryStringParameters
    Returns: HTTP response with track data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            path = event.get('queryStringParameters', {}).get('path', 'list')
            
            if path == 'current':
                cur.execute("""
                    SELECT t.*, 
                           COALESCE(COUNT(ls.id), 0) as play_count
                    FROM tracks t
                    LEFT JOIN listen_stats ls ON t.id = ls.track_id
                    WHERE t.is_active = true
                    GROUP BY t.id
                    ORDER BY t.created_at DESC
                    LIMIT 1
                """)
                track = cur.fetchone()
                
                if track:
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps(dict(track), default=str),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'No active tracks'}),
                        'isBase64Encoded': False
                    }
            
            elif path == 'list':
                limit = int(event.get('queryStringParameters', {}).get('limit', '50'))
                cur.execute("""
                    SELECT t.*, 
                           COALESCE(COUNT(ls.id), 0) as play_count
                    FROM tracks t
                    LEFT JOIN listen_stats ls ON t.id = ls.track_id
                    WHERE t.is_active = true
                    GROUP BY t.id
                    ORDER BY t.created_at DESC
                    LIMIT %s
                """, (limit,))
                tracks = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps([dict(t) for t in tracks], default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            youtube_url = body_data.get('youtube_url')
            title = body_data.get('title')
            artist = body_data.get('artist')
            year = body_data.get('year')
            album = body_data.get('album')
            cover_url = body_data.get('cover_url')
            
            if not youtube_url or not title or not artist:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'youtube_url, title, and artist are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO tracks (youtube_url, title, artist, year, album, cover_url)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, youtube_url, title, artist, year, album, cover_url, created_at
            """, (youtube_url, title, artist, year, album, cover_url))
            
            new_track = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(new_track), default=str),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
