import json
from datetime import datetime
import pytz
import pandas as pd
import yfinance as yf

from . import db
from .data_models import Portfolio, Holdings, Transactions, History

STARTING_FUNDS = 10000.00

def get_est_time() -> datetime:
    '''Gets the current time in EST
        returns:
            datetime - current time in EST
    '''
    est = pytz.timezone('US/Eastern')

    return datetime.now(est)


def utc_to_est(utc_time: datetime) -> datetime:
    '''Converts a UTC time to EST
        args:
            utc_time: datetime - UTC time
        returns:
            datetime - EST time
    '''
    est = pytz.timezone('US/Eastern')

    return utc_time.astimezone(est)


def create_portfolio(user_id: int) -> None:
    '''Create a portfolio for a user
        args:
            user_id: int - database id of the user
    '''
    portfolio = Portfolio(user_id=user_id, 
                          available_cash=STARTING_FUNDS,
                          creation_date=datetime.today().date(), 
                          updated_value=STARTING_FUNDS, 
                          updated_time=get_est_time(), 
                          last_close_value=STARTING_FUNDS)

    db.session.add(portfolio)
    db.session.commit()

    history = History(portfolio_id=portfolio.id, 
                      record_time=get_est_time(), 
                      portfolio_value=STARTING_FUNDS)
    
    db.session.add(history)
    db.session.commit()


def get_stock_info(ticker: str) -> dict:
    '''Gets custom stock information from yfinance
        args:
            ticker: str - stock ticker
        returns:
            dict - stock information
    '''
    stock_info = yf.Ticker(ticker).info

    return {
        'price': round(float(stock_info.get('currentPrice', 0)), 2),
        'sector': stock_info.get('sector', 'n/a'),
        'industry': stock_info.get('industry', 'n/a'),
        'company_summary': stock_info.get('longBusinessSummary', 'n/a'),
        'currency': stock_info.get('currency', 'n/a'),
        'company_name': stock_info.get('longName', 'n/a'),
        'open': stock_info.get('open', 'n/a'),
        'day_change': round(float(stock_info.get('currentPrice', 0))-float(stock_info.get('open', 1)), 2),
        '%_day_change': round((float(stock_info.get('currentPrice', 0))/float(stock_info.get('open', 1)) - 1)*100, 2),
        '52_week_returns': round(float(stock_info.get('52WeekChange', 0))*100, 2),
        '52_week_high': round(float(stock_info.get('fiftyTwoWeekHigh', 0)), 2),
        '52_week_low': round(float(stock_info.get('fiftyTwoWeekLow', 0)), 2)
    }


def get_available_cash(user_id: int) -> float:
    '''Gets the available cash in a users portfolio. Assumes portfolio exists
        args:
            user_id: int - database id of the user
        returns:
            float - available cash
    '''
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()

    return portfolio.available_cash


def record_transaction(portfolio_id: int, ticker: str, status: str, name: str, shares: int, price: float, currency: str) -> None:
    '''Records a transaction in the database
        args:
            portfolio_id: int - database id of the portfolio
            ticker: str - stock ticker
            status: str - buy/sell
            name: str - stock name
            shares: int - number of shares
            price: float - price per share
            currency: str - currency of the transaction
    '''
    transaction = Transactions(portfolio_id=portfolio_id,
                               transaction_date=get_est_time(), 
                               status=status, 
                               company_name=name, 
                               ticker=ticker, 
                               currency=currency, 
                               number_of_shares=shares, 
                               price_per_share=round(price, 2), 
                               total_value=round(shares*price, 2))

    db.session.add(transaction)
    db.session.commit()


