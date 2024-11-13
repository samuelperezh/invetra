mkdir build
cd build
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pyinstaller --onefile --name RPA --add-data "../productos.xlsx:." --add-data ".env:." rpa_script.py
open dist/RPA