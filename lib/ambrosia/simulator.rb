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
    attr_reader :state
    
    def initialize(tml)
      @tml = tml
      @script = [ "__simulator = new Ambrosia.Simulator(#{MultiJson.encode(tml)})" ]
      accumulate "start"
    end
    
    def press(key)
      accumulate "press", key
    end
    
    def follow(link)
      accumulate "follow", link
    end
    
    def swipe_card(card_type)
      accumulate "swipe_card", card_type
    end
    
    def return_script
      # the state contains one element we can't directly translate into a hash:
      # the screen XML element. so let's convert it into a string, to be parsed ruby-side
      # if the user needs to do so.
      <<-end_js
      (function() {
        var state = __simulator.state;
        return {
          variables: state.variables,
          key: state.key,
          display: state.display,
          print: state.print,
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
    end
    
    def accumulate(method_name, *args)
      @script << "__simulator.#{method_name}.apply(__simulator, #{MultiJson.encode(args)})"
      execute
    end
  end
  
  def simulate(ambrosia)
    simulate_tml compile(ambrosia)
  end
  
  def simulate_tml(tml)
    @simulator = Ambrosia::Simulator::Instance.new tml
  end
  
  def simulator
    @simulator ||= simulate_tml tml
  end
  
  def tml
    if respond_to?(:last_response)
      last_response.body
    else
      response.body
    end
  end
end