def update_holding(portfolio_id: int, ticker: str, name: str, shares: int, price: float, currency: str, industry="Unknown", sector="Unknown") -> None:
    '''Updates a stock holding in a portfolio after a transaction
        If its a sell transaction (shares<0), assumes that the holding exists
        args:
            portfolio_id: int - database id of the portfolio
            ticker: str - stock ticker
            name: str - stock name
            shares: int - number of shares
            price: float - price per share
            currency: str - currency of the stock
            industry: str - industry of the company
    '''
    holding = Holdings.query.filter_by(portfolio_id=portfolio_id, ticker=ticker).first()

    # sell transaction
    if shares < 0:
        if holding.number_of_shares == -1*shares:
            db.session.delete(holding)
        else: 
            holding.number_of_shares += shares
    # buy transaction
    else:
        # holding already exists in portfolio
        if holding:
            holding.average_price = round((holding.average_price*holding.number_of_shares + price*shares) / (holding.number_of_shares + shares), 2)
            holding.number_of_shares += shares
            holding.updated_price = round(price, 2)
            
        # holding is new to portfolio
        else:
            holding = Holdings(portfolio_id=portfolio_id, 
                               company_name=name, 
                               ticker=ticker, 
                               number_of_shares=shares, 
                               average_price=round(price, 2), 
                               updated_price=round(price, 2),
                               currency=currency, 
                               opening_price=round(price, 2),
                               industry=industry,
                               sector=sector)

            db.session.add(holding)
    
    db.session.commit()


def update_portfolio_cash(portfolio_id: int, transaction_cost: float) -> None:
    '''Updates the available cash for a portfolio 
    (subtracts the transaction cost from the available cash)
        args:
            portfolio_id: int - database id of the portfolio
            transaction_cost: float - total value of the transaction
    '''
    portfolio = Portfolio.query.filter_by(id=portfolio_id).first()

    portfolio.available_cash = round(portfolio.available_cash - transaction_cost, 2)

    db.session.commit()


def get_portfolio_transactions(portfolio_id: int) -> str:
    '''Gets all transactions in a portfolio and parses data into a json string
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            str - json string of transaction history of a portfolio
    '''
    transactions = Transactions.query.filter_by(portfolio_id=portfolio_id).all()

    transaction_history = []

    for transaction in transactions:
        transaction_history.append({
            'Ticker': transaction.ticker,
            'Company Name': transaction.company_name,
            'Buy/Sell': transaction.status,
            'Shares': transaction.number_of_shares,
            'Share Price': transaction.price_per_share,
            'Total Value': transaction.total_value,
            'Currency': transaction.currency,
            'Date (EST)': utc_to_est(transaction.transaction_date).strftime('%H:%M:%S %m-%d-%Y')
        })

    return json.dumps(transaction_history)


def get_portfolio_holdings(portfolio_id: int) -> str:
    '''Gets all holdings in a portfolio and parses data a json string
            portfolio_id: int - database id of the portfolio
        returns:
            str - json string of all holdings in a portfolio
    '''
    holdings = Holdings.query.filter_by(portfolio_id=portfolio_id).all()

    df = pd.DataFrame([h.__dict__ for h in holdings])

    df['Day Change'] = round((df['updated_price'] - df['opening_price']), 2)
    df['Total Day Change'] = round((df['Day Change'] * df['number_of_shares']), 2)
    df['Day Change (%)'] = round((df['Day Change'] / df['opening_price']) * 100, 2)
    df['Change'] = round((df['updated_price'] - df['average_price']), 2)
    df['Total Change'] = round((df['Change'] * df['number_of_shares']), 2)
    df['Change (%)'] = round((df['Change'] / df['average_price']) * 100, 2)
    df['Market Value'] = round((df['updated_price'] * df['number_of_shares']), 2)

    # rearrange and rename columns
    df = df[['ticker', 'number_of_shares', 'average_price', 'updated_price', 'Day Change', 'Day Change (%)', 'Total Change', 'Change (%)', 'Market Value', 'currency']]
    df = df.rename(columns={'ticker': 'Ticker',
                            'number_of_shares': 'Shares Owned',
                            'average_price': 'Average Price',
                            'updated_price': 'Current Price',
                            'currency': 'Currency'})

    return df.to_json(orient='records')


