from typing import List, Dict
import yfinance as yf

from .math_functions import round_number


def get_stock_info(ticker: str) -> Dict[str, str]:
    """ Gets the stock information for a given ticker

    Args:
        ticker (str): ticker of the stock

    Raises:
        Exception: ticker not found

    Returns:
        dict: dictionary of stock information
    """
    stock_info = yf.Ticker(ticker).info
    
    if 'currentPrice' not in stock_info:
        raise Exception('cannot find ticker')
    else:
        return {
        'price': round_number(float(stock_info.get('currentPrice'))),
        'sector': stock_info.get('sector', 'n/a'),
        'industry': stock_info.get('industry', 'n/a'),
        'companySummary': stock_info.get('longBusinessSummary', 'n/a'),
        'currency': stock_info.get('currency', 'n/a'),
        'companyName': stock_info.get('longName', 'n/a'),
        'open': stock_info.get('open'),
        'prevClose': stock_info.get('previousClose'),
        'dayChange': round_number(float(stock_info.get('currentPrice', 0))-float(stock_info.get('open', 1))),
        '%DayChange': round_number((float(stock_info.get('currentPrice', 0))/float(stock_info.get('open', 1)) - 1)*100),
        '52WeekReturns': round_number(float(stock_info.get('52WeekChange', 0))*100),
        '52WeekHigh': round_number(float(stock_info.get('fiftyTwoWeekHigh', 0))),
        '52WeekLow': round_number(float(stock_info.get('fiftyTwoWeekLow', 0)))
    }
        

def get_stock_history(ticker: str, period='5y', detailed=False) -> Dict[str, List[float]]:
    """ Gets the stock history for a given ticker

    Args:
        ticker (str): ticker of the stock
        period (str, optional): time period for history. Defaults to '5y'.
        detailed (bool, optional): whether want detailed history. Defaults to False.

    Returns:
        dict: dictionary of stock history
    """
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
            'x': [d.strftime('%Y-%m-%d') for d in stock.index],
            'y': [p for p in round(stock['Close'], 2)]
        }

    return history


def get_stock_news(ticker: str) -> List[Dict[str, str]]:
    """ Gets the latest news articles for a given stock

    Args:
        ticker (str): ticker of the stock

    Returns:
        list: list of news articles
    """
    try:
        news = yf.Ticker(ticker).news
        articles = []

        for n in news:
            articles.append({
                'name': n['content']['title'],
                'url': n['content']['canonicalUrl']['url']
            })
    except Exception as e:
        articles = [{'name': 'No news available', 'url': ''}]

    return articles


def get_stock_prices(stock_tickers: list) -> Dict[str, float]:
    """ Gets the current price of a list of tickers

    Args:
        stock_tickers (list): list of tickers

    Returns:
        dict: current price, previous close, and opening price of each ticker
    """
    price_data = yf.Tickers(stock_tickers).tickers
    data = {}
    for ticker in stock_tickers:
        try:
            stock_info = price_data[ticker].info
            data[ticker] = {
                'curr_price': stock_info.get('currentPrice', None),
                'prev_close': stock_info.get('previousClose', None),
                'open_price': stock_info.get('open', None)
            }
        except Exception as e:
            data[ticker] = {
                'curr_price': None,
                'prev_close': None,
                'open_price': None
            }
    
    return data