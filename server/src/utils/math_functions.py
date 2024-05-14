def round_number(number: float, decimals=4) -> float:
    """ Rounds a number to a specified number of decimals, but only if there are decimals to round

    Args:
        number (float): number to round
        decimals (int, optional): max number of decimals to round to. Defaults to 4.

    Returns:
        float: rounded number
    """
    number = round(number, decimals)
    length = len(str(number).split('.')[1])
    
    return round(number, length)