import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Track listening statistics and get analytics
    Args: event with httpMethod, body for recording listens
    Returns: HTTP response with stats data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            track_id = body_data.get('track_id')
            duration_seconds = body_data.get('duration_seconds', 0)
            
            request_context = event.get('requestContext', {})
            identity = request_context.get('identity', {})
            listener_ip = identity.get('sourceIp', 'unknown')
            
            if not track_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'track_id is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO listen_stats (track_id, listener_ip, duration_seconds)
                VALUES (%s, %s, %s)
                RETURNING id, listened_at
            """, (track_id, listener_ip, duration_seconds))
            
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'id': result['id']}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            cur.execute("""
                SELECT 
                    t.id,
                    t.title,
                    t.artist,
                    COUNT(ls.id) as total_plays,
                    SUM(ls.duration_seconds) as total_duration,
                    MAX(ls.listened_at) as last_played
                FROM tracks t
                LEFT JOIN listen_stats ls ON t.id = ls.track_id
                WHERE t.is_active = true
                GROUP BY t.id, t.title, t.artist
                ORDER BY total_plays DESC
                LIMIT 50
            """)
            
            stats = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(s) for s in stats], default=str),
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
