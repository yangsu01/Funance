from datetime import datetime
import pytz
import pandas as pd


def get_est_time() -> datetime:
    """ Gets the current time in EST

    Returns:
        datetime: datetime in EST
    """
    est = pytz.timezone('US/Eastern')

    return datetime.now(est)


def utc_to_est(utc_time: datetime) -> datetime:
    """ Converts a UTC time to EST

    Args:
        utc_time (datetime): time in UTC

    Returns:
        datetime: time in EST
    """
    utc_time = utc_time.replace(tzinfo=pytz.utc)
    est = pytz.timezone('US/Eastern')

    return utc_time.astimezone(est)


def check_market_closed() -> bool:
    """ Checks if the stock market is closed
        Assumes market is closed on weekends and after 4pm EST

    Returns:
        bool: True if market is closed, False if market is open
    """
    est_time = get_est_time()
    
    if est_time.weekday() > 5:
        return True
    elif est_time.hour >= 16: 
        return True
    elif est_time.hour < 9 or (est_time.hour == 9 and est_time.minute < 30):
        return True
    
    return False
    

def get_market_date(est_time: datetime) -> datetime.date:
    """ Gets the last day the stock market was open
        If the market is currently open, returns the current date
    
    Args:
        est_time (datetime): time in EST

    Returns:
        datetime.date: date of last market day
    """
    if est_time.weekday() < 5 and est_time.hour >= 10:
        return est_time.date()
    else:
        return est_time.date() - pd.tseries.offsets.BDay(1)