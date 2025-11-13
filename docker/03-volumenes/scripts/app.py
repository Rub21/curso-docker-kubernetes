import os
from datetime import datetime

def main():
    data_dir = '/data'
    os.makedirs(data_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    message = f"Contenedor ejecutado el: {timestamp}\n"
    
    log_file = os.path.join(data_dir, 'log.txt')
    with open(log_file, 'a') as f:
        f.write(message)
    
    print(f"Log guardado en: {log_file}")
    print(f"Mensaje: {message}")

if __name__ == '__main__':
    main()

