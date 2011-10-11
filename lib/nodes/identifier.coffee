{Base} = require './base'
{Variable} = require '../variable_scope'

exports.Identifier = class Identifier extends Base
  children: -> ['name']
  type: -> @get_dependent_variable().type()
  compile: (b) -> "tmlvar:" + @get_dependent_variable().name
  get_dependent_variable: -> @current_scope().lookup @name

  assign_value: (setvar, val) ->
    _var = @current_scope().define @name
    if val instanceof Variable
      _var.depends_upon val
      setvar.attrs.lo = "tmlvar:#{val.name}"
    else if typeof(val) == 'object'
      setvar.attrs.lo = val.lo
      if val.format != undefined then setvar.attrs.format = val.format
      else if val.ro != undefined
        setvar.attrs.ro = val.ro
        setvar.attrs.op = val.op
      else throw new Error "Can't assign variable #{_var.name} to no value (#{JSON.stringify val})"
    else
      setvar.attrs.lo = val
      val = val.toString()
      # if it's a list then it's a string.
      if val.indexOf(";") != -1 then _var.setType 'string'
      else if match = /^tmlvar:(.*)$/.exec val
        _ro = @current_scope().lookup match[1]
        _var.depends_upon _ro
    setvar
