const formatDatetime = (date: string, includeTime=false, timeZone='America/New_York') => {
  const newDate = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: includeTime ? '2-digit' : undefined,
    minute: includeTime ? '2-digit' : undefined,
    timeZoneName: includeTime ? 'short' : undefined,
  };

  return (new Intl.DateTimeFormat('en-US', options).format(newDate))
};

export default formatDatetime;