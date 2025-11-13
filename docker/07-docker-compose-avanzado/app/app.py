import os
from flask import Flask
import redis
import psycopg2

app = Flask(__name__)

# Configuración desde variables de entorno
database_url = os.getenv('DATABASE_URL', 'No configurada')
redis_url = os.getenv('REDIS_URL', 'No configurada')

@app.route('/')
def hello():
    return f'''
    <h1>¡Hola desde Docker Compose Avanzado!</h1>
    <p>Esta aplicación está conectada a múltiples servicios.</p>
    <ul>
        <li>DATABASE_URL: {database_url}</li>
        <li>REDIS_URL: {redis_url}</li>
    </ul>
    '''

@app.route('/health')
def health():
    return {'status': 'ok'}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

