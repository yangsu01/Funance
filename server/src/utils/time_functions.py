from datetime import datetime
import pytz
import pandas as pd


def get_est_time() -> datetime:
    '''Gets the current time in EST
        returns:
            datetime - current time in EST
    '''
    est = pytz.timezone('US/Eastern')

    return datetime.now(est)


def utc_to_est(utc_time: datetime) -> datetime:
    '''Converts a UTC datetime to EST
        args:
            utc_time: datetime - datetime in UTC
        returns:
            datetime - datetime in EST
    '''
    utc_time = utc_time.replace(tzinfo=pytz.utc)
    est = pytz.timezone('US/Eastern')

    return utc_time.astimezone(est)


def check_market_closed() -> bool:
    '''Checks if the stock market is open
        assumes stock market closes on 4pm EST every weekday
        returns:
            bool - True if market is closed, False otherwise
    '''
    est_time = get_est_time()

    if est_time.weekday() < 5 and est_time.hour < 16:
        return False
    else:
        return True
    

def get_market_date(est_time: datetime) -> datetime.date:
    '''Gets the last date the stock market was open
        If the market is currently open, returns the current date
        args:
            date: datetime - current date and time
        returns:
            datetime.date - last date that the market was open
    '''

    # if market is currently open, return current date
    if est_time.weekday() < 5 and est_time.hour >= 10:
        return est_time.date()
    else:
        return est_time.date() - pd.tseries.offsets.BDay(1)