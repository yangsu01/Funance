import yfinance as yf


def get_stock_info(ticker: str) -> dict:
    '''Gets detailed stock information from yfinance

        args:
            ticker: str - stock ticker
        returns:
            dict - stock information
    '''
    stock_info = yf.Ticker(ticker).info
    
    if 'currentPrice' not in stock_info:
        raise Exception('cannot find ticker')
    else:
        return {
        'price': round(float(stock_info.get('currentPrice')), 2),
        'sector': stock_info.get('sector', 'n/a'),
        'industry': stock_info.get('industry', 'n/a'),
        'company_summary': stock_info.get('longBusinessSummary', 'n/a'),
        'currency': stock_info.get('currency', 'n/a'),
        'company_name': stock_info.get('longName', 'n/a'),
        'open': stock_info.get('open'),
        'previous_close': stock_info.get('previousClose'),
        'day_change': round(float(stock_info.get('currentPrice', 0))-float(stock_info.get('open', 1)), 2),
        '%_day_change': round((float(stock_info.get('currentPrice', 0))/float(stock_info.get('open', 1)) - 1)*100, 2),
        '52_week_returns': round(float(stock_info.get('52WeekChange', 0))*100, 2),
        '52_week_high': round(float(stock_info.get('fiftyTwoWeekHigh', 0)), 2),
        '52_week_low': round(float(stock_info.get('fiftyTwoWeekLow', 0)), 2)
    }
        

def get_stock_history(ticker: str, period='5y', detailed=False) -> dict:
    '''Gets the historical price of a stock

        args:
            ticker: str - stock ticker
            period: str - time period for the historical data
            detailed: bool - whether to included detailed data: open, high, low, close
        returns:
            dict - dictionary of the historical price of a stock
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

    return history


def get_stock_news(ticker: str) -> list:
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