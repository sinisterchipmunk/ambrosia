{Document} = require 'nodes/document'
{Literal} = require 'nodes/literal'
{Assign} = require 'nodes/assign'
{ViewTemplate} = require 'view_template'
{create_dom, traverse_and_build, build_dom_from} = require 'dom'

frontend_element = (element_name, builder, templates...) ->
  for template in templates
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

# Displays the string as a view template.
Document.preprocessor 'display',
  (builder, strings...) ->
    frontend_element.call this, 'display', builder, (new ViewTemplate string for string in strings)...
    
# Prints the string as a view template.
Document.preprocessor 'print',
  (builder, strings...) ->
    frontend_element.call this, 'print', builder, (new ViewTemplate string for string in strings)...

Document.preprocessor 'show_view',
  (builder, filenames...) ->
    frontend_element.call this, 'display', builder, (ViewTemplate.find filename for filename in filenames)...

Document.preprocessor 'print_view',
  (builder, filenames...) ->
    frontend_element.call this, 'print', builder, (ViewTemplate.find filename for filename in filenames)...