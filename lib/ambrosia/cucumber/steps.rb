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

When /^I follow "([^"]*)"$/ do |link_caption|
  simulator.follow link_caption
end

When /^I swipe a (\w+) card$/ do |card_type|
  simulator.swipe_card card_type
end

When /^I fill in "([^"]*)" with \$(\d+)\.(\d+)$/ do |field, dollars, cents|
  pending # express the regexp above with the code you wish you had
end

Then /^the receipt should not be blank$/ do
  pending # express the regexp above with the code you wish you had
end

Then /^show me the current screen$/ do
  pending # express the regexp above with the code you wish you had
end

Then /^show me the receipt$/ do
  pending # express the regexp above with the code you wish you had
end
