# first, build coffee to js so that line numbers reported in error stacks actually mean something
coffee -c -o ./out ./lib/**/*.coffee ./lib/*.coffee
if [[ $? ]]
then
  # build was successful
  PATH=$PATH:./node_modules/jasmine-node/bin NODE_PATH=$NODE_PATH:./lib jasmine-node --coffee spec $*
else
  # build failed
  echo "Failed to compile sources"
fi
