require 'active_support/core_ext'

# Include this into your test framework to gain convenience wrappers around
# the Ambrosia TML simulator. The simulator instance itself can be accessed
# with #simulator and it is an instance of `Ambrosia::Simulator::Instance`.
module Ambrosia::Simulator
  include Ambrosia::Compiler
  
  # Represents an actual Simulator instance. The reason we don't just have an
  # Ambrosia::Simulator class is to make it easy to include `Ambrosia::Simulator`
  # into tests in order to gain convenience wrappers around a default simulator
  # instance.
  class Instance
    include ActionDispatch::Integration::Runner
    attr_reader :state, :tml
    
    def initialize(tml = nil)
      @app = Rails.application
      @script = []
      @routes = Rails.application.routes
      self.tml = tml if tml
    end
    
    def tml=(tml)
      @tml = tml
      @script = [ "__simulator = new Ambrosia.Simulator(#{MultiJson.encode tml})" ]
      accumulate "start"
    end
    
    # Enters text on the terminal. If a field can be found on the current
    # screen, text will be entered into it. The field's current value will not
    # be cleared, so the text will be appended to the field's current value.
    # If no field can be found, the text will be entered in the form of button
    # presses on the keypad. If a button press triggers a switch to a screen
    # containing a field, the remainder of the text will be added to the field.
    # If multiple fields are found on the same screen, the text will
    # be entered into the first visible field.
    #
    # After entry, the "ENTER" button on the keypad will be pressed. This can
    # be suppressed by passing a second argument, `false`, which indicates that
    # ENTER should not be pressed.
    def enter(text, press_enter = true)
      accumulate "enter", text, press_enter
    end
    
    # Press a button on the terminal
    def press(key)
      accumulate "press", key
    end
    
    # Follow a hyperlink that is currently visible on the terminal screen
    def follow(link)
      accumulate "follow", link
    end
    
    # Fill in a currently visible field with the given variable name
    def fill_in(field, content)
      accumulate "fill_in", field, content
    end
    
    # Swipe a magnetic stripe card (e.g. a credit card)
    def swipe_card(card_type)
      accumulate "swipe_card", card_type
    end
    
    # Returns the JavaScript code which will be evaluated to return the
    # simulator's current state.
    def return_script
      # the state contains one element we can't directly translate into a hash:
      # the screen XML element. so let's convert it into a string, to be parsed ruby-side
      # if the user needs to do so.
      <<-end_js
      (function() {
        var state = __simulator.state;
        return {
          key: state.key,
          variables: state.variables,
          display: state.display,
          print: state.print,
          flow: state.flow,
          post: state.post,
          screen: {
            id: state.screen.id,
            element: state.screen.element.toString(false)
          }
        };
      })()
      end_js
    end
    
    private
    def execute
      script = "(function() { #{@script.join(';')}; return #{return_script}; })()"
      puts script if ENV['DEBUG_SIMULATOR']
      context = Ambrosia::Compiler::Source.context
      @state = context.eval(script).with_indifferent_access
      
      # check for tml posts, and get new tml as necessary
      post = @state[:post]
      if post &&= post.dup
        post post.delete(:path), post.merge(:format => :tml)
        self.tml = response.body
      end
      
      @state
    end
    
    def accumulate(method_name, *args)
      add_method_call method_name, *args
      execute
    end
    
    def add_method_call(method_name, *args)
      @script << "__simulator.#{method_name}.apply(__simulator, #{MultiJson.encode(args)})"
    end
  end
  
  def simulate(ambrosia)
    simulate_tml compile(ambrosia)
  end
  
  def simulate_tml(tml)
    simulator.tml = tml
  end
  
  def simulator
    @simulator ||= begin
      if respond_to?(:tml)
        tml = self.tml
      else
        tml = nil
      end
      
      Ambrosia::Simulator::Instance.new tml
    end
  end
  
  def tml
    if respond_to?(:last_response)
      last_response and last_response.body
    else
      response and response.body
    end
  end
end
