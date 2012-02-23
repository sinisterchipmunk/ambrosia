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
        raise errors.join("; ")
      end

      xml
    end
  end
end
