{Document} = require 'nodes/document'
{Literal} = require 'nodes/literal'
{Assign} = require 'nodes/assign'
{ViewTemplate} = require 'view_template'
{create_dom, traverse_and_build, build_dom_from} = require 'dom'

frontend_element = (element_name, builder, filenames...) ->
  for filename in filenames
    if filename.indexOf("\n") == -1 and not /<[^>]+>/.test(filename)
      template = ViewTemplate.find filename
    else
      template = new ViewTemplate(filename)
  
    if layout = @root().layout
      @root().current_template = template
      dom_nodes = create_dom layout.process this, builder
      @root().current_template = null
    else
      dom_nodes = create_dom template.process this, builder
      
    screen = builder.current_screen()
    # if screen.is_wait_screen()
    screen = screen.extend()

    frontend = screen.b element_name
    traverse_and_build frontend, dom_nodes

  # what is there to return?
  @create Literal, ""

# Displays the specified view template. If the string contains at least
# one newline character (it always will if it's a multi-line string denoted by """)
# then the string itself is displayed as the view template. Also, if the string
# contains any XML tags, it is treated as the view template instead of the filename.
Document.preprocessor 'display',
  (builder, filenames...) ->
    frontend_element.call this, 'display', builder, filenames...
    
# Prints the specified view template. If the string contains at least
# one newline character, then the string itself is printed as the view template.
# Also, if the string
# contains any XML tags, it is treated as the view template instead of the filename.
Document.preprocessor 'print',
  (builder, filenames...) ->
    frontend_element.call this, 'print', builder, filenames...
