from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return '<h1>¡Hola desde Docker!</h1><p>Esta es mi primera aplicación en un contenedor.</p>'

@app.route('/health')
def health():
    return {'status': 'ok'}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

