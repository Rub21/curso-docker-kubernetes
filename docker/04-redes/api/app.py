import os
from flask import Flask

app = Flask(__name__)

database_url = os.getenv('DATABASE_URL', 'No configurada')

@app.route('/')
def hello():
    return f'''
    <h1>API en Red Personalizada</h1>
    <p>Esta API puede comunicarse con otros servicios por nombre:</p>
    <ul>
        <li>Base de datos: db</li>
        <li>Redis: redis</li>
    </ul>
    <p>DATABASE_URL: {database_url}</p>
    '''

@app.route('/health')
def health():
    return {'status': 'ok'}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

