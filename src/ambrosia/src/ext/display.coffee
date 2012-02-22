{Document} = require 'nodes/document'
{Literal} = require 'nodes/literal'
{Assign} = require 'nodes/assign'
{ViewTemplate} = require 'view_template'
{create_dom, traverse_and_build, build_dom_from} = require 'dom'

Document.preprocessor 'display',
  (builder, filenames...) ->
    for filename in filenames
      template = ViewTemplate.find filename
    
      if layout = @root().layout
        @root().current_template = template
        dom_nodes = create_dom layout.process this, builder
        @root().current_template = null
      else
        dom_nodes = create_dom template.process this, builder
        
      screen = builder.current_screen()
      if screen.is_wait_screen()
        screen = screen.extend()

      display = screen.b 'display'
      traverse_and_build display, dom_nodes

    # what is there to return?
    @create Literal, ""
