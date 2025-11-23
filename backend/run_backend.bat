@echo off
cd /d "%~dp0"

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo Starting Flask server...
set FLASK_APP=app
set FLASK_ENV=development
flask run --host=0.0.0.0 --port=5000
