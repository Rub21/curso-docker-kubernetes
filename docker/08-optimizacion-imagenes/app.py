from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return '<h1>Imagen Optimizada</h1><p>Esta imagen sigue las mejores prácticas de optimización.</p>'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

