nodes = """
  CLASS_NAME        FILE_NAME
  
  Base              base
  Require           require
  Document          document
  Block             block
  Literal           literal
  Assign            assign
  Identifier        identifier
  Return            return
  Operation         operation
  Parens            parens
  ListIndex         list_index
  MethodReference   method_reference
  Method            method
  MethodCall        method_call
  If                if
  Closure           closure
  ForIn             for_in
  Range             range
  ForOf             for_of
  PropertyAccess    property_access
""".split /\n/

for node in nodes[2..-1]
  [class_name, file_name] = node.trim().split /\s+/
  exports[class_name] = require("./nodes/#{file_name}")[class_name]
