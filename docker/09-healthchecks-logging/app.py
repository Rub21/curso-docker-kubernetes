from flask import Flask, jsonify
import time
import logging
import sys

# Configurar logging estructurado
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
        }
        return str(log_entry)

logger = logging.getLogger()
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)

app = Flask(__name__)
start_time = time.time()

@app.route('/')
def hello():
    logger.info('Request recibida en /')
    return '<h1>Mi Aplicación con Healthcheck</h1><p>Esta aplicación tiene healthcheck configurado.</p>'

@app.route('/health')
def health():
    uptime = time.time() - start_time
    logger.info('Health check ejecutado')
    return jsonify({
        'status': 'healthy',
        'uptime': round(uptime, 2)
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

