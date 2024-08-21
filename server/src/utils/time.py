from datetime import datetime
import pytz
import pandas as pd
from pandas.tseries.holiday import USFederalHolidayCalendar


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
    date = get_est_time()
    
    cal = USFederalHolidayCalendar()
    holidays = cal.holidays(start=date.date(), end=date.date()+pd.DateOffset(years=1))
    
    if date.weekday() >= 5 or date.date() in holidays:
        return True
    elif date.hour >= 16: 
        return True
    elif date.hour < 9 or (date.hour == 9 and date.minute < 30):
        return True
    
    return False
    

def get_prev_market_date() -> datetime.date:
    """ Gets the last day the stock market was open
        If the market is currently open, returns the current date
    
    Args:
        est_time (datetime): time in EST

    Returns:
        datetime.date: date of last market day
    """
    est_time = get_est_time()
    cal = USFederalHolidayCalendar()
    holidays = cal.holidays(start=est_time.date(), end=est_time.date()+pd.DateOffset(years=1))
    
    # if its a weekend or holiday, subtract a day
    if est_time.weekday() >= 5 or est_time.date() in holidays:
        return get_prev_market_date(est_time.date() - pd.DateOffset(days=1) + pd.DateOffset(hours=12))
    # if its before 9:30am (market has not opened yet), subtract a day
    elif est_time.hour < 9 or (est_time.hour == 9 and est_time.minute < 30):
        return get_prev_market_date(est_time.date() - pd.DateOffset(days=1) + pd.DateOffset(hours=12))
    else:
        return est_time.date()
    

def get_next_market_date() -> str:
    """ Gets the next day the stock market will be open
        If the market is currently open, returns the current date
        If the market has not opened yet, returns the current date

    Returns:
        str: date of next market day
    """
    est_time = get_est_time()
    cal = USFederalHolidayCalendar()
    holidays = cal.holidays(start=est_time.date(), end=est_time.date()+pd.DateOffset(years=1))
    
    # if its a weekend or holiday, add a day
    if est_time.weekday() >= 5 or est_time.date() in holidays:
        return get_next_market_date(est_time.date() + pd.DateOffset(days=1))
    # if its after 4pm, add a day
    elif est_time.hour >= 16:
        return get_next_market_date(est_time.date() + pd.DateOffset(days=1))
    else:
        return est_time.date().strftime('%Y-%m-%d')