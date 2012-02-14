exports.Format = class Format
  constructor: (type, format, @string) ->
    @formatters = []
    _formatters = Format._formatters[type]
    throw new Error "Couldn't find any formatters for type #{type}!" if !_formatters
    while format.length > 0
      match = null
      for formatter in _formatters
        formatter = [formatter...] # duplicate it to prevent tainting across Formatter instances
        format_pattern = formatter[0]
        if format_pattern instanceof RegExp
          match = format_pattern.exec(format)
          if match
            _match = match.shift()
            formatter.push match
            @formatters.push formatter
            match = _match
            break
        else
          if format.indexOf(format_pattern) == 0
            match = format_pattern
            formatter.push match
            @formatters.push formatter
            break
      unless match
        @formatters.push match = format.substring(0, 1)
      format = format.replace match, ''
        
  process: ->
    result = ""
    for formatter in @formatters
      if typeof(formatter) == 'string'
        result += formatter
      else
        format = formatter[0]
        callback = formatter[1]
          
        t = callback(@string, formatter[2]...)
        if t && t[0]
          result += t[0]
          @string = t[1]
          
    # remove escapes
    escaped = false
    _result = ""
    for i in result
      if escaped == true
        _result += i
        continue
      if i == "\\"
        escaped = true
        continue
      _result += i
        
    _result
  
  @_formatters: {}
  
  @register: (type, format, callback = null) ->
    @_formatters[type] or= []
    for index in [0...@_formatters[type].length]
      if @_formatters[type][index][0].toString().length < format.toString().length
        return @_formatters[type].splice index, 0, [format, callback]
    @_formatters[type].push [format, callback]
    
Format.register 'string', 'c',   (string) -> res = /^\D/.exec(string);  res && [res[0], string.replace(res[0], '')]
Format.register 'string', 'c*',  (string) -> res = /^\D*/.exec(string); res && [res[0], string.replace(res[0], '')]
Format.register 'string', 'c#',  (string) -> res = /^\D/.exec(string);  res && ["*", string.substring(1, string.length)]
Format.register 'string', 'c#*', (string) -> res = /^\D*/.exec(string); res && [("*" for i in [0...res[0].length]).join(""), string.substring(res[0].length, string.length)]
Format.register 'string', 'n',   (string) -> res = /^\d/.exec(string);  res && [res[0], string.replace(res[0], '')]
Format.register 'string', 'n*',  (string) -> res = /^\d*/.exec(string); res && [res[0], string.replace(res[0], '')]
Format.register 'string', 'n#',  (string) -> res = /^\d/.exec(string);  res && ["*", string.substring(1, string.length)]
Format.register 'string', 'n#*', (string) -> res = /^\d*/.exec(string); res && [("*" for i in [0...res[0].length]).join(""), string.substring(res[0].length, string.length)]

# c3, n3
Format.register 'string', /^([cn])(\d+)/, (string, c_or_n, digits) ->
  if c_or_n == 'c'
    res = new RegExp "^\\D{0,#{digits}}"
  else
    res = new RegExp "^\\d{0,#{digits}}"
    
  if res = res.exec(string)
    res = res[0]
    [res + ("-" for i in [res.length...digits]).join(""), string.substring(res.length, string.length)]
  else
    # null
    [("-" for i in [0...digits]).join(""), string]
    
# c#3, n#3
Format.register 'string', /^([cn])#(\d+)/, (string, c_or_n, digits) ->
  if c_or_n == 'c'
    res = new RegExp "^\\D{0,#{digits}}"
  else
    res = new RegExp "^\\d{0,#{digits}}"
    
  if res = res.exec(string)
    res = res[0]
    [("*" for c in [0...res.length]).join("") + ("*" for i in [res.length...digits]).join(""), string.substring(res.length, string.length)]
  else
    [("*" for i in [0...digits]).join(""), string]
