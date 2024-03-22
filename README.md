# Funance

Finance webapp 2.0

## Installation

### Backend Flask API

Dependencies for this project are installed in a virtual environment.

Install virtual environment (if not already installed).

```properties
pip install virtualenv
```

Create the virtual environment in the project directory.

```properties
python -m venv venv
```

Activate the virtual environment (for bash).

```properties
source venv/Scripts/activate
```

Install dependencies from `requirements.txt`.

```properties
pip install -r requirements.txt
```

Check all installed packages and versions

```properties
pip freeze
```

create `.env` file in frontend folder and create environmental variables

```python
DEV_DB_URI
```

### Frontend React

Install dependencies

```properties
npm install
```

create `.env` file in backend folder and create environmental variables

```python
VITE_APP_API_URL
```

## Usage

Run both the frontend and backend seperately

In the backend folder, run `app.py` to initiate flask backend

```properties
python src/app.py
```

In the frontend folder run the React app

```properties
npm run dev
```
