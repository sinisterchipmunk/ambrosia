{Base} = require './base'
{Variable} = require '../variable_scope'
{Expression} = require '../simulator/expression'
require '../simulator/all_expressions'

exports.Identifier = class Identifier extends Base
  children: -> ['name']
  type: -> @get_dependent_variable().type()
  compile: (b) -> "tmlvar:" + @get_dependent_variable().name
  get_dependent_variable: -> @current_scope().lookup @name
  to_code: -> @name
    
  assign_value: (setvar, val, expr_type = null) ->
    _var = @current_scope().define @name
    if val instanceof Variable
      _var.depends_upon val
      setvar.attrs.lo = "tmlvar:#{val.name}"
      _var.last_known_value = val.last_known_value
    else if typeof(val) == 'object'
      setvar.attrs.lo = val.lo
      if val.format != undefined then setvar.attrs.format = val.format
      else if val.ro != undefined
        setvar.attrs.ro = val.ro
        setvar.attrs.op = val.op
      else throw new Error "Can't assign variable #{_var.name} to no value (#{JSON.stringify val})"
      if op_type = expr_type || _var.type()
        _var.last_known_value = Expression.evaluate op_type, setvar.attrs, @current_scope().root().to_simulator_scope()
    else
      setvar.attrs.lo = val
      val = val.toString()
      # if it's a list then it's a string.
      if val.indexOf(";") != -1
        _var.setType 'string'
        _var.last_known_value = val
      else if match = /^tmlvar:(.*)$/.exec val
        _ro = @current_scope().lookup match[1]
        _var.depends_upon _ro unless /^__generic_method_param_/.test _ro.name
        _var.last_known_value = _ro.last_known_value
      else
        _var.last_known_value = val
    setvar
