When /^I press "([^"]*)"$/ do |key|
  simulator.press key
end

Then /^I should see:$/ do |table|
  table.hashes.each do |hash|
    hash.each do |caption, value|
      # this will produce some redundant checks but I don't think that's a problem
      simulator.state[:display].should include(caption)
      simulator.state[:display].should include(value)
    end
  end
end

When /^I enter "([^"]*)"$/ do |text|
  simulator.enter text
end

When /^I enter \$(\d+)\.(\d+)$/ do |dollars, cents|
  simulator.enter "#{dollars}#{cents.ljust(2, '0')}"
end

When /^I follow "([^"]*)"$/ do |link_caption|
  simulator.follow link_caption
end

When /^I swipe a (\w+) card$/ do |card_type|
  simulator.swipe_card card_type
end

When /^I fill in "([^"]*)" with \$(\d+)\.(\d+)$/ do |field, dollars, cents|
  simulator.fill_in field, "#{dollars}#{cents.ljust(2, '0')}"
end

Then /^the receipt should not be blank$/ do
  simulator.state[:print].should_not be_blank
end

Then /^the receipt should contain "([^"]*)"$/ do |content|
  simulator.state[:print].should include(content)
end

Then /^the receipt should contain:$/ do |table|
  table.hashes.each do |hash|
    hash.each do |caption, value|
      simulator.state[:print].should include(caption)
      simulator.state[:print].should include(value)
    end
  end
end

Then /^dump the terminal state$/ do
  pp simulator.state
end

Then /^show me the current screen element$/ do
  puts simulator.state[:screen][:element]
end

Then /^show me the screen$/ do
  puts simulator.state[:display]
end

Then /^show me the receipt$/ do
  puts simulator.state[:print]
end

Then /^show me the TML$/ do
  puts simulator.tml
end

Then /^show me the program flow$/ do
  puts simulator.state[:flow]
end
