from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return '<h1>¡Hola desde Multi-Stage Build!</h1><p>Imagen optimizada con Python.</p>'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

