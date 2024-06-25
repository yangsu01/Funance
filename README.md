# Funance

Finance webapp v1

https://www.funance.lol/

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
SECRET_KEY
```

### React Frontend

Install dependencies in `client` folder

```properties
npm install
```

create `.env` file in folder and create environmental variables

```python
VITE_API_URL
VITE_CONTENTFUL_SPACE_ID
VITE_CONTENTFUL_ACCESS_TOKEN
VITE_CONTENTFUL_API_URL
```

## Usage

Run the server and client separately

In the server folder, run the Flask app

```properties
flask --app api run --debug
```

In the client folder, run the React app

```properties
npm run dev
```
