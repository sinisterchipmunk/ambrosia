module Guides
  CODE_ALIASES = %w(yaml shell ruby erb html sql plain js c)

  def self.code_aliases
    CODE_ALIASES.join("|")
  end
end
