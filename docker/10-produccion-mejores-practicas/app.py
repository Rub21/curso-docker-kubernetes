from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def hello():
    return '''
    <h1>Aplicación en Producción</h1>
    <p>Esta aplicación sigue las mejores prácticas de Docker:</p>
    <ul>
        <li>✅ Usuario no-root</li>
        <li>✅ Multi-stage build</li>
        <li>✅ Healthcheck configurado</li>
        <li>✅ Variables de entorno</li>
    </ul>
    '''

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'environment': os.getenv('NODE_ENV', 'development')
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

