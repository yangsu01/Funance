# Funance

Finance webapp 1.0

## Installation

### Flask API

Dependencies for this project are installed in a virtual environment

Install virtual environment (if not already installed)

```properties
pip install virtualenv
```

Create the virtual environment in `/server` folder.

```properties
cd server
python -m venv venv
```

Activate the virtual environment

```properties
source venv/Scripts/activate
```

Install dependencies from `requirements.txt`

```properties
pip install -r requirements.txt
```

Check all installed packages and versions

```properties
pip freeze
```

create `.env` file and set environmental variables

```python
DEV_DB_URI
DEV_ENV
SECRET_KEY
```

### React Frontend

Install dependencies in `client` folder

```properties
npm install
```

create `.env` file in  folder and create environmental variables

```python
VITE_APP_API_URL
```

## Usage

Run the server and client folders seperately

In the server folder, run `api.py` to initiate flask backend

```properties
python src/app.py
```

In the client folder run the React app

```properties
npm run dev
```