def get_portfolio_history(portfolio_id: int) -> str:
    '''Gets the history of a portfolio and parses data into a json string
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            str - json string of the history of a portfolio
    '''
    history = History.query.filter_by(portfolio_id=portfolio_id).all()

    portfolio_history = {
        'date': [utc_to_est(h.record_time).strftime('%Y-%m-%d %H:%M') for h in history],
        'value': [h.portfolio_value for h in history]
    }

    return json.dumps(portfolio_history)


def get_holding(portfolio_id: int, ticker: str) -> dict:
    '''Gets a specific holding from a portfolio. Assumes holding exists
        args:
            portfolio_id: int - database id of the portfolio
            ticker: str - stock ticker
        returns:
            dict - holding information
    '''
    holding = Holdings.query.filter_by(portfolio_id=portfolio_id, ticker=ticker).first()

    return {
        'ticker': holding.ticker,
        'name': holding.company_name,
        'shares': holding.number_of_shares,
        'average_price': holding.average_price,
        'updated_price': holding.updated_price,
        'currency': holding.currency,
        'open': holding.opening_price
    }


def get_current_price(ticker: str) -> float:
    '''Gets the current price of a stock
        args:
            ticker: str - stock ticker
        returns:
            float - current price of the stock
    '''
    return yf.Ticker(ticker).info.get('currentPrice', 'n/a')


def calculate_holding_value(average_price: float, current_price: float, shares: int, open: float) -> dict:
    '''Calculates the current value of a stock holding and other metrics
        args:
            average_price: float - average price of the stock
            current_price: float - current price of the stock
            shares: int - number of shares owned
        returns:
            dict - holding value and metrics
    '''
    return {
        'Shares Owned': shares,
        'Average Price per Share': f'${round(average_price, 2)}',
        'Total Purchase Value': f'${round(average_price * shares, 2)}',
        'Current Price per Share': f'${round(current_price, 2)}',
        'Current Market Value': f'${round(current_price * shares, 2)}',
        'Day Change per Share': f'${round(current_price - open, 2)}',
        'Total Day Change': f'${round((current_price - open) * shares, 2)}',
        'Day Change (%)': f'{round(((current_price - open) / open) * 100, 2)}%',
        'Change per Share': f'${round(current_price - average_price, 2)}',
        'Total Change': f'${round((current_price - average_price) * shares, 2)}',
        'Change (%)': f'{round(((current_price - average_price) / average_price) * 100, 2)}%'
    }


def get_stock_history(ticker: str, period='5y', detailed=False) -> str:
    '''Gets the historical price of a stock
        args:
            ticker: str - stock ticker
            period: str - time period for the historical data
            detailed: bool - whether to included detailed data: open, high, low, close
        returns:
            str - json string of the historical price of a stock
    '''
    stock = yf.Ticker(ticker).history(period=period).dropna()

    if detailed:
        history = {
            'date': [d.strftime('%Y-%m-%d') for d in stock.index],
            'close': [p for p in round(stock['Close'], 2)],
            'open': [p for p in round(stock['Open'], 2)],
            'high': [p for p in round(stock['High'], 2)],
            'low': [p for p in round(stock['Low'], 2)]
        }
    else:
        history = {
            'date': [d.strftime('%Y-%m-%d') for d in stock.index],
            'price': [p for p in round(stock['Close'], 2)]
        }

    return json.dumps(history)


