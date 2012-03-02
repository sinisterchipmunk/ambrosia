module Ambrosia
  class TemplateHandler
    def self.erb_handler
      @@erb_handler ||= ActionView::Template.registered_template_handler(:erb)
    end

    def self.call(template)
      compiled_source = erb_handler.call(template)
      # Identifier contains the filename in most cases. If it does, and if the filename
      # is prefixed by an underscore, it's likely a partial and will be mixed into more
      # ambrosia source. So let's return the ambrosia source itself so it can be embedded
      # into the parent document, because we won't be able to parse out the TML (if it's even
      # valid in a global context). FIXME I hate doing this. Is there a better way?
      if File.basename(template.identifier)[0] == ?_
        compiled_source
      else
        "Ambrosia.compile(begin;#{compiled_source};end)"
      end
    end
  end
end

ActiveSupport.on_load(:action_view) do
  ActionView::Template.register_template_handler :ambrosia, Ambrosia::TemplateHandler
end
