A terminal scripting language with emphasis on terseness and readability. The scripting language compiles into TML code, which can be distributed to terminals via Incendo Online.

This scripting language is under heavy development. It is **NOT** considered a stable release. If you encounter an error and suspect it may be a bug originating within the framework itself, you can run the compiler with the `DEBUG` environment variable set. This will dump internal information to standard output and may help track down the source of the error.

Here are some of the features that the scripting language adds, beyond vastly reducing the amount of code necessary for terminal applications development:

## Type Inferencing

The type of any given variable is inferred by its context. For instance, in the following example, the variable +a+ will be set to an +integer+ type:

    a = 1
    
This simple example compiles into the following TML document:

    <tml xmlns="http://www.ingenico.co.uk/tml" cache="deny">
      <head>
        <defaults cancel="emb://embedded.tml" />
      </head>
      <vardcl name="a" type="integer" />
      <screen id="__main__">
        <setvar name="a" lo="1" />
      </screen>
    </tml>

### Type Warnings

Most values can be cast from integer to string and back. However, when combined with inferred types, this is usually not what you want because it can produce strings where you wanted integers and vice versa. Since there are legitimate use cases for type casting, the scripting language will simply print a warning instead of raising a fatal error. There are a few ways you can control this.

If you're _sure_ you want to allow type casting within a particular scope, you can suppress warnings within that scope using the `silence_warnings` method. Here's an example:

    init:
      silence_warnings() # no warnings will be raised in the `init` method
      one = 1
      two = "hello" + 1
      
    init()
    three = "hello" + 3 # a warning will be raised outside of the `init` method!

Note that this will also affect sub-scopes.

If you encounter warnings due to a bug in your code that you'd like to fix, it's usually helpful to have a backtrace available. To do this, you can cause would-be warnings to become errors that will be raised with backtrace information. To do this, use the `raise_warnings` method like so:

    init:
      raise_warnings() # warnings will be fatal in the `init` method
      two = "hello" + 1 # BOOM!
    
    three = "hello" + 3 # a non-fatal warning will be raised outside of `init`!
    init()

## Methods and Return Values

Methods are defined in one of two ways: with and without method arguments. A method without arguments can simply be the name of the method, followed by a colon, as the following example demonstrates:

    say_hello:
      return "Hello, World!"
      
The above code creates a +say_hello+ method that, when called, will display the classic "Hello, World!" string on the terminal.

If arguments are required by the method, they are listed in parentheses like so:

    say_hello_to(name):
      return "Hello, " + name

## Calling Methods

Method calls are denoted simply by the name of the method, followed by parentheses, like so:

    say_hello()
    say_hello_to("Colin")
    
If one or more arguments are supplied to the method, the parentheses can be omitted. In this case, the compiler will add them implicitly and the result will be the same:

    say_hello_to "Colin"
    
Note that if there are no arguments, the parentheses must be supplied in order to indicate that the reference is a method call (as opposed to a local variable name, for instance).

## Local Variables

In TML, all variables are normally global in scope to a particular TML document. The scripting language alters the names of local variables so that any given method essentially has scope local to the method itself. This allows methods to use variable names that would otherwise conflict with one another, as is the case in the following example:

    a_string: a = "hello"   # => local variable 'a' is a string
    a_integer: a = 1        # => local variable 'a' is an integer
    
If you wish to give a particular variable global scope, simply initialize it with some value at the top level of the script:

    a = 0
    a_integer: a = 1
    
## Method References

You can create a dynamic reference to any method by assigning the method name, prefixed with a colon, to a variable. Later, you can call a method represented by the variable it was assigned to simply by treating the variable itself as a method. Example:

    greeter = :say_hello
    greeter() #=> "Hello, World!"

## Closures

A closure is an anonymous method created on-the-fly. You can assign a closure to a variable and pass it into a method as an argument, or simply call it directly. Here's how to create a closure:

    closure = (count) -> return count + 1
    
Spanning multiple lines in a closure is allowed -- just indent the closure body like so:

    closure = (count) ->
      count++
      return count

Once created, a closure is no different from a method reference. To call the closure, simply call it as if it were a method (because it is!):

    closure 1 #=> 2
    
You can call a closure any number of times:

    closure = (count) -> return count + 1
    closure 1 #=> 2
    closure 2 #=> 3
    closure closure closure 3 #=> 6
    
All of the examples above show a closure that accepts a single argument, *count*. However, closures can also be created without arguments. As a shortcut, if a closure doesn't accept any arguments, you can omit the parenthetical entirely:

    closure = -> return 1 + 1
    closure()  #=> 2
    
Note that the parentheses are still required to actually _call_ the closure, however.

## Iteration

Iterators have been added to simplify handling data incrementally. The body of an iterator is just a closure, so each iterator has its own private scope. That is, a variable defined for the first time in an iterator block is local to that block.

### for [x] in [y]

You can iterate through characters in a string using ForIn:

    i = 0
    for ch in "hello"
      # ch == 'h', 'e', 'l', 'l', 'o'
      i++
    return i #=> 5
    
Iterating through a range of numbers is easy too:

    for i in [0..3]
      # i == 0, 1, 2, 3

To iterate through a range exclusively (that is, stopping at i < 3 instead of i == 3), do this:

    for i in [0...3]
      # i == 0, 1, 2

### for [x] of [y]

You can also iterate through list items using ForOf:

    i = 0
    for item of "one;two;three"
      # item == "one", "two", "three"
      i++
    return i #=> 3
    
IMPORTANT: Since a list is just a string delimited with semicolons, it's possible to use `ForIn` instead of `ForOf`, which would iterate through _characters in the string_ instead of _items in the list_. Be careful to use the correct iterator!

