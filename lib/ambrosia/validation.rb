require 'nokogiri'

module Ambrosia
  module Validation
    def validate(xml)
      path = File.expand_path('../tml.xsd', File.dirname(__FILE__))
      xsd = Nokogiri::XML::Schema(File.read path)
      doc = Nokogiri::XML(xml)

      errors = []
      xsd.validate(doc).each { |error| errors.push error.to_s }
      unless errors.empty?
        message = errors.join("; ")
        
        if defined?(Rails) and Rails.respond_to?(:logger) and Rails.logger
          Rails.logger.error "Invalid TML code:"
          Rails.logger.error xml
          Rails.logger.error message
        end
        
        raise message
      end

      xml
    end
  end
end