def get_top_performers() -> str:
    '''Gets the top performing portfolios ordered
        returns:
            str - json string of top performing portfolios
    '''
    portfolios = Portfolio.query.all()
    ranked_portfolios = sorted(portfolios, key=lambda p: p.updated_value, reverse=True)

    top_performers = []
    count = 0
    prev = None

    for portfolio in ranked_portfolios:
        count += 1
        updated_val = portfolio.updated_value
        portfolio_change =  round((updated_val/STARTING_FUNDS - 1) * 100, 2)
        portfolio_age = (get_est_time().date() - portfolio.creation_date).days

        rank = count
        if updated_val == prev:
            rank = '-'
        
        if portfolio_age == 0:
            daily_change = 'n/a'
        else:
            daily_change = round(portfolio_change/portfolio_age, 2)
        
        top_performers.append({
            'Rank': rank,
            'Username': portfolio.user.username,
            'Portfolio Value': portfolio.updated_value,
            'Change (%)': portfolio_change,
            'Portfolio Age (days)': portfolio_age,
            'Daily Change (%)': daily_change
        })

        prev = updated_val


    return json.dumps(top_performers)


def get_top_daily_performers() -> str:
    '''Gets the top daily performers ordered
        returns:
            str - json string of top daily performers
    '''
    portfolios = Portfolio.query.all()
    ranked_portfolios = sorted(portfolios, key=lambda p: (p.updated_value / p.last_close_value), reverse=True)

    top_performers = []
    count = 0
    prev = None

    for portfolio in ranked_portfolios:
        count += 1
        day_change =  round(portfolio.updated_value - portfolio.last_close_value, 2)
        day_change_percent = round(day_change/portfolio.last_close_value*100, 2)

        rank = count
        if day_change_percent == prev:
            rank = '-'

        top_performers.append({
            'Rank': rank,
            'Username': portfolio.user.username,
            'Change (%)': day_change_percent,
            'Change ($)': day_change,
            'Total Value': portfolio.updated_value
        })

        prev = day_change_percent



    return json.dumps(top_performers)


def get_performance_history() -> str:
    '''Gets the performance history of all portfolios
        returns:
            str - json string of the performance history of all portfolios
    '''
    portfolios = Portfolio.query.all()
    history = []

    for portfolio in portfolios:
        history.append({
            'x': [utc_to_est(h.record_time).strftime('%Y-%m-%d %H:%M') for h in portfolio.history],
            'y': [h.portfolio_value for h in portfolio.history],
            'name': portfolio.user.username
        })

    return json.dumps(history)


def get_update_time() -> str:
    '''Gets the last time the portfolios were updated
        returns:
            str - last update time
    '''
    return utc_to_est(Portfolio.query.first().updated_time).strftime('%a, %b %d. %Y %I:%M%p') + ' EST'


def get_ticker_news(ticker: str) -> list:
    '''Gets the related news articles for a stock
        args:
            ticker: str - stock ticker
        returns:
            list - news articles for the stock
    '''
    news = yf.Ticker(ticker).news
    articles = []

    for n in news:
        articles.append({
            'name': n['title'],
            'url': n['link']
        })

    return articles


def get_sector_breakdown(portfolio_id: int) -> str:
    '''Gets the industry breakdown of a portfolio
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            str - json string of the industry breakdown of a portfolio
    '''
    holdings = Holdings.query.filter_by(portfolio_id=portfolio_id).all()
    sector_breakdown = {}

    for holding in holdings:
        sector = holding.sector
        if sector == None:
            sector = 'Unknown'

        sector_breakdown[sector] = sector_breakdown.get(sector, 0) + holding.updated_price * holding.number_of_shares

    return json.dumps({
        'labels': list(sector_breakdown.keys()),
        'values': list(sector_breakdown.values())
    })


def get_holdings_breakdown(portfolio_id: str) -> str:
    '''Gets the holdings breakdown of a portfolio
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            str - json string of the holdings breakdown of a portfolio
    '''
    holdings = Holdings.query.filter_by(portfolio_id=portfolio_id).all()
    holding_breakdown = {}

    for holding in holdings:
        holding_breakdown[holding.ticker] = holding_breakdown.get(holding.ticker, 0) + holding.updated_price * holding.number_of_shares

    return json.dumps({
        'labels': list(holding_breakdown.keys()),
        'values': list(holding_breakdown.values())
    })